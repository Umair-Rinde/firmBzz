from django.db import models
from portal.constants import *

class GenderChoices(models.TextChoices):
    MALE = MALE
    FEMALE = FEMALE
    OTHER = OTHER

class UserTypeChoices(models.TextChoices):
    ADMIN = ADMIN
    FIRM_ADMIN = FIRM_ADMIN
    FIRM_USER = FIRM_USER
    SUPERSELLER_USER = SUPERSELLER_USER
    DISTRIBUTOR_USER = DISTRIBUTOR_USER
    SALES_PERSON = SALES_PERSON