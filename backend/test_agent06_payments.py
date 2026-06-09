#!/usr/bin/env python
"""Validation script for AGENT 06 - CinetPay payments."""
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


def payment_init_payload(transaction_id):
    return {
        'code': '201',
        'message': 'CREATED',
        'data': {
            'payment_token': f'token-{transaction_id[-6:]}',
            'payment_url': f'https://checkout.example/{transaction_id}',
        },
    }


def accepted_check_payload():
    return {
        'code': '00',
        'message': 'SUCCES',
        'data': {
            'status': 'ACCEPTED',
        },
    }


def refused_check_payload():
    return {
        'code': '00',
        'message': 'SUCCES',
        'data': {
            'status': 'REFUSED',
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

    # 1. Initiate payment with mocked CinetPay response
    init_order = create_order(product, quantity=3, label='init')
    captured_transaction = {'value': None}

    def fake_init_post(url, json=None, headers=None, timeout=None):
        if url.endswith('/v2/payment'):
            transaction_id = json.get('transaction_id')
            captured_transaction['value'] = transaction_id
            return FakeResponse(payment_init_payload(transaction_id))
        raise AssertionError(f'Unexpected URL for init test: {url}')

    with patch('apps.payments.views.requests.post', side_effect=fake_init_post):
        response = client.post('/api/payments/initiate/', {'order_id': init_order.id}, format='json')

    init_data = response.json() if response.status_code in (200, 201) else {}
    payment = Payment.objects.filter(order=init_order).first()
    ok = (
        response.status_code == 201
        and bool(init_data.get('payment_url'))
        and init_data.get('transaction_id') == captured_transaction['value']
        and payment is not None
        and payment.status == 'PENDING'
        and payment.cinetpay_transaction_id == init_data.get('transaction_id')
        and payment.cinetpay_payment_token == f"token-{init_data.get('transaction_id')[-6:]}"
    )
    passed += print_result('1) POST /api/payments/initiate/', ok, f'status={response.status_code}')

    if not payment:
        print('Aborting remaining checks because payment initiation failed.')
        print(f'RESULT: {passed}/{total} tests passed')
        return

    transaction_id = payment.cinetpay_transaction_id

    # 2. Accepted webhook confirms the order and decrements stock
    def fake_check_post(url, json=None, headers=None, timeout=None):
        if url.endswith('/v2/payment/check'):
            return FakeResponse(accepted_check_payload())
        raise AssertionError(f'Unexpected URL for webhook success test: {url}')

    with patch('apps.payments.views.requests.post', side_effect=fake_check_post):
        response = client.post('/api/payments/webhook/', {'transaction_id': transaction_id}, format='json')

    payment.refresh_from_db()
    init_order.refresh_from_db()
    product.refresh_from_db()
    ok = (
        response.status_code == 200
        and payment.status == 'SUCCESS'
        and init_order.status == 'CONFIRMED'
        and product.stock == original_stock - 3
    )
    passed += print_result('2) POST /api/payments/webhook/ (accepted)', ok, f'status={response.status_code}')

    # 3. Duplicate accepted webhook must stay idempotent
    with patch('apps.payments.views.requests.post', side_effect=fake_check_post):
        response = client.post('/api/payments/webhook/', {'cpm_trans_id': transaction_id}, format='json')

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

    # 4. Refused webhook cancels the order without touching stock
    refused_order = create_order(product, quantity=2, label='refused')

    def fake_refused_init_post(url, json=None, headers=None, timeout=None):
        if url.endswith('/v2/payment'):
            transaction_id_local = json.get('transaction_id')
            return FakeResponse(payment_init_payload(transaction_id_local))
        if url.endswith('/v2/payment/check'):
            return FakeResponse(refused_check_payload())
        raise AssertionError(f'Unexpected URL for refused test: {url}')

    with patch('apps.payments.views.requests.post', side_effect=fake_refused_init_post):
        response = client.post('/api/payments/initiate/', {'order_id': refused_order.id}, format='json')

    refused_payment = Payment.objects.filter(order=refused_order).first()
    with patch('apps.payments.views.requests.post', side_effect=fake_refused_init_post):
        response = client.post(
            '/api/payments/webhook/',
            {'transaction_id': refused_payment.cinetpay_transaction_id},
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
    passed += print_result('4) POST /api/payments/webhook/ (refused)', ok, f'status={response.status_code}')

    # 5. Payment timeout is handled cleanly
    timeout_order = create_order(product, quantity=1, label='timeout')

    def fake_timeout_post(url, json=None, headers=None, timeout=None):
        if url.endswith('/v2/payment'):
            raise requests.Timeout('Gateway timeout')
        raise AssertionError(f'Unexpected URL for timeout test: {url}')

    with patch('apps.payments.views.requests.post', side_effect=fake_timeout_post):
        response = client.post('/api/payments/initiate/', {'order_id': timeout_order.id}, format='json')

    timeout_payment = Payment.objects.filter(order=timeout_order).first()
    ok = response.status_code == 504 and timeout_payment is None
    passed += print_result('5) POST /api/payments/initiate/ (timeout)', ok, f'status={response.status_code}')

    print('=' * 60)
    print(f'RESULT: {passed}/{total} tests passed')
    print('=' * 60)


if __name__ == '__main__':
    main()
