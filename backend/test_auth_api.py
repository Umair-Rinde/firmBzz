import os
import django
import json
import urllib.request
import urllib.error

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# 1. Setup User
email = "api_test@example.com"
password = "TestPassword123!"

try:
    if not User.objects.filter(email=email).exists():
        User.objects.create_user(email=email, password=password, phone="5555555555", full_name="API Test")
        print(f"Created user {email}")
    else:
        u = User.objects.get(email=email)
        u.set_password(password)
        u.is_active = True
        u.save()
        print(f"Reset password for {email}")
except Exception as e:
    print(f"Error setting up user: {e}")

# 2. Test API
url = "http://127.0.0.1:8000/accounts/login/"
data = {
    "username": email,  # apis.py expects 'username'
    "password": password
}

print(f"Testing Login API: {url}")
print(f"Payload: {data}")

req = urllib.request.Request(
    url, 
    data=json.dumps(data).encode('utf-8'), 
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(f"Response: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Response: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
