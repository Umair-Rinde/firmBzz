from decimal import Decimal

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import (
    Firm,
    Product,
    Customer,
    Vendor,
    ProductBatch,
    VendorOrder,
    VendorOrderItem,
    Invoice,
    InvoiceItem,
    RetailerOrder,
    RetailerOrderItem,
    Payment,
    StockLedgerEntry,
)
from accounts.models import User, FirmUsers
from accounts.choices import UserTypeChoices
from .choices import (
    RetailerOrderStatusChoices,
    PaymentModeChoices,
    StockLedgerEntryType,
    StockManualReason,
)
from .pricing import effective_unit_rate, allocate_batches_fefo

class FirmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Firm
        fields = ["id", "name", "code", "slug", "is_active", "created_on"]
        read_only_fields = ["slug", "created_on"]

class ProductSerializer(serializers.ModelSerializer):
    available_quantity = serializers.SerializerMethodField()
    scheme_free_product_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            "id",
            "product_code",
            "name",
            "slug",
            "description",
            "category",
            "hsn_code",
            "gst_percent",
            "liters",
            "pack",
            "mrp",
            "purchase_rate",
            "purchase_rate_per_unit",
            "sale_rate",
            "rate_per_unit",
            "product_discount",
            "no_discount",
            "scheme_type",
            "scheme_buy_qty",
            "scheme_free_qty",
            "scheme_free_product",
            "scheme_free_product_name",
            "scheme_discount_percent",
            "is_active",
            "image",
            "firm",
            "created_on",
            "available_quantity",
        ]
        read_only_fields = ["slug", "firm", "created_on", "available_quantity", "scheme_free_product_name"]

    def get_available_quantity(self, obj):
        from django.db.models import Sum
        total = obj.batches.aggregate(Sum("quantity"))["quantity__sum"]
        return total if total is not None else 0

    def get_scheme_free_product_name(self, obj):
        fp = obj.scheme_free_product
        if fp and fp.id != obj.id:
            code = f"[{fp.product_code}] " if fp.product_code else ""
            return f"{code}{fp.name}"
        return None


class ProductBatchSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = ProductBatch
        fields = [
            "id",
            "product",
            "product_name",
            "quantity",
            "expiry_date",
            "created_on",
        ]
        read_only_fields = ["created_on"]


class CustomerSerializer(serializers.ModelSerializer):
    customer_type_display = serializers.CharField(source='get_customer_type_display', read_only=True)
    outstanding_balance = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            "id", "firm", "slug", "customer_type", "customer_type_display",
            "reference_code",
            "default_discount_percent",
            "business_name", "owner_name", "fssai_number", "fssai_document", "gst_number",
            "fssai_expiry", "gst_expiry", "whatsapp_number", "contact_number",
            "business_address", "email", "is_active", "created_on",
            "outstanding_balance",
        ]
        read_only_fields = ["slug", "firm", "created_on", "outstanding_balance"]

    def get_outstanding_balance(self, obj):
        from django.db.models import Sum, DecimalField, Value
        from django.db.models.functions import Coalesce
        agg = obj.invoices.filter(
            status__in=[
                "PENDING_APPROVAL", "APPROVED", "OUT_FOR_DELIVERY",
                "DELIVERED", "PARTIALLY_PAID",
            ],
        ).aggregate(
            total_invoiced=Coalesce(Sum("total_amount"), Value(0), output_field=DecimalField()),
            total_paid=Coalesce(Sum("payments__amount"), Value(0), output_field=DecimalField()),
        )
        return str((agg["total_invoiced"] - agg["total_paid"]).quantize(Decimal("0.01")))


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            "id", "firm", "slug", "reference_code", "vendor_name", "owner_name", "gst_number",
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


class RetailerOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = RetailerOrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "quantity",
            "rate",
            "applied_discount_percent",
            "scheme_applied",
            "created_on",
        ]
        read_only_fields = ["rate", "created_on"]


class RetailerOrderItemWriteSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)
    applied_discount_percent = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        required=False,
        allow_null=True,
    )
    scheme_applied = serializers.JSONField(required=False, default=dict)


class RetailerOrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.business_name", read_only=True)
    items = RetailerOrderItemSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(
        source="created_by.full_name", read_only=True, default=""
    )

    class Meta:
        model = RetailerOrder
        fields = [
            "id",
            "firm",
            "customer",
            "customer_name",
            "status",
            "reference",
            "notes",
            "created_by",
            "created_by_name",
            "items",
            "created_on",
        ]
        read_only_fields = ["firm", "created_by", "created_on", "status"]


class RetailerOrderCreateSerializer(serializers.ModelSerializer):
    items = RetailerOrderItemWriteSerializer(many=True)

    class Meta:
        model = RetailerOrder
        fields = ["customer", "reference", "notes", "items"]

    def validate(self, attrs):
        from django.utils import timezone

        customer = attrs.get("customer")
        if customer is not None and customer.fssai_expiry is not None:
            if customer.fssai_expiry < timezone.now():
                raise ValidationError(
                    {
                        "customer": (
                            "This retailer's FSSAI has expired. "
                            "Update FSSAI in retailer configuration before creating an order."
                        )
                    }
                )
        return attrs

    def create(self, validated_data):
        from django.db import transaction

        items_data = validated_data.pop("items")
        firm = self.context["firm"]
        user = self.context.get("request_user")
        customer = validated_data["customer"]
        if customer.firm_id != firm.id:
            raise ValidationError("Customer does not belong to this firm.")

        with transaction.atomic():
            order = RetailerOrder.objects.create(
                firm=firm,
                customer=customer,
                created_by=user,
                status=RetailerOrderStatusChoices.SUBMITTED,
                reference=validated_data.get("reference"),
                notes=validated_data.get("notes"),
            )
            for row in items_data:
                product = row["product"]
                if product.firm_id != firm.id:
                    raise ValidationError("Product does not belong to this firm.")
                if "applied_discount_percent" in row and row["applied_discount_percent"] is not None:
                    disc = Decimal(str(row["applied_discount_percent"]))
                else:
                    disc = (
                        Decimal("0")
                        if product.no_discount
                        else (customer.default_discount_percent or Decimal("0"))
                    )
                if product.no_discount and disc > 0:
                    raise ValidationError(
                        f"Product '{product.name}' does not allow discounts "
                        "(no_discount is enabled)."
                    )
                if product.no_discount:
                    disc = Decimal("0")
                rate = effective_unit_rate(product, customer)
                RetailerOrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=row["quantity"],
                    rate=rate,
                    applied_discount_percent=disc,
                    scheme_applied=row.get("scheme_applied") or {},
                )
            return order


class InvoiceItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    batch_expiry = serializers.DateField(
        source="product_batch.expiry_date", read_only=True, allow_null=True
    )
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = InvoiceItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_batch",
            "batch_expiry",
            "quantity",
            "free_quantity",
            "rate",
            "discount_percent",
            "gst_percent",
            "line_total",
            "amount",
            "created_on",
        ]
        read_only_fields = [
            "created_on",
            "amount",
            "rate",
            "product_batch",
            "product_name",
            "batch_expiry",
            "free_quantity",
            "discount_percent",
            "gst_percent",
            "line_total",
        ]


