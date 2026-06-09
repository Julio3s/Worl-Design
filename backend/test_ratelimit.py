#!/usr/bin/env python
"""Test Rate Limiting on Auth endpoints."""
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client

client = Client()

print("=" * 60)
print("Testing Rate Limiting (5/minute on login, 3/minute on register)")
print("=" * 60)

# Test Login Rate Limiting (5/minute)
print("\n🧪 Test: Login Rate Limiting (5/minute per IP)")
for i in range(7):
    response = client.post('/api/auth/login/',
        data=json.dumps({
            'email': 'admin@wdesign.com',
            'password': 'admin123'
        }),
        content_type='application/json'
    )
    if response.status_code == 429:
        print(f"  Attempt {i+1}: Status {response.status_code} ✓ Rate limited (expected after 5 attempts)")
        break
    elif response.status_code == 200:
        print(f"  Attempt {i+1}: Status {response.status_code} ✓ OK")
    else:
        print(f"  Attempt {i+1}: Status {response.status_code}")

# Test Register Rate Limiting (3/minute)
print("\n🧪 Test: Register Rate Limiting (3/minute per IP)")
for i in range(5):
    response = client.post('/api/auth/register/',
        data=json.dumps({
            'email': f'user{i}@example.com',
            'username': f'user{i}',
            'password': 'SecurePass123',
            'password2': 'SecurePass123',
            'phone': '+1234567890'
        }),
        content_type='application/json'
    )
    if response.status_code == 429:
        print(f"  Attempt {i+1}: Status {response.status_code} ✓ Rate limited (expected after 3 attempts)")
        break
    elif response.status_code == 201:
        print(f"  Attempt {i+1}: Status {response.status_code} ✓ User created")
    elif response.status_code == 400:
        print(f"  Attempt {i+1}: Status {response.status_code} (validation error, but not rate limited)")
    else:
        print(f"  Attempt {i+1}: Status {response.status_code}")

print("\n" + "=" * 60)
print("Rate limiting tests completed!")
print("=" * 60)
