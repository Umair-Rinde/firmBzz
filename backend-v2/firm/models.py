from uuid import uuid4

from django.conf import settings
from portal.base import BaseModel
from django.db import models
from django.db.models import Q
from django.utils.text import slugify


class Firm(BaseModel):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    is_active = models.BooleanField(default=True)

    # Invoice / compliance details (optional but printed on invoices)
    legal_name = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    gstin = models.CharField(max_length=20, blank=True, null=True)
    fssai_number = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    state_code = models.CharField(max_length=10, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.name}-{self.code}")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(BaseModel):
    """
    Product master aligned with price list / Excel:
    Category, ItemName, HSN, GST%, Liters, Pack, MRP, purchase/sale rates, discount.
    Scheme fields for promotional offers (BOGO, flat discount, etc.).
    """
    from .choices import SchemeTypeChoices

    firm = models.ForeignKey(Firm, on_delete=models.CASCADE, related_name="products")
    product_code = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        db_index=True,
        help_text="External / ERP product id (e.g. P001)",
    )
    name = models.CharField(max_length=255, help_text="Item name / description")
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=500, blank=True, null=True)
    hsn_code = models.CharField(max_length=50, blank=True, null=True, help_text="HSN number")
    gst_percent = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, help_text="GST %"
    )
    liters = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pack = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    mrp = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    purchase_rate = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    purchase_rate_per_unit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    sale_rate = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    rate_per_unit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    product_discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Catalog discount % (optional; list rate uses full sale_rate/rate_per_unit; default line discount is per retailer)",
    )
    no_discount = models.BooleanField(
        default=False,
        help_text="If true, retailer default line discount does not apply and line discount must be 0",
    )

    scheme_type = models.CharField(
        max_length=20,
        choices=SchemeTypeChoices.choices,
        default=SchemeTypeChoices.NONE,
    )
    scheme_buy_qty = models.PositiveIntegerField(
        default=0, help_text="Buy X quantity (for BUY_X_GET_Y)",
    )
    scheme_free_qty = models.PositiveIntegerField(
        default=0, help_text="Get Y free quantity (for BUY_X_GET_Y)",
    )
    scheme_free_product = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="free_in_schemes",
        help_text="Product given free (defaults to self when blank)",
    )
    scheme_discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Flat discount % when scheme_type = FLAT_DISCOUNT",
    )

    is_active = models.BooleanField(default=True)
    image = models.ImageField(upload_to="products/", blank=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["firm", "product_code"],
                condition=Q(product_code__isnull=False) & ~Q(product_code=""),
                name="firm_product_code_unique_when_set",
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.name}-{self.firm_id}-{uuid4().hex[:8]}")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class CustomerManager(models.Manager):
    """Ensures legacy DBs have default_discount_percent before any Customer query."""

    def get_queryset(self):
        from .db_utils import ensure_firm_customer_default_discount_percent_column

        ensure_firm_customer_default_discount_percent_column()
        return super().get_queryset()


class Customer(BaseModel):
    """Customer/Retailer - Super Seller or Distributor"""
    from .choices import CustomerTypeChoices

    objects = CustomerManager()

    firm = models.ForeignKey(Firm, on_delete=models.CASCADE, related_name='customers')
    slug = models.SlugField(unique=True, blank=True)
    customer_type = models.CharField(
        max_length=20,
        choices=CustomerTypeChoices.choices,
        default=CustomerTypeChoices.DISTRIBUTOR
    )
    business_name = models.CharField(max_length=255)
    owner_name = models.CharField(max_length=255)
    fssai_number = models.CharField(max_length=50, blank=True, null=True)
    fssai_document = models.FileField(upload_to='customers/fssai/', blank=True, null=True)
    gst_number = models.CharField(max_length=50, blank=True, null=True)
    fssai_expiry = models.DateTimeField(blank=True, null=True)
    gst_expiry = models.DateTimeField(blank=True, null=True)
    whatsapp_number = models.CharField(max_length=15)
    contact_number = models.CharField(max_length=15)
    business_address = models.TextField()
    email = models.EmailField()
    is_active = models.BooleanField(default=True)
    reference_code = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        db_index=True,
        help_text="External retailer id (e.g. R001)",
    )
    default_discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text=(
            "Default line discount % for this retailer on new order/invoice lines "
            "(not applied when the product has no_discount)."
        ),
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.business_name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.business_name} ({self.get_customer_type_display()})"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["firm", "reference_code"],
                condition=Q(reference_code__isnull=False) & ~Q(reference_code=""),
                name="firm_customer_reference_code_unique_when_set",
            ),
        ]


from random import randint

