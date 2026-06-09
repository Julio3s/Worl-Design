#!/usr/bin/env python
"""Test Auth API endpoints."""
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model

User = get_user_model()
client = Client()

print("=" * 60)
print("Testing Auth API Endpoints")
print("=" * 60)

# Test 1: Register new user
print("\n✅ Test 1: POST /api/auth/register/")
response = client.post('/api/auth/register/', 
    data=json.dumps({
        'email': 'newuser@example.com',
        'username': 'newuser',
        'password': 'SecurePass123',
        'password2': 'SecurePass123',
        'phone': '+1234567890'
    }),
    content_type='application/json'
)
print(f"   Status: {response.status_code}")
if response.status_code == 201:
    print("   ✓ User created successfully")
else:
    print(f"   Response: {response.content.decode()[:200]}")

# Test 2: Login
print("\n✅ Test 2: POST /api/auth/login/")
response = client.post('/api/auth/login/',
    data=json.dumps({
        'email': 'admin@wdesign.com',
        'password': 'admin123'
    }),
    content_type='application/json'
)
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"   ✓ Login successful")
    print(f"   - Access token: {data['access'][:50]}...")
    print(f"   - Refresh token: {data['refresh'][:50]}...")
    print(f"   - User: {data['user']['email']}")
    access_token = data['access']
else:
    print(f"   Error: {response.content.decode()}")
    access_token = None

# Test 3: Get Profile (with JWT)
if access_token:
    print("\n✅ Test 3: GET /api/auth/profile/ (with JWT)")
    response = client.get('/api/auth/profile/',
        HTTP_AUTHORIZATION=f'Bearer {access_token}'
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Profile retrieved")
        print(f"   - Email: {data['email']}")
        print(f"   - is_admin_user: {data['is_admin_user']}")
    else:
        print(f"   Error: {response.content.decode()}")

# Test 4: Unauthorized access (no JWT)
print("\n✅ Test 4: GET /api/auth/profile/ (no JWT - should fail)")
response = client.get('/api/auth/profile/')
print(f"   Status: {response.status_code}")
if response.status_code == 401:
    print("   ✓ Correctly rejected (401 Unauthorized)")
else:
    print(f"   Error: Expected 401, got {response.status_code}")

# Test 5: Logout
if access_token:
    print("\n✅ Test 5: POST /api/auth/logout/")
    response = client.post('/api/auth/logout/',
        HTTP_AUTHORIZATION=f'Bearer {access_token}'
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✓ Logout successful")
    else:
        print(f"   Error: {response.content.decode()}")

print("\n" + "=" * 60)
print("Auth API tests completed!")
print("=" * 60)
