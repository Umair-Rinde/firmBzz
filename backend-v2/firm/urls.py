from django.urls import path
from . import routes

urlpatterns = [
    path('setup/', routes.FirmCreateAPIView.as_view()),
    path('all/', routes.FirmListAPIView.as_view()),
    path('<slug:slug>/', routes.FirmDetailAPIView.as_view()),
    path('<slug:slug>/products/', routes.ProductListCreateAPIView.as_view()),
    path('<slug:slug>/products/bulk-import/', routes.ProductBulkImportAPIView.as_view()),
    path('<slug:slug>/users/', routes.FirmUserCreateAPIView.as_view()),
    path('<slug:slug>/products/<uuid:product_id>/', routes.ProductDetailAPIView.as_view()),
    # Firm User Management
    path('<slug:slug>/firm-users/', routes.FirmUserListCreateAPIView.as_view()),
    path('<slug:slug>/firm-users/<uuid:user_id>/', routes.FirmUserDetailAPIView.as_view()),

    # Vendor Management
    path('<slug:slug>/vendors/', routes.VendorListCreateAPIView.as_view()),
    path('<slug:slug>/vendors/<uuid:vendor_id>/', routes.VendorDetailAPIView.as_view()),

    # Customer/Retailer Management
    path('<slug:slug>/customers/', routes.CustomerListCreateAPIView.as_view()),
    path('<slug:slug>/customers/<uuid:customer_id>/', routes.CustomerDetailAPIView.as_view()),

    # Salesman → retailer orders (bundled into invoice by firm admin)
    path('<slug:slug>/retailer-orders/', routes.RetailerOrderListCreateAPIView.as_view()),
    path('<slug:slug>/retailer-orders/<uuid:order_id>/', routes.RetailerOrderDetailAPIView.as_view()),

    # Vendor Order URLs
    path('<slug:slug>/vendor-orders/', routes.VendorOrderListCreateAPIView.as_view()),
    path('<slug:slug>/vendor-orders/bulk-import/', routes.VendorOrderBulkImportAPIView.as_view()),
    path('<slug:slug>/vendor-orders/<uuid:order_id>/', routes.VendorOrderDetailAPIView.as_view()),
    path('<slug:slug>/vendor-orders/<uuid:order_id>/receive/', routes.VendorOrderReceiveAPIView.as_view()),

    # Invoice URLs
    path('<slug:slug>/invoices/', routes.InvoiceListCreateAPIView.as_view()),
    path('<slug:slug>/invoices/preview-pricing/', routes.InvoicePricingPreviewAPIView.as_view()),
    path('<slug:slug>/invoices/<uuid:invoice_id>/', routes.InvoiceDetailAPIView.as_view()),
    path('<slug:slug>/invoices/<uuid:invoice_id>/approve/', routes.InvoiceApproveAPIView.as_view()),
    path('<slug:slug>/invoices/<uuid:invoice_id>/request-changes/', routes.InvoiceRequestChangesAPIView.as_view()),
    path('<slug:slug>/invoices/<uuid:invoice_id>/print/', routes.InvoicePrintAPIView.as_view()),
    path('<slug:slug>/invoices/<uuid:invoice_id>/update-status/', routes.InvoiceStatusUpdateAPIView.as_view()),
    path('<slug:slug>/invoices/batch-print/', routes.InvoiceBatchPrintAPIView.as_view()),

    # Payments
    path('<slug:slug>/invoices/<uuid:invoice_id>/payments/', routes.InvoicePaymentListCreateAPIView.as_view()),
    path('<slug:slug>/customers/<uuid:customer_id>/outstanding/', routes.CustomerOutstandingAPIView.as_view()),

    # Dashboard URLs
    path('dashboard/admin/', routes.AdminDashboardAPIView.as_view()),
    path('<slug:slug>/dashboard/', routes.FirmDashboardAPIView.as_view()),

    path('<slug:slug>/stock/', routes.StockListAPIView.as_view()),
    path('<slug:slug>/stock/ledger/', routes.StockLedgerListAPIView.as_view()),
    path('<slug:slug>/stock/adjust/', routes.StockManualAdjustAPIView.as_view()),
]
