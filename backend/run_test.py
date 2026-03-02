import os
import django
import json
import urllib.request
import urllib.error
import sys

# Add the backend directory to sys.path so we can import core.settings
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

def create_superuser():
    User = get_user_model()
    email = '@example.com'
    password = 'Admin123!'
    phone = '1234567890'
    full_name = 'Admin User'

    if not User.objects.filter(email=email).exists():
        User.objects.create_superuser(
            email=email, 
            password=password, 
            phone=phone, 
            full_name=full_name
        )
        print(f'Superuser created: {email}')
    else:
        print('Superuser already exists. Resetting password...')
        u = User.objects.get(email=email)
        u.set_password(password)
        u.save()
        print('Password reset.')
    return email, password

def test_login(email, password):
    # Endpoint URL - verifying it is /accounts/login/
    User = get_user_model() 
    user = User.objects.get(email=email)
    url = 'http://127.0.0.1:8000/accounts/login/'
    
    # AuthService expects 'username' (mapped to email for authentication) and 'password'
    data = json.dumps({'username': user.email, 'password': password}).encode('utf-8')
    
    req = urllib.request.Request(
        url, 
        data=data, 
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"Attempting login to {url}...")
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                print('Login successful!')
                print('Response:', response.read().decode('utf-8'))
            else:
                print(f'Login failed with status: {response.status}')
    except urllib.error.HTTPError as e:
        print(f'Login failed: {e.code} {e.reason}')
        error_content = e.read().decode('utf-8')
        print(error_content)
    except Exception as e:
        print(f'An error occurred: {str(e)}')

if __name__ == '__main__':
    email, password = create_superuser()
    test_login(email, password)
