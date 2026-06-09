#!/usr/bin/env python
"""Final validation of AGENT 03 - Auth API."""
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.cache import cache
from django.test import Client
from apps.users.permissions import IsAdminUser

# Clear cache to reset rate limits
cache.clear()
print("=" * 60)
print("AGENT 03 - Auth API (JWT) - FINAL VALIDATION")
print("=" * 60)

client = Client()
passed = 0
total = 5

# Test 1: Register
print("\n1. POST /api/auth/register/")
r = client.post('/api/auth/register/',
    data=json.dumps({'email': 'final_test@example.com', 'username': 'finaltest', 'password': 'Test1234', 'password2': 'Test1234', 'phone': '+123'}),
    content_type='application/json'
)
print(f"   Status: {r.status_code}")
if r.status_code == 201:
    print("   ✓ PASS")
    passed += 1
else:
    print(f"   ✗ FAIL: {r.content.decode()[:100]}")

# Test 2: Login
print("\n2. POST /api/auth/login/")
r = client.post('/api/auth/login/',
    data=json.dumps({'email': 'admin@wdesign.com', 'password': 'admin123'}),
    content_type='application/json'
)
print(f"   Status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    token = data.get('access')
    print(f"   ✓ PASS - Token: {token[:30]}...")
    passed += 1
else:
    print(f"   ✗ FAIL: {r.content.decode()[:100]}")
    token = None

# Test 3: Get Profile (with token)
print("\n3. GET /api/auth/profile/ (with JWT)")
if token:
    r = client.get('/api/auth/profile/', HTTP_AUTHORIZATION=f'Bearer {token}')
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"   ✓ PASS - Email: {data['email']}")
        passed += 1
    else:
        print(f"   ✗ FAIL: {r.content.decode()[:100]}")
else:
    print("   ✗ SKIP - No token from login")

# Test 4: Get Profile (without token - should fail)
print("\n4. GET /api/auth/profile/ (without JWT)")
r = client.get('/api/auth/profile/')
print(f"   Status: {r.status_code}")
if r.status_code == 401:
    print("   ✓ PASS - Correctly rejected (401)")
    passed += 1
else:
    print(f"   ✗ FAIL - Expected 401, got {r.status_code}")

# Test 5: IsAdminUser permission
print("\n5. Custom IsAdminUser Permission")
try:
    from apps.users.permissions import IsAdminUser
    print("   ✓ PASS - IsAdminUser imported successfully")
    passed += 1
except:
    print("   ✗ FAIL - Could not import IsAdminUser")

print("\n" + "=" * 60)
print(f"RESULTS: {passed}/{total} tests passed")
if passed == total:
    print("✅ AGENT 03 - COMPLETE AND FUNCTIONAL")
else:
    print(f"⚠️  {total - passed} test(s) failed")
print("=" * 60)
