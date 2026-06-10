#!/usr/bin/env python
"""Validation script for AGENT 06 - FedaPay payments."""
import os
import uuid
from decimal import Decimal
from unittest.mock import patch

import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.orders.models import Order, OrderItem
from apps.payments.models import Payment
from apps.products.models import Product


class FakeResponse:
    def __init__(self, payload, status_code=200):
        self._payload = payload
        self.status_code = status_code

    def json(self):
        return self._payload


def print_result(label, passed, detail=''):
    status = 'PASS' if passed else 'FAIL'
    suffix = f' - {detail}' if detail else ''
    print(f'{label}: {status}{suffix}')
    return 1 if passed else 0


def create_product():
    unique_tag = uuid.uuid4().hex[:8]
    return Product.objects.create(
        name=f'Agent 06 Product {unique_tag}',
        slug=f'agent-06-product-{unique_tag}',
        description='Product used for Agent 06 payment validation',
        price=Decimal('5000.00'),
        stock=20,
        is_active=True,
    )


def create_order(product, quantity, label):
    unique_tag = uuid.uuid4().hex[:8]
    order = Order.objects.create(
        user=None,
        name=f'{label} Buyer',
        email=f'{label}-{unique_tag}@example.com',
        phone='+22890000000',
        delivery_address='Cotonou, Benin',
        status='PENDING',
        total_amount=product.price * quantity,
    )
    OrderItem.objects.create(
        order=order,
        product=product,
        quantity=quantity,
        unit_price=product.price,
    )
    return order


def create_payment_payload(reference):
    return {
        'data': {
            'id': f'tx-{reference[-6:]}',
            'merchant_reference': reference,
            'payment_url': f'https://checkout.example/{reference}',
            'token': f'token-{reference[-6:]}',
            'status': 'pending',
        },
    }


def approved_transaction_payload(reference):
    return {
        'data': {
            'id': f'tx-{reference[-6:]}',
            'merchant_reference': reference,
            'status': 'approved',
        },
    }


def declined_transaction_payload(reference):
    return {
        'data': {
            'id': f'tx-{reference[-6:]}',
            'merchant_reference': reference,
            'status': 'declined',
        },
    }


