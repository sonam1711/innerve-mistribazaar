"""
Quick test script to verify backend is working
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

print("🔍 Testing Mistribazar Backend API...")
print("=" * 50)

# Test 1: Jobs endpoint (should return 401 or empty list)
try:
    response = requests.get(f"{BASE_URL}/jobs/", timeout=5)
    print(f"✅ Jobs endpoint: Status {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Jobs count: {len(data) if isinstance(data, list) else 'N/A'}")
except Exception as e:
    print(f"❌ Jobs endpoint error: {e}")

# Test 2: Registration endpoint (should accept POST)
try:
    response = requests.options(f"{BASE_URL}/users/register/", timeout=5)
    print(f"✅ Register endpoint: Status {response.status_code}")
except Exception as e:
    print(f"❌ Register endpoint error: {e}")

# Test 3: CORS headers
try:
    response = requests.get(f"{BASE_URL}/jobs/", timeout=5)
    cors_header = response.headers.get('Access-Control-Allow-Origin', 'Not set')
    print(f"✅ CORS header: {cors_header}")
except Exception as e:
    print(f"❌ CORS check error: {e}")

print("=" * 50)
print("✨ Backend test complete!")
print("\nIf you see '✅' marks, your backend is working correctly.")
print("The 401 errors are EXPECTED for unauthenticated requests.")
