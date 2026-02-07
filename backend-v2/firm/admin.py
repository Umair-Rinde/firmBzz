from django.contrib import admin
from .models import Firm, Product, Customer, Vendor, ProductBatch, VendorOrder, VendorOrderItem


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
    readonly_fields = ['slug', 'created_on']
    fields = ['vendor', 'batch_number', 'received_date', 'quantity_received', 'quantity_remaining',
              'cost_price', 'selling_price_super_seller', 'selling_price_distributor', 'expiry_date']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'firm', 'slug', 'hsn_code', 'created_on']
    list_filter = ['firm', 'created_on', 'category']
    search_fields = ['name', 'hsn_code', 'slug']
    readonly_fields = ['slug', 'created_on', 'updated_on']
    ordering = ['-created_on']
    inlines = [ProductBatchInline]
    fieldsets = (
        ('Basic Information', {
            'fields': ('firm', 'name', 'slug', 'description', 'image')
        }),
        ('Product Details', {
            'fields': ('hsn_code', 'category')
        }),
        ('Timestamps', {
            'fields': ('created_on', 'updated_on'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('firm')


@admin.register(ProductBatch)
class ProductBatchAdmin(admin.ModelAdmin):
    list_display = ['product', 'batch_number', 'vendor', 'received_date', 'quantity_remaining', 
                    'cost_price', 'selling_price_distributor', 'expiry_date']
    list_filter = ['vendor', 'product__firm', 'received_date', 'expiry_date']
    search_fields = ['product__name', 'batch_number', 'vendor__vendor_name', 'slug']
    readonly_fields = ['slug', 'created_on', 'updated_on']
    ordering = ['-received_date']
    fieldsets = (
        ('Product & Vendor', {
            'fields': ('product', 'vendor', 'slug')
        }),
        ('Batch Details', {
            'fields': ('batch_number', 'manufacturing_date', 'expiry_date')
        }),
        ('Receipt Information', {
            'fields': ('received_date', 'quantity_received', 'quantity_remaining')
        }),
        ('Pricing', {
            'fields': ('cost_price', 'selling_price_super_seller', 'selling_price_distributor')
        }),
        ('Timestamps', {
            'fields': ('created_on', 'updated_on'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('product', 'vendor', 'product__firm')


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