class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.business_name", read_only=True)
    customer_type = serializers.CharField(source="customer.customer_type", read_only=True)
    customer_reference_code = serializers.CharField(
        source="customer.reference_code", read_only=True, allow_null=True
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    created_by_name = serializers.CharField(
        source="created_by.full_name", read_only=True, default=""
    )
    approved_by_name = serializers.CharField(
        source="approved_by.full_name", read_only=True, default=""
    )
    printed_by_name = serializers.CharField(
        source="printed_by.full_name", read_only=True, default=""
    )
    items = InvoiceItemSerializer(many=True, read_only=True)
    source_retailer_order_ids = serializers.SerializerMethodField()
    amount_paid = serializers.SerializerMethodField()
    amount_pending = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    payments = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            "id",
            "firm",
            "customer",
            "customer_name",
            "customer_type",
            "customer_reference_code",
            "slug",
            "invoice_number",
            "total_amount",
            "amount_paid",
            "amount_pending",
            "payment_status",
            "status",
            "status_display",
            "rejection_note",
            "created_by",
            "created_by_name",
            "approved_by",
            "approved_by_name",
            "is_printed",
            "printed_on",
            "printed_by",
            "printed_by_name",
            "source_retailer_order_ids",
            "items",
            "payments",
            "created_on",
        ]
        read_only_fields = [
            "slug",
            "firm",
            "created_on",
            "invoice_number",
            "total_amount",
            "created_by",
            "approved_by",
            "status",
            "rejection_note",
            "is_printed",
            "printed_on",
            "printed_by",
        ]

    def get_source_retailer_order_ids(self, obj):
        return [str(x.id) for x in obj.source_orders.all()]

    def _paid(self, obj):
        if not hasattr(obj, "_cached_paid"):
            from django.db.models import Sum
            obj._cached_paid = obj.payments.aggregate(s=Sum("amount"))["s"] or Decimal("0")
        return obj._cached_paid

    def get_amount_paid(self, obj):
        return str(self._paid(obj).quantize(Decimal("0.01")))

    def get_amount_pending(self, obj):
        pending = (obj.total_amount or Decimal("0")) - self._paid(obj)
        return str(max(Decimal("0"), pending).quantize(Decimal("0.01")))

    def get_payment_status(self, obj):
        paid = self._paid(obj)
        total = obj.total_amount or Decimal("0")
        if paid <= 0:
            return "UNPAID"
        if paid >= total:
            return "PAID"
        return "PARTIAL"

    def get_payments(self, obj):
        from .serializers import PaymentSerializer
        return PaymentSerializer(obj.payments.all(), many=True).data


class InvoiceLineOverrideSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)
    discount_percent = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, default=0)
    include_scheme = serializers.BooleanField(required=False, default=True)
    free_quantity = serializers.IntegerField(min_value=0, required=False, default=0)


