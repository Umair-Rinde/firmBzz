from rest_framework import serializers
from .models import Firm, Product, Customer, Vendor, ProductBatch, VendorOrder, VendorOrderItem

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
            "business_address", "email", "created_on"
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
