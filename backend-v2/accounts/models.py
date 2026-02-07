from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from .choices import GenderChoices, UserTypeChoices
from .managers import UserManager
from uuid import uuid4

class User(AbstractBaseUser):
    id = models.UUIDField(primary_key=True, default=uuid4)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15)
    gender = models.CharField(max_length=10,choices=GenderChoices.choices)
    user_type = models.CharField(max_length=20,choices=UserTypeChoices.choices, default = UserTypeChoices.FIRM_USER)    
    date_of_birth = models.DateField()
    registered_on = models.DateTimeField(auto_now_add=True)
  
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_guest = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.email
    
    def save(self, *args, **kwargs):
        if not self.username:
            user = User.objects.all.order_by('-registered_on')[:1].only('username')
            if user.exists():
                self.username = "USR{0:0=4d}".format(int(user.first().username[3:]) + 1)
            else:
                self.username = "USR0001"
        return super().save(*args, **kwargs)

