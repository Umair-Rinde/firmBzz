from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from . import apis
from drf_spectacular.openapi import AutoSchema
from drf_spectacular.utils import extend_schema
from portal.base import BaseResponse
from .models import Firm

def _enforce_firm_context(request, slug):
    # If firm_id is present in token, the URL firm slug must match it.
    # Admin can access across firms.
    try:
        if getattr(request.user, "user_type", None) == "ADMIN":
            return None
        token_firm_id = getattr(request, "firm_id", None)
        if not token_firm_id:
            return None
        firm = Firm.objects.only("id").get(slug=slug)
        if str(firm.id) != str(token_firm_id):
            return BaseResponse(success=False, message="Forbidden (wrong firm)", status=403)
        return None
    except Firm.DoesNotExist:
        return BaseResponse(success=False, message="Firm not found", status=404)


class FirmCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Create Firm",
        description="Create a new firm in the system.",
        tags=["Firm"]
    )
    def post(self, request):
        return apis.FirmService.create_firm(request.data)


class FirmListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="List Firms",
        description="Retrieve a list of all firms.",
        tags=["Firm"]
    )
    def get(self, request):
        return apis.FirmService.list_firms(user=request.user, params=request.GET)


class FirmDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Get Firm Details",
        description="Retrieve details of a specific firm using its unique slug.",
        tags=["Firm"]
    )
    def get(self, request, slug):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.FirmService.get_firm(slug)


class ProductListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="List Products",
        description="List all products associated with a specific firm.",
        tags=["Products"]
    )
    def get(self, request, slug):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.ProductService.list_products(slug, params=request.GET)

    @extend_schema(
        summary="Create Product",
        description="Create a new product for a specific firm.",
        tags=["Products"]
    )
    def post(self, request, slug):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.ProductService.create_product(slug, request.data)

class ProductBulkImportAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Bulk Import Products",
        description="Bulk import products from CSV or Excel file.",
        tags=["Products"]
    )
    def post(self, request, slug):
        return apis.ProductService.bulk_import_products(slug, request.FILES)


class FirmUserCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Add User to Firm",
        description="Add a new user (usually a FIRM_USER) to a specific firm.",
        tags=["Firm"]
    )
    def post(self, request, slug):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.FirmService.add_user_to_firm(slug, request.data)


class VendorOrderListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="List Vendor Orders",
        description="List all vendor orders for a firm. Can be filtered by vendor, order_status, and payment_status.",
        tags=["Vendor Orders"]
    )
    def get(self, request, slug):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        filters = {
            'vendor': request.GET.get('vendor'),
            'order_status': request.GET.get('order_status'),
            'payment_status': request.GET.get('payment_status'),
        }
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}
        return apis.VendorOrderService.list_orders(slug, filters, params=request.GET)

    @extend_schema(
        summary="Create Vendor Order",
        description="Create a new vendor order with items.",
        tags=["Vendor Orders"]
    )
    def post(self, request, slug):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.VendorOrderService.create_order(slug, request.data)


class VendorOrderDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Get Vendor Order Details",
        description="Retrieve details of a specific vendor order.",
        tags=["Vendor Orders"]
    )
    def get(self, request, slug, order_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.VendorOrderService.get_order(slug, order_id)

    @extend_schema(
        summary="Update Vendor Order",
        description="Update details of an existing vendor order.",
        tags=["Vendor Orders"]
    )
    def put(self, request, slug, order_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.VendorOrderService.update_order(slug, order_id, request.data)

    @extend_schema(
        summary="Delete Vendor Order",
        description="Delete a vendor order.",
        tags=["Vendor Orders"]
    )
    def delete(self, request, slug, order_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.VendorOrderService.delete_order(slug, order_id)


class VendorOrderReceiveAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Receive Vendor Order",
        description="Mark a vendor order as RECEIVED and create product batches for the items.",
        tags=["Vendor Orders"]
    )
    def post(self, request, slug, order_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.VendorOrderService.receive_order(slug, order_id, request.data)

class VendorOrderBulkImportAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Bulk Import Vendor Orders",
        description="Bulk import vendor orders from CSV or Excel file.",
        tags=["Vendor Orders"]
    )
    def post(self, request, slug):
        return apis.VendorOrderService.bulk_import_orders(slug, request.FILES)

class FirmUserListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="List Firm Users",
        description="List all firm users for a specific firm (excluding admin/owner users).",
        tags=["Firm Users"]
    )
    def get(self, request, slug):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.FirmUserService.list_firm_users(slug, params=request.GET)

    @extend_schema(
        summary="Create Firm User",
        description="Create a new firm user with a specific role.",
        tags=["Firm Users"]
    )
    def post(self, request, slug):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.FirmUserService.create_firm_user(slug, request.data)


class FirmUserDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Get Firm User Details",
        description="Retrieve details of a specific firm user.",
        tags=["Firm Users"]
    )
    def get(self, request, slug, user_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.FirmUserService.get_firm_user(slug, user_id)

    @extend_schema(
        summary="Update Firm User",
        description="Update firm user information and role.",
        tags=["Firm Users"]
    )
    def put(self, request, slug, user_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.FirmUserService.update_firm_user(slug, user_id, request.data)

    @extend_schema(
        summary="Delete Firm User",
        description="Deactivate a firm user.",
        tags=["Firm Users"]
    )
    def delete(self, request, slug, user_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.FirmUserService.delete_firm_user(slug, user_id)


class VendorListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="List Vendors",
        description="List all vendors for a specific firm.",
        tags=["Vendors"]
    )
    def get(self, request, slug):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.VendorService.list_vendors(slug, params=request.GET)

    @extend_schema(
        summary="Create Vendor",
        description="Create a new vendor for a specific firm.",
        tags=["Vendors"]
    )
    def post(self, request, slug):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.VendorService.create_vendor(slug, request.data)


class VendorDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Get Vendor Details",
        description="Retrieve details of a specific vendor.",
        tags=["Vendors"]
    )
    def get(self, request, slug, vendor_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.VendorService.get_vendor(slug, vendor_id)

    @extend_schema(
        summary="Update Vendor",
        description="Update vendor information.",
        tags=["Vendors"]
    )
    def put(self, request, slug, vendor_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.VendorService.update_vendor(slug, vendor_id, request.data)

    @extend_schema(
        summary="Delete Vendor",
        description="Delete a vendor.",
        tags=["Vendors"]
    )
    def delete(self, request, slug, vendor_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.VendorService.delete_vendor(slug, vendor_id)


class CustomerListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="List Retailers/Customers",
        description="List all customers for a specific firm.",
        tags=["Customers"]
    )
    def get(self, request, slug):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.CustomerService.list_customers(slug, params=request.GET)

    @extend_schema(
        summary="Create Retailer/Customer",
        description="Create a new customer for a specific firm.",
        tags=["Customers"]
    )
    def post(self, request, slug):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.CustomerService.create_customer(slug, request.data)


class CustomerDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Get Retailer/Customer Details",
        description="Retrieve details of a specific customer.",
        tags=["Customers"]
    )
    def get(self, request, slug, customer_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.CustomerService.get_customer(slug, customer_id)

    @extend_schema(
        summary="Update Retailer/Customer",
        description="Update customer information.",
        tags=["Customers"]
    )
    def put(self, request, slug, customer_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.CustomerService.update_customer(slug, customer_id, request.data)

    @extend_schema(
        summary="Delete Retailer/Customer",
        description="Delete a customer.",
        tags=["Customers"]
    )
    def delete(self, request, slug, customer_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.CustomerService.delete_customer(slug, customer_id)


class ProductDetailAPIView(APIView):

    @extend_schema(
        summary="Get Product Details",
        description="Retrieve details of a specific product.",
        tags=["Products"]
    )
    def get(self, request, slug, product_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.ProductCrudService.get_product(slug, product_id)

    @extend_schema(
        summary="Update Product",
        description="Update product information.",
        tags=["Products"]
    )
    def put(self, request, slug, product_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.ProductCrudService.update_product(slug, product_id, request.data)

    @extend_schema(
        summary="Delete Product",
        description="Delete a product.",
        tags=["Products"]
    )
    def delete(self, request, slug, product_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.ProductCrudService.delete_product(slug, product_id)


class InvoiceListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="List Invoices",
        description="List all invoices for a specific firm.",
        tags=["Invoices"]
    )
    def get(self, request, slug):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.InvoiceService.list_invoices(slug, request.user, params=request.GET)

    @extend_schema(
        summary="Create Invoice",
        description="Create a new invoice.",
        tags=["Invoices"]
    )
    def post(self, request, slug):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.InvoiceService.create_invoice(slug, request.data, request.user)


class InvoiceDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Get Invoice Details",
        description="Retrieve details of a specific invoice.",
        tags=["Invoices"]
    )
    def get(self, request, slug, invoice_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.InvoiceService.get_invoice(slug, invoice_id)

    @extend_schema(
        summary="Update Invoice",
        description="Update an existing pending invoice.",
        tags=["Invoices"]
    )
    def put(self, request, slug, invoice_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.InvoiceService.update_invoice(slug, invoice_id, request.data)


class InvoiceApproveAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Approve Invoice",
        description="Approve a pending invoice. Only allowed for firm admins or admin roles.",
        tags=["Invoices"]
    )
    def post(self, request, slug, invoice_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.InvoiceService.approve_invoice(slug, invoice_id, request.user)


class InvoiceRequestChangesAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Request Changes to Invoice",
        description="Request changes to an invoice. Requires a note.",
        tags=["Invoices"]
    )
    def post(self, request, slug, invoice_id):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.InvoiceService.request_changes(slug, invoice_id, request.data)


class InvoicePricingPreviewAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Preview Invoice Pricing",
        description="Simulate FEFO batch allocation and return estimated cost breakdown per product without modifying inventory.",
        tags=["Invoices"]
    )
    def post(self, request, slug):
        denied = _enforce_firm_context(request, slug)
        if denied:
            return denied
        return apis.InvoiceService.preview_pricing(slug, request.data)
        return apis.InvoiceService.preview_pricing(slug, request.data)
class FirmDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Get Firm Dashboard Data",
        description="Retrieve financial summary for a specific firm.",
        tags=["Dashboard"]
    )
    def get(self, request, slug):
        return apis.DashboardService.get_firm_dashboard_data(slug)


class AdminDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Get Admin Dashboard Data",
        description="Retrieve financial summary across all firms.",
        tags=["Dashboard"]
    )
    def get(self, request):
        return apis.DashboardService.get_admin_dashboard_data()
