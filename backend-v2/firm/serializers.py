from rest_framework import serializers
from .models import Firm, Product, Customer, Vendor, ProductBatch, VendorOrder, VendorOrderItem, Invoice, InvoiceItem
from accounts.models import User, FirmUsers
from accounts.choices import UserTypeChoices

class FirmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Firm
        fields = ["id", "name", "code", "slug", "is_active", "created_on"]
        read_only_fields = ["slug", "created_on"]

class ProductSerializer(serializers.ModelSerializer):
    available_quantity = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            "id", "name", "slug", "description", "hsn_code", "image",
            "category", "firm", "created_on", "available_quantity"
        ]
        read_only_fields = ["slug", "firm", "created_on", "available_quantity"]

    def get_available_quantity(self, obj):
        from django.db.models import Sum
        total = obj.batches.aggregate(Sum('quantity_remaining'))['quantity_remaining__sum']
        return total if total is not None else 0


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
            "business_name", "owner_name", "fssai_number", "fssai_document", "gst_number",
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
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    firm_name = serializers.CharField(source='firm.name', read_only=True)

    class Meta:
        model = FirmUsers
        fields = [
            'id', 'user', 'user_email', 'user_full_name', 'user_phone',
            'user_username', 'user_gender', 'is_active', 'firm', 'firm_name',
            'role', 'role_display', 'aadhaar_number', 'pan_number',
            'driving_license', 'license_document', 'license_expiry', 'home_address',
            'address_proof_document', 'profile_photo', 'created_on'
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
    license_document = serializers.FileField(required=False, allow_null=True)
    license_expiry = serializers.DateTimeField(required=False, allow_null=True)
    home_address = serializers.CharField(required=False, allow_blank=True)
    address_proof_document = serializers.FileField(required=False, allow_null=True)

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
                license_document=validated_data.get('license_document'),
                license_expiry=validated_data.get('license_expiry'),
                home_address=validated_data.get('home_address', ''),
                address_proof_document=validated_data.get('address_proof_document')
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
            'license_document', 'license_expiry', 'home_address', 'address_proof_document',
            'full_name', 'phone', 'gender', 'password', 'is_active'
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        password = validated_data.pop('password', None)

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

class InvoiceItemSerializer(serializers.ModelSerializer):
    """Read-only: serializes InvoiceItem for display, including batch info and amount."""
    product_name = serializers.CharField(source='product.name', read_only=True)
    batch_number = serializers.CharField(source='product_batch.batch_number', read_only=True, default='')
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = InvoiceItem
        fields = [
            "id", "product", "product_name", "product_batch", "batch_number", "quantity", "rate", "amount", "created_on"
        ]
        read_only_fields = ["created_on", "amount", "rate", "product_batch", "batch_number", "product_name"]


class InvoiceItemInputSerializer(serializers.Serializer):
    """Write-only: accepts just product + quantity; rate is determined via FEFO on the backend."""
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)


class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.business_name', read_only=True)
    customer_type = serializers.CharField(source='customer.customer_type', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True, default='')
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True, default='')
    items = InvoiceItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            "id", "firm", "customer", "customer_name", "customer_type", "slug", 
            "invoice_number", "total_amount", "status", "status_display", 
            "rejection_note", "created_by", "created_by_name", "approved_by", 
            "approved_by_name", "items", "created_on"
        ]
        read_only_fields = ["slug", "firm", "created_on", "invoice_number", "total_amount", "created_by", "approved_by", "status", "rejection_note"]


class InvoiceCreateUpdateSerializer(serializers.ModelSerializer):
    items = InvoiceItemInputSerializer(many=True)
    
    class Meta:
        model = Invoice
        fields = [
            "customer", "items"
        ]
    
    def _allocate_batches(self, product, requested_quantity, customer):
        from .models import ProductBatch
        from django.db.models import F
        from rest_framework.exceptions import ValidationError
        
        # Order by expiry date (nulls last) and then created_on
        batches = ProductBatch.objects.filter(
            product=product, 
            quantity_remaining__gt=0
        ).order_by(F('expiry_date').asc(nulls_last=True), 'created_on')
        
        allocations = []
        remaining_to_allocate = requested_quantity
        
        for batch in batches:
            if remaining_to_allocate <= 0:
                break
                
            qty_to_take = min(batch.quantity_remaining, remaining_to_allocate)
            remaining_to_allocate -= qty_to_take
            batch.quantity_remaining -= qty_to_take
            
            # Decide rate based on customer type
            rate = batch.selling_price_super_seller if customer.customer_type == 'SUPER_SELLER' else batch.selling_price_distributor
            
            allocations.append({
                'batch': batch,
                'quantity': qty_to_take,
                'rate': rate
            })
            
        if remaining_to_allocate > 0:
            raise ValidationError(f"Insufficient stock for {product.name}. Required {requested_quantity}, only {requested_quantity - remaining_to_allocate} available.")
            
        return allocations

    def create(self, validated_data):
        from django.db import transaction
        
        items_data = validated_data.pop('items')
        customer = validated_data.get('customer')
        
        user = self.context.get('request_user')
        if user:
            validated_data['created_by'] = user
            
        with transaction.atomic():
            invoice = Invoice.objects.create(**validated_data)
            
            total_amount = 0
            
            # For each requested item, allocate from batches
            for item_data in items_data:
                product = item_data['product']
                requested_quantity = item_data['quantity']
                
                allocations = self._allocate_batches(product, requested_quantity, customer)
                
                for alloc in allocations:
                    batch = alloc['batch']
                    batch.save() # save the deducted quantity
                    
                    item = InvoiceItem.objects.create(
                        invoice=invoice, 
                        product=product,
                        product_batch=batch,
                        quantity=alloc['quantity'],
                        rate=alloc['rate']
                    )
                    total_amount += (item.quantity * item.rate)
                
            invoice.total_amount = total_amount
            invoice.save()
            
        return invoice
    
    def update(self, instance, validated_data):
        from django.db import transaction
        items_data = validated_data.pop('items', None)
        customer = validated_data.get('customer', instance.customer)
        
        with transaction.atomic():
            # Update invoice fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            # If items are updated, restore old batches and re-allocate
            if items_data is not None:
                # Restore quantities to batches
                for old_item in instance.items.all():
                    if old_item.product_batch:
                        old_item.product_batch.quantity_remaining += old_item.quantity
                        old_item.product_batch.save()
                
                # Delete existing items
                instance.items.all().delete()
                
                total_amount = 0
                for item_data in items_data:
                    product = item_data['product']
                    requested_quantity = item_data['quantity']
                    
                    allocations = self._allocate_batches(product, requested_quantity, customer)
                    
                    for alloc in allocations:
                        batch = alloc['batch']
                        batch.save()
                        
                        item = InvoiceItem.objects.create(
                            invoice=instance,
                            product=product,
                            product_batch=batch,
                            quantity=alloc['quantity'],
                            rate=alloc['rate']
                        )
                        total_amount += (item.quantity * item.rate)
                        
                instance.total_amount = total_amount
                
            instance.save()
            
        return instance
