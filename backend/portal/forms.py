from django import forms
from .models import Document
from django.contrib.contenttypes.models import ContentType


class DocumentUploadForm(forms.ModelForm):
    """Form for uploading documents"""
    
    class Meta:
        model = Document
        fields = ['name', 'file']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Document name'
            }),
            'file': forms.FileInput(attrs={
                'class': 'form-control'
            }),
        }
