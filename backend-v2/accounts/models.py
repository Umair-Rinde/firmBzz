from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from .choices import GenderChoices, UserTypeChoices
from .managers import UserManager
from uuid import uuid4
from firm.models import Firm
from portal.base import BaseModel

class User(AbstractBaseUser):
    id = models.UUIDField(primary_key=True, default=uuid4)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15)
    gender = models.CharField(max_length=10,choices=GenderChoices.choices, null=True, blank=True)
    user_type = models.CharField(max_length=20,choices=UserTypeChoices.choices, default = UserTypeChoices.FIRM_USER)    
    date_of_birth = models.DateField(null=True, blank=True)
    registered_on = models.DateTimeField(auto_now_add=True)
  

    address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    pincode = models.CharField(max_length=10, null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_guest = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone', 'full_name']
    def __str__(self):
        return self.email
    
    def save(self, *args, **kwargs):
        if not self.username:
            user = User.objects.order_by('-registered_on').first()
            if user:
                self.username = "USR{0:0=4d}".format(int(user.username[3:]) + 1)
            else:
                self.username = "USR0001"
        return super().save(*args, **kwargs)

    def has_module_perms(self, app_label):
        return self.is_admin
    def has_perm(self, perm, obj=None):
        return self.is_admin
class FirmUsers(BaseModel):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="firm_user"
    )
    firm = models.ForeignKey(
        Firm, on_delete=models.CASCADE, related_name="firm_users"
    )
    # Staff-specific fields
    aadhaar_number = models.CharField(max_length=12, blank=True, null=True)
    pan_number = models.CharField(max_length=10, blank=True, null=True)
    driving_license = models.CharField(max_length=50, blank=True, null=True)
    license_expiry = models.DateField(blank=True, null=True)
    home_address = models.TextField(blank=True, null=True)
    profile_photo = models.ImageField(upload_to='staff/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.full_name} - {self.firm.name}"
