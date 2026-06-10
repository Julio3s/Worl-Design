#!/usr/bin/env python
"""Validation script for AGENT 05 - Orders API."""
import os
import uuid
from decimal import Decimal
from unittest.mock import patch

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from cloudinary import CloudinaryResource
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from apps.orders.models import Order
from apps.products.models import Product


def print_result(label, passed, detail=''):
    status = 'PASS' if passed else 'FAIL'
    suffix = f' - {detail}' if detail else ''
    print(f'{label}: {status}{suffix}')
    return 1 if passed else 0


def make_fake_resource(public_id):
    return CloudinaryResource(
        public_id=public_id,
        version='1',
        format='pdf',
        type='upload',
        resource_type='raw',
    )


def create_product():
    unique_tag = uuid.uuid4().hex[:8]
    return Product.objects.create(
        name=f'Agent 05 Product {unique_tag}',
        slug=f'agent-05-product-{unique_tag}',
        description='Product used for Agent 05 order validation',
        price=Decimal('12500.00'),
        stock=20,
        is_customizable=True,
        customization_hint='Add your custom text here',
    )


def create_user(email, username, password, is_admin=False):
    User = get_user_model()
    user = User.objects.create_user(
        email=email,
        username=username,
        password=password,
        phone='+22890000000',
        address='Cotonou, Benin',
        first_name='World',
        last_name='Design',
    )
    user.is_admin_user = is_admin
    user.is_staff = is_admin
    if is_admin:
        user.is_superuser = False
    user.save()
    return user


def login(client, email, password):
    response = client.post(
        '/api/auth/login/',
        {'email': email, 'password': password},
        format='json',
    )
    if response.status_code != 200:
        return None, response
    return response.json().get('access'), response


