from rest_framework import serializers
from .models import Firm, Product, Customer, Vendor, ProductBatch, VendorOrder, VendorOrderItem
from accounts.models import User, FirmUsers
from accounts.choices import UserTypeChoices

class FirmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Firm
        fields = ["id", "name", "code", "slug", "is_active", "created_on"]
        read_only_fields = ["slug", "created_on", "is_active"]

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "description", "hsn_code", "image",
            "category", "firm", "created_on"
        ]
        read_only_fields = ["slug", "firm", "created_on"]


class ProductBatchSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    
    class Meta:
        model = ProductBatch
        fields = [
            "id", "product", "product_name", "vendor", "vendor_name", "slug",
            "batch_number", "manufacturing_date", "expiry_date",
            "received_date", "quantity_received", "quantity_remaining",
            "cost_price", "selling_price_super_seller", "selling_price_distributor",
            "created_on"
        ]
        read_only_fields = ["slug", "created_on"]


class CustomerSerializer(serializers.ModelSerializer):
    customer_type_display = serializers.CharField(source='get_customer_type_display', read_only=True)
    
    class Meta:
        model = Customer
        fields = [
            "id", "firm", "slug", "customer_type", "customer_type_display",
            "business_name", "owner_name", "fssai_number", "gst_number",
            "fssai_expiry", "gst_expiry", "whatsapp_number", "contact_number",
            "business_address", "email", "is_active", "created_on"
        ]
        read_only_fields = ["slug", "firm", "created_on"]


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            "id", "firm", "slug", "vendor_name", "owner_name", "gst_number",
            "gst_expiry", "whatsapp_number", "telephone_number", "address",
            "bank_account_number", "ifsc_code", "email", "created_on"
        ]
        read_only_fields = ["slug", "firm", "created_on"]


class VendorOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    total_cost = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = VendorOrderItem
        fields = [
            "id", "product", "product_name", "quantity_ordered", "quantity_received",
            "cost_price_per_unit", "selling_price_super_seller", "selling_price_distributor",
            "batch_number", "manufacturing_date", "expiry_date", "total_cost",
            "product_batch", "created_on"
        ]
        read_only_fields = ["created_on", "product_batch"]


class VendorOrderSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    order_status_display = serializers.CharField(source='get_order_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    outstanding_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    items = VendorOrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = VendorOrder
        fields = [
            "id", "firm", "vendor", "vendor_name", "slug", "order_number", "order_date",
            "vendor_invoice_number", "total_amount", "amount_paid", "payment_status",
            "payment_status_display", "order_status", "order_status_display",
            "notes", "received_date", "outstanding_amount", "items", "created_on"
        ]
        read_only_fields = ["slug", "firm", "created_on"]


class VendorOrderCreateSerializer(serializers.ModelSerializer):
    items = VendorOrderItemSerializer(many=True)
    
    class Meta:
        model = VendorOrder
        fields = [
            "vendor", "order_number", "order_date", "vendor_invoice_number",
            "total_amount", "amount_paid", "payment_status", "order_status",
            "notes", "items"
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = VendorOrder.objects.create(**validated_data)
        
        # Create order items
        for item_data in items_data:
            VendorOrderItem.objects.create(order=order, **item_data)
        
        return order
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update order fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update items if provided
        if items_data is not None:
            # Delete existing items and create new ones
            instance.items.all().delete()
            for item_data in items_data:
                VendorOrderItem.objects.create(order=instance, **item_data)
        
        return instance

class FirmUserSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_gender = serializers.CharField(source='user.gender', read_only=True)
    user_is_active = serializers.BooleanField(source='user.is_active', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    firm_name = serializers.CharField(source='firm.name', read_only=True)

    class Meta:
        model = FirmUsers
        fields = [
            'id', 'user', 'user_email', 'user_full_name', 'user_phone',
            'user_username', 'user_gender', 'user_is_active', 'firm', 'firm_name',
            'role', 'role_display', 'aadhaar_number', 'pan_number',
            'driving_license', 'license_expiry', 'home_address',
            'profile_photo', 'created_on'
        ]
        read_only_fields = ['created_on', 'firm']


class FirmUserCreateSerializer(serializers.Serializer):
    # User fields
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True, min_length=6)
    gender = serializers.ChoiceField(choices=['MALE', 'FEMALE', 'OTHER'])

    # FirmUser fields
    role = serializers.ChoiceField(choices=UserTypeChoices.choices)
    aadhaar_number = serializers.CharField(max_length=12, required=False, allow_blank=True)
    pan_number = serializers.CharField(max_length=10, required=False, allow_blank=True)
    driving_license = serializers.CharField(max_length=50, required=False, allow_blank=True)
    license_expiry = serializers.DateTimeField(required=False, allow_null=True)
    home_address = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        from django.db import transaction
        firm = self.context.get('firm')

        with transaction.atomic():
            # Create User
            user = User.objects.create_user(
                phone=validated_data['phone'],
                full_name=validated_data['full_name'],
                email=validated_data['email'],
                password=validated_data['password'],
            )
            user.gender = validated_data['gender']
            user.user_type = UserTypeChoices.FIRM_USER
            user.save()

            # Create FirmUser
            firm_user = FirmUsers.objects.create(
                user=user,
                firm=firm,
                role=validated_data['role'],
                aadhaar_number=validated_data.get('aadhaar_number', ''),
                pan_number=validated_data.get('pan_number', ''),
                driving_license=validated_data.get('driving_license', ''),
                license_expiry=validated_data.get('license_expiry'),
                home_address=validated_data.get('home_address', '')
            )

            return firm_user


class FirmUserUpdateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', required=False)
    phone = serializers.CharField(source='user.phone', required=False)
    gender = serializers.ChoiceField(choices=['MALE', 'FEMALE', 'OTHER'], source='user.gender', required=False)
    password = serializers.CharField(write_only=True, required=False, min_length=6)
    is_active = serializers.BooleanField(source='user.is_active', required=False)

    class Meta:
        model = FirmUsers
        fields = [
            'role', 'aadhaar_number', 'pan_number', 'driving_license',
            'license_expiry', 'home_address', 'full_name', 'phone',
            'gender', 'password', 'is_active'
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        password = user_data.pop('password', None)

        # Update User fields
        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)

        if password:
            user.set_password(password)

        user.save()

        # Update FirmUser fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
