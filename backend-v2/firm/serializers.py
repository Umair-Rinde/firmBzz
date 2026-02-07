from rest_framework import serializers
from .models import Firm, Product, Customer, Vendor, ProductBatch, VendorOrder, VendorOrderItem

class FirmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Firm
        fields = "__all__"
        read_only_fields = ["slug", "created_on", "is_active"]

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ["slug", "firm", "created_on"]


class ProductBatchSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    
    class Meta:
        model = ProductBatch
        fields = "__all__"
        read_only_fields = ["slug", "created_on"]


class CustomerSerializer(serializers.ModelSerializer):
    customer_type_display = serializers.CharField(source='get_customer_type_display', read_only=True)
    
    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = ["slug", "firm", "created_on"]


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = "__all__"
        read_only_fields = ["slug", "firm", "created_on"]


class FirmDropdownSerializer(serializers.ModelSerializer):
    label = serializers.CharField(source="name")
    value = serializers.CharField(source="slug")

    class Meta:
        model = Firm
        fields = ("label", "value")
class VendorOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    total_cost = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = VendorOrderItem
        fields = "__all__"
        read_only_fields = ["created_on", "product_batch"]


class VendorOrderSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    order_status_display = serializers.CharField(source='get_order_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    outstanding_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    items = VendorOrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = VendorOrder
        fields = "__all__"
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