def main():
    print('=' * 60)
    print('AGENT 05 - Orders API - VALIDATION')
    print('=' * 60)

    client = APIClient()
    admin_client = APIClient()
    guest_client = APIClient()
    client.raise_request_exception = False
    admin_client.raise_request_exception = False
    guest_client.raise_request_exception = False

    product = create_product()
    original_stock = product.stock

    guest_email = f'guest-{uuid.uuid4().hex[:8]}@example.com'
    guest_phone = '+22890001234'
    guest_name = 'Guest Buyer'
    guest_address = 'Route de la plage, Cotonou'
    guest_file = SimpleUploadedFile(
        'guest-logo.pdf',
        b'%PDF-1.4 fake pdf content',
        content_type='application/pdf',
    )

    admin_email = f'admin-{uuid.uuid4().hex[:8]}@example.com'
    customer_email = f'customer-{uuid.uuid4().hex[:8]}@example.com'
    admin_username = f'agent05admin-{uuid.uuid4().hex[:6]}'
    customer_username = f'agent05customer-{uuid.uuid4().hex[:6]}'
    admin_password = 'Admin1234'
    customer_password = 'Customer1234'

    admin_user = create_user(admin_email, admin_username, admin_password, is_admin=True)
    customer_user = create_user(customer_email, customer_username, customer_password, is_admin=False)

    passed = 0
    total = 8

    # 1. Guest order creation with custom file
    guest_payload = {
        'name': guest_name,
        'email': guest_email,
        'phone': guest_phone,
        'delivery_address': guest_address,
        'note': 'Please handle with care',
        'items[0][product_id]': str(product.id),
        'items[0][quantity]': '2',
        'items[0][custom_text]': 'My custom message',
        'items[0][custom_file]': guest_file,
    }

    fake_guest_resource = make_fake_resource(f'orders/guest-file-{uuid.uuid4().hex[:8]}')
    with patch('cloudinary.uploader.upload_resource', return_value=fake_guest_resource):
        response = guest_client.post('/api/orders/', guest_payload, format='multipart')

    guest_order_data = response.json() if response.status_code in (200, 201) else {}
    guest_order_id = guest_order_data.get('id')
    guest_order_number = guest_order_data.get('id')
    ok = (
        response.status_code == 201
        and guest_order_data.get('status') == 'PENDING'
        and guest_order_data.get('name') == guest_name
        and guest_order_data.get('email') == guest_email
    )
    passed += print_result('1) POST /api/orders/ (guest)', ok, f'status={response.status_code}')

    if not guest_order_id:
        print('Aborting remaining checks because guest order creation failed.')
        print(f'RESULT: {passed}/{total} tests passed')
        return

    order = Order.objects.get(pk=guest_order_id)
    order_item = order.items.first()
    product.refresh_from_db()
    ok = (
        order.status == 'PENDING'
        and product.stock == original_stock
        and bool(order_item.custom_file)
    )
    passed += print_result('2) Guest order does not decrement stock', ok, f'stock={product.stock}')

    # 3. Search guest order by email + phone
    response = guest_client.get(
        '/api/orders/search/',
        {'email': guest_email, 'phone': guest_phone},
    )
    search_data = response.json() if response.status_code == 200 else {}
    ok = response.status_code == 200 and search_data.get('id') == guest_order_id
    passed += print_result('3) GET /api/orders/search/', ok, f'status={response.status_code}')

    # 4. Anonymous access to guest order detail should be denied
    response = guest_client.get(f'/api/orders/{guest_order_id}/')
    ok = response.status_code in (401, 403)
    passed += print_result('4) GET /api/orders/:id/ (anon)', ok, f'status={response.status_code}')

    # 5. Admin can access guest order detail
    admin_token, login_response = login(admin_client, admin_email, admin_password)
    ok = login_response.status_code == 200 and bool(admin_token)
    passed += print_result('5) POST /api/auth/login/ (admin)', ok, f'status={login_response.status_code}')
    if not admin_token:
        print('Aborting remaining checks because admin login failed.')
        print(f'RESULT: {passed}/{total} tests passed')
        return

    admin_client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
    response = admin_client.get(f'/api/orders/{guest_order_id}/')
    ok = response.status_code == 200 and response.json().get('id') == guest_order_id
    passed += print_result('6) GET /api/orders/:id/ (admin)', ok, f'status={response.status_code}')

    # 7. Authenticated checkout with profile fallback
    customer_token, login_response = login(client, customer_email, customer_password)
    ok = login_response.status_code == 200 and bool(customer_token)
    passed += print_result('7) POST /api/auth/login/ (customer)', ok, f'status={login_response.status_code}')
    if not customer_token:
        print('Aborting remaining checks because customer login failed.')
        print(f'RESULT: {passed}/{total} tests passed')
        return

    client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
    auth_payload = {
        'note': 'Deliver to the office',
        'items[0][product_id]': str(product.id),
        'items[0][quantity]': '1',
        'items[0][custom_text]': 'Office badge engraving',
    }
    response = client.post('/api/orders/', auth_payload, format='multipart')
    auth_order_data = response.json() if response.status_code in (200, 201) else {}
    auth_order_id = auth_order_data.get('id')
    ok = (
        response.status_code == 201
        and auth_order_data.get('status') == 'PENDING'
        and auth_order_data.get('user') == customer_user.id
        and auth_order_data.get('email') == customer_email
    )
    passed += print_result('8) POST /api/orders/ (authenticated)', ok, f'status={response.status_code}')

    if auth_order_id:
        response = client.get('/api/orders/mine/')
        mine_data = response.json() if response.status_code == 200 else []
        results = mine_data.get('results', []) if isinstance(mine_data, dict) else mine_data
        ok = response.status_code == 200 and any(item.get('id') == auth_order_id for item in results)
        passed += print_result('9) GET /api/orders/mine/', ok, f'status={response.status_code}')

        response = client.get(f'/api/orders/{auth_order_id}/')
        ok = response.status_code == 200 and response.json().get('id') == auth_order_id
        passed += print_result('10) GET /api/orders/:id/ (owner)', ok, f'status={response.status_code}')

    product.refresh_from_db()
    ok = product.stock == original_stock
    passed += print_result('11) Stock remains unchanged after order creation', ok, f'stock={product.stock}')

    print('=' * 60)
    print(f'RESULT: {passed}/11 tests passed')
    print('=' * 60)


if __name__ == '__main__':
    main()