def main():
    print('=' * 60)
    print('AGENT 06 - Payments API - VALIDATION')
    print('=' * 60)

    client = APIClient()
    client.raise_request_exception = False

    product = create_product()
    original_stock = product.stock

    passed = 0
    total = 5

    # 1. Initiate payment with mocked FedaPay response
    init_order = create_order(product, quantity=3, label='init')
    captured_reference = {'value': None}

    def fake_request(method, url, json=None, headers=None, timeout=None):
        if method == 'POST' and url.endswith('/transactions'):
            captured_reference['value'] = json.get('merchant_reference')
            assert isinstance(json.get('amount'), int), f"Expected integer amount, got {json.get('amount')!r}"
            return FakeResponse(create_payment_payload(captured_reference['value']))
        raise AssertionError(f'Unexpected request for init test: {method} {url}')

    with patch('apps.payments.views.requests.request', side_effect=fake_request):
        response = client.post('/api/payments/initiate/', {'order_id': init_order.id}, format='json')

    init_data = response.json() if response.status_code in (200, 201) else {}
    payment = Payment.objects.filter(order=init_order).first()
    ok = (
        response.status_code == 201
        and bool(init_data.get('payment_url'))
        and init_data.get('transaction_id') == captured_reference['value']
        and payment is not None
        and payment.status == 'PENDING'
        and payment.fedapay_transaction_id == init_data.get('transaction_id')
        and payment.fedapay_payment_token == f"token-{init_data.get('transaction_id')[-6:]}"
    )
    passed += print_result('1) POST /api/payments/initiate/', ok, f'status={response.status_code}')

    if not payment:
        print('Aborting remaining checks because payment initiation failed.')
        print(f'RESULT: {passed}/{total} tests passed')
        return

    reference = payment.fedapay_transaction_id

    # 2. Approved webhook confirms the order and decrements stock
    def fake_request_approved(method, url, json=None, headers=None, timeout=None):
        if method == 'GET' and (
            url.endswith(f'/transactions/{reference}')
            or url.endswith(f'/transactions/merchant/{reference}')
        ):
            return FakeResponse(approved_transaction_payload(reference))
        raise AssertionError(f'Unexpected request for webhook success test: {method} {url}')

    with patch('apps.payments.views.requests.request', side_effect=fake_request_approved):
        response = client.post('/api/payments/webhook/', {'merchant_reference': reference}, format='json')

    payment.refresh_from_db()
    init_order.refresh_from_db()
    product.refresh_from_db()
    ok = (
        response.status_code == 200
        and payment.status == 'SUCCESS'
        and init_order.status == 'CONFIRMED'
        and product.stock == original_stock - 3
    )
    passed += print_result('2) POST /api/payments/webhook/ (approved)', ok, f'status={response.status_code}')

    # 3. Duplicate approved webhook must stay idempotent
    with patch('apps.payments.views.requests.request', side_effect=fake_request_approved):
        response = client.post('/api/payments/webhook/', {'merchant_reference': reference}, format='json')

    payment.refresh_from_db()
    init_order.refresh_from_db()
    product.refresh_from_db()
    ok = (
        response.status_code == 200
        and payment.status == 'SUCCESS'
        and init_order.status == 'CONFIRMED'
        and product.stock == original_stock - 3
    )
    passed += print_result('3) POST /api/payments/webhook/ (duplicate)', ok, f'status={response.status_code}')

    # 4. Declined webhook cancels the order without touching stock
    refused_order = create_order(product, quantity=2, label='refused')

    def fake_request_declined(method, url, json=None, headers=None, timeout=None):
        if method == 'POST' and url.endswith('/transactions'):
            refused_reference = json.get('merchant_reference')
            return FakeResponse(create_payment_payload(refused_reference))
        if method == 'GET' and '/transactions/' in url:
            refused_reference = url.rsplit('/', 1)[-1]
            return FakeResponse(declined_transaction_payload(refused_reference))
        raise AssertionError(f'Unexpected request for refused test: {method} {url}')

    with patch('apps.payments.views.requests.request', side_effect=fake_request_declined):
        response = client.post('/api/payments/initiate/', {'order_id': refused_order.id}, format='json')

    refused_payment = Payment.objects.filter(order=refused_order).first()
    with patch('apps.payments.views.requests.request', side_effect=fake_request_declined):
        response = client.post(
            '/api/payments/webhook/',
            {'merchant_reference': refused_payment.fedapay_transaction_id},
            format='json',
        )

    refused_order.refresh_from_db()
    product.refresh_from_db()
    refused_payment.refresh_from_db()
    ok = (
        response.status_code == 200
        and refused_payment.status == 'FAILED'
        and refused_order.status == 'CANCELLED'
        and product.stock == original_stock - 3
    )
    passed += print_result('4) POST /api/payments/webhook/ (declined)', ok, f'status={response.status_code}')

    # 5. Payment timeout is handled cleanly
    timeout_order = create_order(product, quantity=1, label='timeout')

    def fake_timeout_request(method, url, json=None, headers=None, timeout=None):
        if method == 'POST' and url.endswith('/transactions'):
            raise requests.Timeout('Gateway timeout')
        raise AssertionError(f'Unexpected request for timeout test: {method} {url}')

    with patch('apps.payments.views.requests.request', side_effect=fake_timeout_request):
        response = client.post('/api/payments/initiate/', {'order_id': timeout_order.id}, format='json')

    timeout_payment = Payment.objects.filter(order=timeout_order).first()
    ok = response.status_code == 504 and timeout_payment is None
    passed += print_result('5) POST /api/payments/initiate/ (timeout)', ok, f'status={response.status_code}')

    print('=' * 60)
    print(f'RESULT: {passed}/{total} tests passed')
    print('=' * 60)


if __name__ == '__main__':
    main()
