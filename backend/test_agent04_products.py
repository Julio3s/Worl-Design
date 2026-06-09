#!/usr/bin/env python
"""Validation script for AGENT 04 - Products API."""
import os
import django
import uuid
from unittest.mock import patch

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from cloudinary import CloudinaryResource
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from apps.products.models import Category, Product


def print_result(label, passed, detail=''):
    status = 'PASS' if passed else 'FAIL'
    suffix = f' - {detail}' if detail else ''
    print(f'{label}: {status}{suffix}')
    return 1 if passed else 0


def ensure_admin_user():
    User = get_user_model()
    user, _ = User.objects.get_or_create(
        email='admin@wdesign.com',
        defaults={
            'username': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'is_admin_user': True,
        },
    )
    user.username = 'admin'
    user.is_staff = True
    user.is_superuser = True
    user.is_admin_user = True
    user.set_password('admin123')
    user.save()
    return user


def ensure_category():
    category, _ = Category.objects.get_or_create(
        slug='agent-04-category',
        defaults={'name': 'Agent 04 Category'},
    )
    if category.name != 'Agent 04 Category':
        category.name = 'Agent 04 Category'
        category.save()
    return category


def make_fake_resource(public_id):
    return CloudinaryResource(
        public_id=public_id,
        version='1',
        format='jpg',
        type='upload',
        resource_type='image',
    )


def main():
    print('=' * 60)
    print('AGENT 04 - Products API - VALIDATION')
    print('=' * 60)

    ensure_admin_user()
    category = ensure_category()
    unique_tag = uuid.uuid4().hex[:8]

    client = APIClient()
    anon_client = APIClient()
    client.raise_request_exception = False
    anon_client.raise_request_exception = False
    passed = 0
    total = 8

    # 1. Public categories endpoint
    response = client.get('/api/products/categories/')
    ok = response.status_code == 200 and any(
        item.get('slug') == category.slug for item in response.json()
    )
    passed += print_result('1) GET /api/products/categories/', ok, f'status={response.status_code}')

    # 2. Admin route should reject anonymous access
    response = anon_client.get('/api/admin/products/')
    ok = response.status_code in (401, 403)
    passed += print_result('2) GET /api/admin/products/ (anon)', ok, f'status={response.status_code}')

    # 3. Login and get admin token
    response = client.post(
        '/api/auth/login/',
        {'email': 'admin@wdesign.com', 'password': 'admin123'},
        format='json',
    )
    token = response.json().get('access') if response.status_code == 200 else None
    ok = response.status_code == 200 and bool(token)
    passed += print_result('3) POST /api/auth/login/', ok, f'status={response.status_code}')
    if not token:
        print('Aborting remaining checks because login failed.')
        print(f'RESULT: {passed}/{total} tests passed')
        return

    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    # 4. Create a product with image upload
    image_file = SimpleUploadedFile(
        'agent04-product.jpg',
        b'fake-image-content',
        content_type='image/jpeg',
    )
    create_payload = {
        'name': f'Agent 04 Demo Product {unique_tag}',
        'slug': f'agent-04-demo-product-{unique_tag}',
        'description': 'Product created during Agent 04 validation',
        'price': '12500.00',
        'stock': '18',
        'category': str(category.id),
        'is_active': 'true',
        'is_featured': 'true',
        'is_customizable': 'true',
        'customization_hint': 'Type your custom text here',
        'image': image_file,
    }

    fake_create_resource = make_fake_resource(f'products/agent04-demo-create-{unique_tag}')
    with patch('cloudinary.uploader.upload_resource', return_value=fake_create_resource):
        response = client.post('/api/admin/products/', create_payload, format='multipart')

    created_data = response.json() if response.status_code in (200, 201) else {}
    product_id = created_data.get('id')
    product_slug = created_data.get('slug')
    ok = response.status_code == 201 and bool(product_id) and bool(product_slug)
    passed += print_result('4) POST /api/admin/products/', ok, f'status={response.status_code}')

    if not product_id or not product_slug:
        print('Aborting remaining checks because product creation failed.')
        print(f'RESULT: {passed}/{total} tests passed')
        return

    # 5. Public list filtered by category returns the product
    response = client.get(f'/api/products/?category={category.slug}')
    payload = response.json()
    ok = response.status_code == 200 and any(
        item.get('slug') == product_slug for item in payload.get('results', [])
    )
    passed += print_result('5) GET /api/products/?category=...', ok, f'status={response.status_code}')

    # 6. Public detail by slug returns the same product
    response = client.get(f'/api/products/{product_slug}/')
    payload = response.json()
    ok = response.status_code == 200 and payload.get('slug') == product_slug
    passed += print_result('6) GET /api/products/:slug/', ok, f'status={response.status_code}')

    # 7. Update the product and upload a new image
    update_file = SimpleUploadedFile(
        'agent04-product-update.jpg',
        b'updated-fake-image-content',
        content_type='image/jpeg',
    )
    update_payload = {
        'name': f'Agent 04 Demo Product Updated {unique_tag}',
        'price': '13900.00',
        'stock': '22',
        'image': update_file,
    }

    fake_update_resource = make_fake_resource(f'products/agent04-demo-update-{unique_tag}')
    with patch('cloudinary.uploader.upload_resource', return_value=fake_update_resource):
        response = client.patch(
            f'/api/admin/products/{product_id}/',
            update_payload,
            format='multipart',
        )

    updated_data = response.json() if response.status_code == 200 else {}
    ok = response.status_code == 200 and updated_data.get('name') == f'Agent 04 Demo Product Updated {unique_tag}'
    passed += print_result('7) PATCH /api/admin/products/:id/', ok, f'status={response.status_code}')

    # 8. Delete should deactivate, not remove from DB
    response = client.delete(f'/api/admin/products/{product_id}/')
    product = Product.objects.get(pk=product_id)
    ok = response.status_code == 200 and product.is_active is False
    passed += print_result('8) DELETE /api/admin/products/:id/', ok, f'status={response.status_code}')

    print('=' * 60)
    print(f'RESULT: {passed}/{total} tests passed')
    print('=' * 60)


if __name__ == '__main__':
    main()
