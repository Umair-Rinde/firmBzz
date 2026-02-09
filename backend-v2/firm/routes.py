from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from . import apis
from drf_spectacular.openapi import AutoSchema
from drf_spectacular.utils import extend_schema


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
        return apis.FirmService.list_firms()


class FirmDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Get Firm Details",
        description="Retrieve details of a specific firm using its unique slug.",
        tags=["Firm"]
    )
    def get(self, request, slug):
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
        return apis.ProductService.list_products(slug)

    @extend_schema(
        summary="Create Product",
        description="Create a new product for a specific firm.",
        tags=["Products"]
    )
    def post(self, request, slug):
        return apis.ProductService.create_product(slug, request.data)


class FirmUserCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="Add User to Firm",
        description="Add a new user (usually a FIRM_USER) to a specific firm.",
        tags=["Firm"]
    )
    def post(self, request, slug):
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
        filters = {
            'vendor': request.GET.get('vendor'),
            'order_status': request.GET.get('order_status'),
            'payment_status': request.GET.get('payment_status'),
        }
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}
        return apis.VendorOrderService.list_orders(slug, filters)

    @extend_schema(
        summary="Create Vendor Order",
        description="Create a new vendor order with items.",
        tags=["Vendor Orders"]
    )
    def post(self, request, slug):
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
        return apis.VendorOrderService.get_order(slug, order_id)

    @extend_schema(
        summary="Update Vendor Order",
        description="Update details of an existing vendor order.",
        tags=["Vendor Orders"]
    )
    def put(self, request, slug, order_id):
        return apis.VendorOrderService.update_order(slug, order_id, request.data)

    @extend_schema(
        summary="Delete Vendor Order",
        description="Delete a vendor order.",
        tags=["Vendor Orders"]
    )
    def delete(self, request, slug, order_id):
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
        return apis.VendorOrderService.receive_order(slug, order_id)

class FirmUserListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    @extend_schema(
        summary="List Firm Users",
        description="List all firm users for a specific firm (excluding admin/owner users).",
        tags=["Firm Users"]
    )
    def get(self, request, slug):
        return apis.FirmUserService.list_firm_users(slug)

    @extend_schema(
        summary="Create Firm User",
        description="Create a new firm user with a specific role.",
        tags=["Firm Users"]
    )
    def post(self, request, slug):
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
        return apis.FirmUserService.get_firm_user(slug, user_id)

    @extend_schema(
        summary="Update Firm User",
        description="Update firm user information and role.",
        tags=["Firm Users"]
    )
    def put(self, request, slug, user_id):
        return apis.FirmUserService.update_firm_user(slug, user_id, request.data)

    @extend_schema(
        summary="Delete Firm User",
        description="Deactivate a firm user.",
        tags=["Firm Users"]
    )
    def delete(self, request, slug, user_id):
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
        return apis.VendorService.list_vendors(slug)

    @extend_schema(
        summary="Create Vendor",
        description="Create a new vendor for a specific firm.",
        tags=["Vendors"]
    )
    def post(self, request, slug):
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
        return apis.VendorService.get_vendor(slug, vendor_id)

    @extend_schema(
        summary="Update Vendor",
        description="Update vendor information.",
        tags=["Vendors"]
    )
    def put(self, request, slug, vendor_id):
        return apis.VendorService.update_vendor(slug, vendor_id, request.data)

    @extend_schema(
        summary="Delete Vendor",
        description="Delete a vendor.",
        tags=["Vendors"]
    )
    def delete(self, request, slug, vendor_id):
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
        return apis.CustomerService.list_customers(slug)

    @extend_schema(
        summary="Create Retailer/Customer",
        description="Create a new customer for a specific firm.",
        tags=["Customers"]
    )
    def post(self, request, slug):
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
        return apis.CustomerService.get_customer(slug, customer_id)

    @extend_schema(
        summary="Update Retailer/Customer",
        description="Update customer information.",
        tags=["Customers"]
    )
    def put(self, request, slug, customer_id):
        return apis.CustomerService.update_customer(slug, customer_id, request.data)

    @extend_schema(
        summary="Delete Retailer/Customer",
        description="Delete a customer.",
        tags=["Customers"]
    )
    def delete(self, request, slug, customer_id):
        return apis.CustomerService.delete_customer(slug, customer_id)


class ProductDetailAPIView(APIView):

    @extend_schema(
        summary="Get Product Details",
        description="Retrieve details of a specific product.",
        tags=["Products"]
    )
    def get(self, request, slug, product_id):
        return apis.ProductCrudService.get_product(slug, product_id)

    @extend_schema(
        summary="Update Product",
        description="Update product information.",
        tags=["Products"]
    )
    def put(self, request, slug, product_id):
        return apis.ProductCrudService.update_product(slug, product_id, request.data)

    @extend_schema(
        summary="Delete Product",
        description="Delete a product.",
        tags=["Products"]
    )
    def delete(self, request, slug, product_id):
        return apis.ProductCrudService.delete_product(slug, product_id)