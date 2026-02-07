from rest_framework.views import APIView
from . import apis
from drf_spectacular.openapi import AutoSchema
from drf_spectacular.utils import extend_schema


class FirmCreateAPIView(APIView):
    schema = AutoSchema()

    @extend_schema(
        summary="Create Firm",
        description="Create a new firm in the system.",
        tags=["Firm"]
    )
    def post(self, request):
        return apis.FirmService.create_firm(request.data)


class FirmListAPIView(APIView):
    schema = AutoSchema()

    @extend_schema(
        summary="List Firms",
        description="Retrieve a list of all firms.",
        tags=["Firm"]
    )
    def get(self, request):
        return apis.FirmService.list_firms()


class FirmDetailAPIView(APIView):
    schema = AutoSchema()

    @extend_schema(
        summary="Get Firm Details",
        description="Retrieve details of a specific firm using its unique slug.",
        tags=["Firm"]
    )
    def get(self, request, slug):
        return apis.FirmService.get_firm(slug)


class ProductListCreateAPIView(APIView):
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
    schema = AutoSchema()

    @extend_schema(
        summary="Add User to Firm",
        description="Add a new user (usually a FIRM_USER) to a specific firm.",
        tags=["Firm"]
    )
    def post(self, request, slug):
        return apis.FirmService.add_user_to_firm(slug, request.data)


class VendorOrderListCreateAPIView(APIView):
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
    schema = AutoSchema()

    @extend_schema(
        summary="Receive Vendor Order",
        description="Mark a vendor order as RECEIVED and create product batches for the items.",
        tags=["Vendor Orders"]
    )
    def post(self, request, slug, order_id):
        return apis.VendorOrderService.receive_order(slug, order_id)

