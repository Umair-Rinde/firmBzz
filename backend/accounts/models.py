from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from .choices import UserTypeChoices, UserRoleChoices
from .managers import UserManager
from django.core.exceptions import ValidationError
from portal.base import BaseModel
from firm.models import Firm


class User(AbstractBaseUser, BaseModel):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15)

    user_type = models.CharField(
        max_length=20,
        choices=UserTypeChoices.choices
    )

    role = models.CharField(
        max_length=50,
        choices=UserRoleChoices.choices,
        null=True,
        blank=True
    )

    firm = models.ForeignKey(
        Firm,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="users"
    )

    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    def clean(self):
        # OWNER RULE
        if self.user_type == UserTypeChoices.OWNER:
            if self.firm is not None:
                raise ValidationError("Owner cannot belong to a firm")
            if self.role is not None:
                raise ValidationError("Owner cannot have firm roles")

        # FIRM USER RULE
        if self.user_type == UserTypeChoices.FIRM_USER:
            if self.firm is None:
                raise ValidationError("Firm user must belong to a firm")
            if not self.role:
                raise ValidationError("Firm user must have a role")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