class Vendor(BaseModel):
    """Vendor/Supplier"""
    firm = models.ForeignKey(Firm, on_delete=models.CASCADE, related_name='vendors')
    slug = models.SlugField(unique=True, blank=True)
    vendor_name = models.CharField(max_length=255)
    owner_name = models.CharField(max_length=255)
    gst_number = models.CharField(max_length=50, blank=True, null=True)
    gst_expiry = models.DateTimeField(blank=True, null=True)
    whatsapp_number = models.CharField(max_length=15)
    telephone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField()
    bank_account_number = models.CharField(max_length=50, blank=True, null=True)
    ifsc_code = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField()
    reference_code = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        db_index=True,
        help_text="External vendor id (e.g. V001)",
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.vendor_name + str(randint(1, 1000)))
        super().save(*args, **kwargs)

    def __str__(self):
        return self.vendor_name

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["firm", "reference_code"],
                condition=Q(reference_code__isnull=False) & ~Q(reference_code=""),
                name="firm_vendor_reference_code_unique_when_set",
            ),
        ]


class ProductBatch(BaseModel):
    """Stock line: quantity and expiry only (FEFO by expiry)."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="batches")
    quantity = models.IntegerField(default=0)
    expiry_date = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ("product", "expiry_date")
        ordering = ["expiry_date", "-created_on"]

    def __str__(self):
        return f"{self.product.name} qty={self.quantity} exp={self.expiry_date}"


class VendorOrder(BaseModel):
    """Vendor Order - Orders received from vendors"""
    from .choices import OrderStatusChoices, PaymentStatusChoices
    
    firm = models.ForeignKey(Firm, on_delete=models.CASCADE, related_name='vendor_orders')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='orders')
    slug = models.SlugField(unique=True, blank=True)
    
    # Order Details
    order_number = models.CharField(max_length=100, unique=True)
    order_date = models.DateTimeField()
    vendor_invoice_number = models.CharField(max_length=100, blank=True, null=True)
    
    # Financial Details
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatusChoices.choices,
        default=PaymentStatusChoices.UNPAID
    )
    
    # Status
    order_status = models.CharField(
        max_length=20,
        choices=OrderStatusChoices.choices,
        default=OrderStatusChoices.PENDING
    )
    
    # Additional Info
    notes = models.TextField(blank=True, null=True)
    received_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-order_date', '-created_on']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.order_number}-{self.vendor.vendor_name}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_number} - {self.vendor.vendor_name}"
    
    @property
    def outstanding_amount(self):
        """Calculate outstanding payment amount"""
        return self.total_amount - self.amount_paid


class VendorOrderItem(BaseModel):
    """Vendor Order Item - Line items for vendor orders"""
    order = models.ForeignKey(VendorOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='order_items')
    
    # Quantity Details
    quantity_ordered = models.IntegerField()
    quantity_received = models.IntegerField(default=0)
    
    # Pricing
    cost_price_per_unit = models.DecimalField(max_digits=10, decimal_places=2, help_text="Purchase price per unit from vendor")
    selling_price_super_seller = models.DecimalField(max_digits=10, decimal_places=2, help_text="Selling price for super seller retailers")
    selling_price_distributor = models.DecimalField(max_digits=10, decimal_places=2, help_text="Selling price for distributors")
    
    # Batch Information
    batch_number = models.CharField(max_length=100)
    manufacturing_date = models.DateTimeField(blank=True, null=True)
    expiry_date = models.DateTimeField(blank=True, null=True)
    
    # Link to created batch (set when order is received)
    product_batch = models.ForeignKey(ProductBatch, on_delete=models.SET_NULL, null=True, blank=True, related_name='order_items')

    class Meta:
        ordering = ['created_on']

    def __str__(self):
        return f"{self.product.name} - {self.quantity_ordered} units (Order: {self.order.order_number})"
    
    @property
    def total_cost(self):
        """Calculate total cost for this line item"""
        return self.quantity_received * self.cost_price_per_unit
    
    def create_product_batch(self):
        """Merge received qty into ProductBatch by (product, expiry_date)."""
        if self.quantity_received <= 0 or self.product_batch_id:
            return None
        exp = self.expiry_date
        exp_date = exp.date() if exp is not None and hasattr(exp, "date") else exp
        batch, _ = ProductBatch.objects.get_or_create(
            product=self.product,
            expiry_date=exp_date,
            defaults={"quantity": 0},
        )
        batch.quantity += self.quantity_received
        batch.save(update_fields=["quantity", "updated_on"])
        self.product_batch = batch
        self.save(update_fields=["product_batch", "updated_on"])
        return batch


class RetailerOrder(BaseModel):
    """Salesman order to one retailer; firm admin bundles multiple into an invoice."""
    from .choices import RetailerOrderStatusChoices

    firm = models.ForeignKey(Firm, on_delete=models.CASCADE, related_name="retailer_orders")
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name="retailer_orders"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="retailer_orders_created",
    )
    status = models.CharField(
        max_length=20,
        choices=RetailerOrderStatusChoices.choices,
        default=RetailerOrderStatusChoices.SUBMITTED,
    )
    reference = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-created_on"]

    def __str__(self):
        return f"Retailer order {self.id} — {self.customer.business_name}"


class RetailerOrderItem(BaseModel):
    order = models.ForeignKey(
        RetailerOrder, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="retailer_order_items"
    )
    quantity = models.PositiveIntegerField()
    rate = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Unit rate snapshot when the line was created",
    )
    applied_discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Extra line discount % (on top of product defaults)",
    )
    scheme_applied = models.JSONField(
        default=dict,
        blank=True,
        help_text="Snapshot e.g. buy_qty / free_qty when scheme applies",
    )

    class Meta:
        ordering = ["created_on"]

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


class Invoice(BaseModel):
    """Invoice generated for a Customer (Super Seller or Distributor)"""
    from .choices import InvoiceStatusChoices
    
    firm = models.ForeignKey(Firm, on_delete=models.CASCADE, related_name='invoices')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='invoices')
    slug = models.SlugField(unique=True, blank=True)
    
    invoice_number = models.CharField(max_length=100, blank=True, null=True, unique=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    status = models.CharField(
        max_length=20,
        choices=InvoiceStatusChoices.choices,
        default=InvoiceStatusChoices.PENDING_APPROVAL
    )
    
    rejection_note = models.TextField(blank=True, null=True)

    delivered_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Set when status becomes DELIVERED; used to auto-close 2 days after delivery.",
    )

    is_printed = models.BooleanField(default=False)
    printed_on = models.DateTimeField(blank=True, null=True)
    printed_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='printed_invoices',
    )

    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='created_invoices')
    approved_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_invoices')
    source_orders = models.ManyToManyField(
        RetailerOrder,
        related_name="invoices",
        blank=True,
        help_text="Retailer (salesman) orders combined into this invoice; same customer only.",
    )

    class Meta:
        ordering = ['-created_on']

    def save(self, *args, **kwargs):
        if not self.slug:
            import uuid
            self.slug = slugify(f"inv-{uuid.uuid4().hex[:8]}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Invoice {self.invoice_number or self.slug} - {self.customer.business_name}"


class InvoiceItem(BaseModel):
    """Line items for an Invoice"""
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='invoice_items')
    product_batch = models.ForeignKey(ProductBatch, on_delete=models.SET_NULL, null=True, related_name='invoice_items')
    
    quantity = models.IntegerField(default=1)
    free_quantity = models.PositiveIntegerField(
        default=0,
        help_text="Free units from scheme (e.g. BOGO)",
    )
    rate = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price per unit depending on customer type")
    discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )
    gst_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="GST % snapshot for the line",
    )
    line_total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Optional stored line total (tax-inclusive snapshot)",
    )
    
    class Meta:
        ordering = ['created_on']

    def __str__(self):
        return f"{self.product.name} - {self.quantity} units (Invoice: {self.invoice.id})"
    
    @property
    def amount(self):
        """Calculate total amount for this line item"""
        if self.line_total is not None:
            return self.line_total
        return self.quantity * self.rate


class StockLedgerEntry(BaseModel):
    """
    Every change to ProductBatch.quantity is recorded here: manual adjustments,
    vendor receipts, and invoice (sale) allocations. Use for audit trail.
    """

    from .choices import StockLedgerEntryType, StockManualReason

    firm = models.ForeignKey(Firm, on_delete=models.CASCADE, related_name="stock_ledger_entries")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="stock_ledger_entries")
    product_batch = models.ForeignKey(
        ProductBatch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_ledger_entries",
    )
    quantity_delta = models.IntegerField(
        help_text="Positive = stock in, negative = stock out",
    )
    entry_type = models.CharField(max_length=30, choices=StockLedgerEntryType.choices)
    manual_reason = models.CharField(
        max_length=30,
        choices=StockManualReason.choices,
        blank=True,
        null=True,
    )
    vendor_order_item = models.ForeignKey(
        VendorOrderItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_ledger_entries",
    )
    invoice_item = models.ForeignKey(
        InvoiceItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_ledger_entries",
    )
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_ledger_entries",
    )

    class Meta:
        ordering = ["-created_on"]

    def __str__(self):
        return f"{self.get_entry_type_display()} {self.product.name} Δ{self.quantity_delta}"


class Payment(BaseModel):
    """
    Payment against an invoice. Supports partial payments — multiple Payment
    rows per invoice build up the paid amount over time.
    """
    from .choices import PaymentModeChoices

    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, related_name="payments"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    mode = models.CharField(
        max_length=20,
        choices=PaymentModeChoices.choices,
        default=PaymentModeChoices.CASH,
    )
    reference = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Transaction ID / cheque number / UTR",
    )
    note = models.TextField(blank=True, null=True)
    paid_on = models.DateTimeField(
        help_text="Date/time the payment was actually made",
    )
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="recorded_payments",
    )

    class Meta:
        ordering = ["-paid_on", "-created_on"]

    def __str__(self):
        return f"₹{self.amount} ({self.get_mode_display()}) → Invoice {self.invoice_id}"
