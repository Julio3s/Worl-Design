#!/usr/bin/env python
"""Validation script for AGENT 05 - Categories API."""
import os
import django
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.products.models import Category


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


def main():
    print('=' * 60)
    print('AGENT 05 - Categories API - VALIDATION')
    print('=' * 60)

    ensure_admin_user()
    unique_tag = uuid.uuid4().hex[:8]

    client = APIClient()
    anon_client = APIClient()
    client.raise_request_exception = False
    anon_client.raise_request_exception = False
    passed = 0
    total = 6

    # 1. Public categories endpoint should respond
    response = client.get('/api/products/categories/')
    ok = response.status_code == 200 and isinstance(response.json(), list)
    passed += print_result('1) GET /api/products/categories/', ok, f'status={response.status_code}')

    # 2. Admin route should reject anonymous access
    response = anon_client.get('/api/admin/categories/')
    ok = response.status_code in (401, 403)
    passed += print_result('2) GET /api/admin/categories/ (anon)', ok, f'status={response.status_code}')

    # 3. Login
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

    # 4. Create category using a Cloudinary public ID
    create_payload = {
        'name': f'Agent 05 Category {unique_tag}',
        'slug': f'agent-05-category-{unique_tag}',
        'image_public_id': 'YKAdWXVIA8s_DyRFcv6w2CgstYQ',
    }
    response = client.post('/api/admin/categories/', create_payload, format='json')

    created_data = response.json() if response.status_code in (200, 201) else {}
    category_id = created_data.get('id')
    category_slug = created_data.get('slug')
    ok = response.status_code == 201 and bool(category_id) and bool(category_slug)
    passed += print_result('4) POST /api/admin/categories/', ok, f'status={response.status_code}')

    if not category_id or not category_slug:
        print('Aborting remaining checks because category creation failed.')
        print(f'RESULT: {passed}/{total} tests passed')
        return

    # 5. Update category using another public ID
    update_payload = {
        'name': f'Agent 05 Category Updated {unique_tag}',
        'slug': f'agent-05-category-updated-{unique_tag}',
        'image_public_id': 'YKAdWXVIA8s_DyRFcv6w2CgstYQ',
    }
    response = client.put(
        f'/api/admin/categories/{category_id}/',
        update_payload,
        format='json',
    )

    updated_data = response.json() if response.status_code == 200 else {}
    ok = response.status_code == 200 and updated_data.get('name') == f'Agent 05 Category Updated {unique_tag}'
    passed += print_result('5) PATCH /api/admin/categories/:id/', ok, f'status={response.status_code}')

    # 6. Delete category
    response = client.delete(f'/api/admin/categories/{category_id}/')
    ok = response.status_code == 200 and not Category.objects.filter(pk=category_id).exists()
    passed += print_result('6) DELETE /api/admin/categories/:id/', ok, f'status={response.status_code}')

    print('=' * 60)
    print(f'RESULT: {passed}/{total} tests passed')
    print('=' * 60)


if __name__ == '__main__':
    main()
