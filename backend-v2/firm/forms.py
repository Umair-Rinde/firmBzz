from django import forms
from .models import Firm, Product, Customer, Vendor, ProductPrice


class FirmCreateForm(forms.ModelForm):
    """Form for creating a new firm"""
    
    class Meta:
        model = Firm
        fields = ['name', 'code']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter firm name'
            }),
            'code': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter firm code (e.g., FIRM001)'
            }),
        }
        help_texts = {
            'code': 'Unique identifier for the firm',
        }


class ProductCreateForm(forms.ModelForm):
    """Form for creating products for a firm"""
    
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'price', 'batch_number',
            'manufacturing_date', 'expiry_date', 'hsn_code', 'image'
        ]
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Product name'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Product description',
                'rows': 4
            }),
            'price': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': '0.00',
                'step': '0.01'
            }),
            'batch_number': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Batch number'
            }),
            'manufacturing_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'expiry_date': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'hsn_code': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'HSN Code'
            }),
            'image': forms.FileInput(attrs={
                'class': 'form-control'
            }),
        }


class CustomerCreateForm(forms.ModelForm):
    """Form for creating customers/retailers"""
    
    class Meta:
        model = Customer
        fields = [
            'customer_type', 'business_name', 'owner_name', 'fssai_number',
            'gst_number', 'fssai_expiry', 'gst_expiry', 'whatsapp_number',
            'contact_number', 'business_address', 'email'
        ]
        widgets = {
            'customer_type': forms.Select(attrs={'class': 'form-control'}),
            'business_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Business Name'}),
            'owner_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Owner Name'}),
            'fssai_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'FSSAI Number'}),
            'gst_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'GST Number'}),
            'fssai_expiry': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'gst_expiry': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'whatsapp_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'WhatsApp Number'}),
            'contact_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Contact Number'}),
            'business_address': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}),
        }


class VendorCreateForm(forms.ModelForm):
    """Form for creating vendors/suppliers"""
    
    class Meta:
        model = Vendor
        fields = [
            'vendor_name', 'owner_name', 'gst_number', 'gst_expiry',
            'whatsapp_number', 'telephone_number', 'address',
            'bank_account_number', 'ifsc_code', 'email'
        ]
        widgets = {
            'vendor_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Vendor Name'}),
            'owner_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Owner Name'}),
            'gst_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'GST Number'}),
            'gst_expiry': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'whatsapp_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'WhatsApp Number'}),
            'telephone_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Telephone Number'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'bank_account_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Account Number'}),
            'ifsc_code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'IFSC Code'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}),
        }


class ProductPriceForm(forms.ModelForm):
    """Form for setting tiered product pricing"""
    
    class Meta:
        model = ProductPrice
        fields = ['product', 'customer_type', 'price']
        widgets = {
            'product': forms.Select(attrs={'class': 'form-control'}),
            'customer_type': forms.Select(attrs={'class': 'form-control'}),
            'price': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '0.00', 'step': '0.01'}),
        }
