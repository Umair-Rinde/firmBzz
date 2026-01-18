from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from . import apis
from drf_spectacular.openapi import AutoSchema


class FirmCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    def post(self, request):
        return apis.FirmService.create_firm(request.data)


class FirmDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    def get(self, request, slug):
        return apis.FirmService.get_firm(slug)


class ProductListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    def get(self, request, slug):
        return apis.ProductService.list_products(slug)

    def post(self, request, slug):
        return apis.ProductService.create_product(slug, request.data)


class FirmUserCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    def post(self, request, slug):
        return apis.FirmService.add_user_to_firm(slug, request.data)


class VendorOrderListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    def get(self, request, slug):
        filters = {
            'vendor': request.GET.get('vendor'),
            'order_status': request.GET.get('order_status'),
            'payment_status': request.GET.get('payment_status'),
        }
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}
        return apis.VendorOrderService.list_orders(slug, filters)

    def post(self, request, slug):
        return apis.VendorOrderService.create_order(slug, request.data)


class VendorOrderDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    def get(self, request, slug, order_id):
        return apis.VendorOrderService.get_order(slug, order_id)

    def put(self, request, slug, order_id):
        return apis.VendorOrderService.update_order(slug, order_id, request.data)

    def delete(self, request, slug, order_id):
        return apis.VendorOrderService.delete_order(slug, order_id)


class VendorOrderReceiveAPIView(APIView):
    permission_classes = [IsAuthenticated]
    schema = AutoSchema()

    def post(self, request, slug, order_id):
        return apis.VendorOrderService.receive_order(slug, order_id)