class InvoiceFromRetailerOrdersSerializer(serializers.Serializer):
    """
    Firm admin: attach one or more SUBMITTED retailer orders (same customer) → invoice.
    Optional `line_items` overrides let the admin adjust quantities, discounts,
    add/remove products, and toggle schemes before the invoice is finalised.
    """

    retailer_order_ids = serializers.ListField(
        child=serializers.UUIDField(), min_length=1
    )
    line_items = InvoiceLineOverrideSerializer(many=True, required=False)

    def validate_retailer_order_ids(self, ids):
        unique_ids = list(dict.fromkeys(ids))
        if len(unique_ids) != len(ids):
            raise ValidationError("Duplicate order ids in request.")
        orders = list(RetailerOrder.objects.filter(id__in=unique_ids))
        if len(orders) != len(unique_ids):
            raise ValidationError("One or more retailer orders were not found.")
        firm = self.context["firm"]
        customers = {o.customer_id for o in orders}
        if len(customers) != 1:
            raise ValidationError(
                "All selected orders must belong to the same retailer (customer)."
            )
        for o in orders:
            if o.firm_id != firm.id:
                raise ValidationError("Order does not belong to this firm.")
            if o.status != RetailerOrderStatusChoices.SUBMITTED:
                raise ValidationError(
                    f"Order {o.id} must be in SUBMITTED status (got {o.status})."
                )
        return ids

    def validate_line_items(self, items):
        if not items:
            return items
        firm = self.context["firm"]
        for item in items:
            product = item["product"]
            if product.firm_id != firm.id:
                raise ValidationError(f"Product {product.name} does not belong to this firm.")
            if product.no_discount and Decimal(str(item.get("discount_percent", 0))) > 0:
                raise ValidationError(
                    f"Product '{product.name}' has no_discount enabled — discount must be 0."
                )
        return items

    def create(self, validated_data):
        from django.db import transaction

        firm = self.context["firm"]
        user = self.context.get("request_user")
        ids = list(dict.fromkeys(validated_data["retailer_order_ids"]))
        orders = list(
            RetailerOrder.objects.filter(id__in=ids)
            .select_related("customer")
            .prefetch_related("items__product")
        )
        customer = orders[0].customer
        overrides = validated_data.get("line_items")

        if overrides:
            lines_to_invoice = []
            for ov in overrides:
                product = ov["product"]
                qty = ov["quantity"]
                disc = Decimal(str(ov.get("discount_percent", 0)))
                if product.no_discount:
                    disc = Decimal("0")
                include_scheme = ov.get("include_scheme", True)
                free_qty = ov.get("free_quantity", 0) if include_scheme else 0
                rate = effective_unit_rate(product, customer)
                lines_to_invoice.append({
                    "product": product,
                    "quantity": qty,
                    "rate": rate,
                    "discount_percent": disc,
                    "free_quantity": free_qty,
                    "gst_percent": product.gst_percent,
                })
        else:
            lines_to_invoice = []
            for ro in orders:
                for line in ro.items.all():
                    lines_to_invoice.append({
                        "product": line.product,
                        "quantity": line.quantity,
                        "rate": line.rate,
                        "discount_percent": line.applied_discount_percent,
                        "free_quantity": 0,
                        "gst_percent": line.product.gst_percent,
                    })

        with transaction.atomic():
            invoice = Invoice.objects.create(
                firm=firm,
                customer=customer,
                created_by=user,
                total_amount=Decimal("0"),
            )
            invoice.source_orders.set(orders)

            total = Decimal("0")
            for ln in lines_to_invoice:
                product = ln["product"]
                allocations = allocate_batches_fefo(product, ln["quantity"])
                disc = ln["discount_percent"]
                for batch, take in allocations:
                    batch.quantity -= take
                    batch.save(update_fields=["quantity", "updated_on"])
                    base_amt = Decimal(take) * ln["rate"]
                    if disc > 0:
                        base_amt = base_amt * (Decimal("100") - disc) / Decimal("100")
                    line_amt = base_amt.quantize(Decimal("0.01"))
                    total += line_amt
                    inv_item = InvoiceItem.objects.create(
                        invoice=invoice,
                        product=product,
                        product_batch=batch,
                        quantity=take,
                        rate=ln["rate"],
                        free_quantity=ln["free_quantity"],
                        discount_percent=disc,
                        gst_percent=ln["gst_percent"],
                        line_total=line_amt,
                    )
                    StockLedgerEntry.objects.create(
                        firm=firm,
                        product=product,
                        product_batch=batch,
                        quantity_delta=-take,
                        entry_type=StockLedgerEntryType.INVOICE_SALE,
                        invoice_item=inv_item,
                        created_by=user,
                        note="Invoice from retailer orders",
                    )

            invoice.total_amount = total.quantize(Decimal("0.01"))
            invoice.save(update_fields=["total_amount", "updated_on"])

            for o in orders:
                o.status = RetailerOrderStatusChoices.INVOICED
                o.save(update_fields=["status", "updated_on"])

        return invoice


class PaymentSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(
        source="recorded_by.full_name", read_only=True, default=""
    )
    mode_display = serializers.CharField(source="get_mode_display", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "invoice",
            "amount",
            "mode",
            "mode_display",
            "reference",
            "note",
            "paid_on",
            "recorded_by",
            "recorded_by_name",
            "created_on",
        ]
        read_only_fields = ["invoice", "recorded_by", "created_on"]


class PaymentCreateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0.01"))
    mode = serializers.ChoiceField(choices=PaymentModeChoices.choices)
    reference = serializers.CharField(required=False, allow_blank=True, default="")
    note = serializers.CharField(required=False, allow_blank=True, default="")
    paid_on = serializers.DateTimeField()


class StockManualAdjustSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    direction = serializers.ChoiceField(choices=["in", "out"])
    quantity = serializers.IntegerField(min_value=1)
    expiry_date = serializers.DateField(required=False, allow_null=True)
    product_batch = serializers.PrimaryKeyRelatedField(
        queryset=ProductBatch.objects.all(),
        required=False,
        allow_null=True,
    )
    manual_reason = serializers.ChoiceField(choices=StockManualReason.choices)
    note = serializers.CharField(required=False, allow_blank=True, default="")
