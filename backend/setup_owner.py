import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.contrib.auth import get_user_model
from accounts.choices import UserTypeChoices
User = get_user_model()

email = "owner@example.com"
password = "OwnerPassword123!"
full_name = "Owner User"
phone = "9876543210"

print(f"Setting up user: {email}")

try:
    if User.objects.filter(email=email).exists():
        print("User exists. Resetting password...")
        user = User.objects.get(email=email)
        user.set_password(password)
        user.user_type = UserTypeChoices.OWNER
        user.is_admin = True
        user.is_active = True
        user.save()
        print("Password reset and permissions ensured.")
    else:
        print("Creating new user...")
        user = User.objects.create_superuser(
            email=email,
            password=password,
            full_name=full_name,
            phone=phone
        )
        # Ensure user_type is set (create_superuser should handle it now with my fix, but double check)
        user.user_type = UserTypeChoices.OWNER
        user.save()
        print("User created.")

    print("\n" + "="*30)
    print("LOGIN CREDENTIALS:")
    print(f"Email:    {email}")
    print(f"Password: {password}")
    print("="*30 + "\n")

except Exception as e:
    print(f"Error: {e}")
