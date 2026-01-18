from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from portal.base import BaseModel

class Document(BaseModel):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to="documents/")
    
    # Generic Relation
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.CharField(max_length=255) # Using CharField to support UUIDs
    content_object = GenericForeignKey("content_type", "object_id")

    def __str__(self):
        return self.name
