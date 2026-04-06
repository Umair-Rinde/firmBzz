from django.contrib import admin
from .models import (
    Firm,
    Product,
    Customer,
    Vendor,
    ProductBatch,
    VendorOrder,
    VendorOrderItem,
    RetailerOrder,
    RetailerOrderItem,
    Invoice,
    Payment,
    StockLedgerEntry,
)


@admin.register(Firm)
class FirmAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'slug', 'is_active', 'created_on']
    list_filter = ['is_active', 'created_on']
    search_fields = ['name', 'code', 'slug']
    readonly_fields = ['slug', 'created_on', 'updated_on']
    ordering = ['-created_on']


class ProductBatchInline(admin.TabularInline):
    model = ProductBatch
    extra = 0
    readonly_fields = ["created_on"]
    fields = ["quantity", "expiry_date", "created_on"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "firm",
        "category",
        "hsn_code",
        "gst_percent",
        "mrp",
        "sale_rate",
        "is_active",
        "created_on",
    ]
    list_filter = ["firm", "created_on", "category", "is_active"]
    search_fields = ["name", "hsn_code", "slug", "product_code"]
    readonly_fields = ["slug", "created_on", "updated_on"]
    ordering = ["-created_on"]
    inlines = [ProductBatchInline]
    fieldsets = (
        ("Basic", {"fields": ("firm", "name", "slug", "description", "image", "category", "is_active")}),
        ("Tax & pack", {"fields": ("hsn_code", "gst_percent", "liters", "pack")}),
        ("Rates (Excel)", {"fields": ("mrp", "purchase_rate", "purchase_rate_per_unit", "sale_rate", "rate_per_unit", "product_discount")}),
        ("Timestamps", {"fields": ("created_on", "updated_on"), "classes": ("collapse",)}),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('firm')


@admin.register(ProductBatch)
class ProductBatchAdmin(admin.ModelAdmin):
    list_display = ["product", "quantity", "expiry_date", "created_on"]
    list_filter = ["product__firm", "expiry_date"]
    search_fields = ["product__name"]
    readonly_fields = ["created_on", "updated_on"]
    ordering = ["expiry_date", "-created_on"]
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("product", "product__firm")


class RetailerOrderItemInline(admin.TabularInline):
    model = RetailerOrderItem
    extra = 0
    readonly_fields = ["created_on"]


@admin.register(RetailerOrder)
class RetailerOrderAdmin(admin.ModelAdmin):
    list_display = ["id", "firm", "customer", "status", "created_by", "created_on"]
    list_filter = ["firm", "status", "created_on"]
    search_fields = ["customer__business_name", "reference", "notes"]
    inlines = [RetailerOrderItemInline]
    raw_id_fields = ["customer", "created_by"]


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['business_name', 'customer_type', 'owner_name', 'firm', 'slug', 'whatsapp_number', 'created_on']
    list_filter = ['customer_type', 'firm', 'created_on', 'fssai_expiry', 'gst_expiry']
    search_fields = ['business_name', 'owner_name', 'email', 'fssai_number', 'gst_number', 'slug']
    readonly_fields = ['slug', 'created_on', 'updated_on']
    ordering = ['-created_on']
    fieldsets = (
        ('Business Information', {
            'fields': ('firm', 'customer_type', 'business_name', 'owner_name', 'slug')
        }),
        ('Contact Details', {
            'fields': ('whatsapp_number', 'contact_number', 'email', 'business_address')
        }),
        ('Licenses & Compliance', {
            'fields': ('fssai_number', 'fssai_expiry', 'gst_number', 'gst_expiry')
        }),
        ('Timestamps', {
            'fields': ('created_on', 'updated_on'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('firm')


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ['vendor_name', 'owner_name', 'firm', 'slug', 'whatsapp_number', 'email', 'created_on']
    list_filter = ['firm', 'created_on', 'gst_expiry']
    search_fields = ['vendor_name', 'owner_name', 'email', 'gst_number', 'slug']
    readonly_fields = ['slug', 'created_on', 'updated_on']
    ordering = ['-created_on']
    fieldsets = (
        ('Vendor Information', {
            'fields': ('firm', 'vendor_name', 'owner_name', 'slug')
        }),
        ('Contact Details', {
            'fields': ('whatsapp_number', 'telephone_number', 'email', 'address')
        }),
        ('Banking & Compliance', {
            'fields': ('gst_number', 'gst_expiry', 'bank_account_number', 'ifsc_code')
        }),
        ('Timestamps', {
            'fields': ('created_on', 'updated_on'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('firm')


class VendorOrderItemInline(admin.TabularInline):
    model = VendorOrderItem
    extra = 0
    readonly_fields = ['created_on', 'product_batch', 'total_cost']
    fields = ['product', 'quantity_ordered', 'quantity_received', 'cost_price_per_unit',
              'selling_price_super_seller', 'selling_price_distributor', 'batch_number',
              'manufacturing_date', 'expiry_date', 'product_batch', 'total_cost']


@admin.register(VendorOrder)
class VendorOrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'vendor', 'firm', 'order_date', 'order_status', 
                    'payment_status', 'total_amount', 'outstanding_amount', 'created_on']
    list_filter = ['order_status', 'payment_status', 'firm', 'vendor', 'order_date', 'created_on']
    search_fields = ['order_number', 'vendor_invoice_number', 'vendor__vendor_name', 'slug']
    readonly_fields = ['slug', 'created_on', 'updated_on', 'outstanding_amount']
    ordering = ['-order_date', '-created_on']
    inlines = [VendorOrderItemInline]
    fieldsets = (
        ('Order Information', {
            'fields': ('firm', 'vendor', 'order_number', 'order_date', 'vendor_invoice_number', 'slug')
        }),
        ('Financial Details', {
            'fields': ('total_amount', 'amount_paid', 'outstanding_amount', 'payment_status')
        }),
        ('Status', {
            'fields': ('order_status', 'received_date')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_on', 'updated_on'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('firm', 'vendor')


@admin.register(VendorOrderItem)
class VendorOrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'quantity_ordered', 'quantity_received', 
                    'cost_price_per_unit', 'total_cost', 'batch_number', 'product_batch']
    list_filter = ['order__firm', 'order__vendor', 'product', 'created_on']
    search_fields = ['order__order_number', 'product__name', 'batch_number']
    readonly_fields = ['created_on', 'updated_on', 'total_cost', 'product_batch']
    ordering = ['-created_on']
    fieldsets = (
        ('Order & Product', {
            'fields': ('order', 'product')
        }),
        ('Quantity', {
            'fields': ('quantity_ordered', 'quantity_received')
        }),
        ('Pricing', {
            'fields': ('cost_price_per_unit', 'selling_price_super_seller', 'selling_price_distributor', 'total_cost')
        }),
        ('Batch Information', {
            'fields': ('batch_number', 'manufacturing_date', 'expiry_date', 'product_batch')
        }),
        ('Timestamps', {
            'fields': ('created_on', 'updated_on'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('order', 'product', 'order__firm', 'order__vendor', 'product_batch')


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ["created_on", "recorded_by"]
    fields = ["amount", "mode", "reference", "note", "paid_on", "recorded_by", "created_on"]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ["id", "invoice_number", "customer", "firm", "total_amount", "status", "created_on"]
    list_filter = ["firm", "status", "created_on"]
    search_fields = ["invoice_number", "customer__business_name"]
    inlines = [PaymentInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["id", "invoice", "amount", "mode", "paid_on", "recorded_by", "created_on"]
    list_filter = ["mode", "paid_on"]
    search_fields = ["invoice__invoice_number", "reference"]
    readonly_fields = ["created_on"]


@admin.register(StockLedgerEntry)
class StockLedgerEntryAdmin(admin.ModelAdmin):
    list_display = [
        "created_on",
        "firm",
        "product",
        "quantity_delta",
        "entry_type",
        "manual_reason",
        "created_by",
    ]
    list_filter = ["entry_type", "firm", "manual_reason"]
    search_fields = ["product__name", "note"]
    readonly_fields = ["created_on", "updated_on"]
    ordering = ["-created_on"]
