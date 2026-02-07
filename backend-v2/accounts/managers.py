from django.contrib.auth.models import BaseUserManager
from .choices import UserTypeChoices, GenderChoices

class  UserManager(BaseUserManager):
    def create_user(self, phone, full_name, email, password=None, is_guest=False, is_active=True):
        if not email:
            raise ValueError('The Email field must be set')
        if not phone:
            raise ValueError("Users must have a Phone number")

        user = self.model(
            phone=phone,
            email=email,
            full_name=full_name,
            is_guest=is_guest,
            is_active=is_active,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, email, gender=GenderChoices.MALE, full_name='Super Admin', password=None):
        user = self.create_user(
            phone=phone,
            email=email,
            full_name=full_name,
            password=password,
        )
        user.gender=gender,
        user.is_admin = True    
        user.is_active = True
        user.save(using=self._db) 
        user.user_type = UserTypeChoices.ADMIN
        return user