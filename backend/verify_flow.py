import urllib.request
import urllib.parse
import json
import base64

BASE_URL = "http://127.0.0.1:8003"
TOKEN = None
FIRM_SLUG = None

def request(method, endpoint, data=None, headers=None):
    if headers is None:
        headers = {}
    headers["Content-Type"] = "application/json"
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    
    url = f"{BASE_URL}{endpoint}"
    if data:
        data = json.dumps(data).encode("utf-8")
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            print(f"[{method}] {endpoint} -> {response.status}")
            return json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        print(f"[{method}] {endpoint} -> {e.code}")
        print(e.read().decode("utf-8"))
        return None

# 1. Login
print("--- Login ---")
login_res = request("POST", "/accounts/login/", {
    "username": "admin@example.com",
    "password": "admin"
})

if login_res and login_res.get("data"):
    TOKEN = login_res["data"]["access_token"]
    print("Token obtained.")
else:
    print("Login failed.")
    exit(1)

# 2. Create Firm
print("\n--- Create Firm ---")
firm_res = request("POST", "/firm/setup/", {
    "name": "Tech Corp",
    "code": "TC001"
})

if firm_res and firm_res.get("data"):
    FIRM_SLUG = firm_res["data"]["slug"]
    print(f"Firm created: {FIRM_SLUG}")
else:
    print("Firm creation failed.")
    exit(1)

# 3. Create Product
print("\n--- Create Product ---")
request("POST", f"/firm/{FIRM_SLUG}/products/", {
    "name": "Super Gadget",
    "description": "Best gadget ever",
    "price": 99.99
})

# 4. Create User
print("\n--- Create Firm User ---")
request("POST", f"/firm/{FIRM_SLUG}/users/", {
    "email": "manager@techcorp.com",
    "full_name": "Firm Manager",
    "phone": "9876543210",
    "role": "FIRM_MANAGER",
    "password": "password123"
})

# 5. Upload Document (Mocking valid content type logic might be tricky without ID, using Firm ID)
print("\n--- Upload Document ---")
# Need to construct multipart form data manually for file upload with urllib, which is verbose.
# Skipping file upload check in this script for brevity, will check via curl if basic flow works.
print("Skipping document upload in script (requires multipart).")
