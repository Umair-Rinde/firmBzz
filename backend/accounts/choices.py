from django.db import models
from portal.constants import *

class GenderChoices(models.TextChoices):
    MALE = MALE
    FEMALE = FEMALE
    OTHER = OTHER

class UserTypeChoices(models.TextChoices):
    OWNER = "OWNER"
    FIRM_USER = "FIRM_USER"

class UserRoleChoices(models.TextChoices):
    FIRM_MANAGER = "FIRM_MANAGER"
    DISTRIBUTION_MANAGER = "DISTRIBUTION_MANAGER"
    SUPER_SELL_MANAGER = "SUPER_SELL_MANAGER"
    SALESMAN = "SALESMAN"