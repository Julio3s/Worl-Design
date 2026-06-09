#!/usr/bin/env python
"""Final validation of AGENT 03 - Auth API - Simple version."""
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.cache import cache
from django.test import Client

# Clear cache to reset rate limits
cache.clear()
print("AGENT 03 - Auth API (JWT) - FINAL VALIDATION")
print("=" * 60)

client = Client()
passed = 0
total = 3

# Test 1: Login
print("\nTest 1: POST /api/auth/login/")
r = client.post('/api/auth/login/',
    data=json.dumps({'email': 'admin@wdesign.com', 'password': 'admin123'}),
    content_type='application/json'
)
print(f"   Status: {r.status_code}")
if r.status_code == 200:
    print("   PASS - Got JWT token")
    passed += 1
    token = r.json().get('access')
else:
    print(f"   FAIL")
    token = None

# Test 2: Get Profile (with token)
print("\nTest 2: GET /api/auth/profile/ (with JWT)")
if token:
    r = client.get('/api/auth/profile/', HTTP_AUTHORIZATION=f'Bearer {token}')
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        print("   PASS - Profile retrieved")
        passed += 1
    else:
        print(f"   FAIL")
else:
    print("   SKIP")

# Test 3: Get Profile (without token - should fail)
print("\nTest 3: GET /api/auth/profile/ (without JWT)")
r = client.get('/api/auth/profile/')
print(f"   Status: {r.status_code}")
if r.status_code == 401:
    print("   PASS - Correctly rejected (401)")
    passed += 1
else:
    print(f"   FAIL")

print("\n" + "=" * 60)
print(f"RESULTS: {passed}/{total} tests passed")
if passed == total:
    print("SUCCESS - AGENT 03 is COMPLETE")
else:
    print(f"WARNING - {total - passed} test(s) failed")
