from .models import Firm, Product, Vendor,VendorOrder
from .serializers import (
    FirmSerializer, ProductSerializer, VendorOrderSerializer, 
    VendorOrderCreateSerializer, FirmDropdownSerializer, VendorSerializer
)
from portal.base import BaseResponse
from django.db import transaction
from datetime import date

class FirmService:
    @staticmethod
    def create_firm(data):
        serializer = FirmSerializer(data=data)
        if serializer.is_valid():
            firm = serializer.save()
            return BaseResponse(
                message="Firm created successfully",
                data=serializer.data,
                status=201
            )
        return BaseResponse(
            success=False,
            message="Invalid data",
            errors=serializer.errors,
            status=400
        )

    @staticmethod
    def get_firm(slug):
        try:
            firm = Firm.objects.get(slug=slug)
            serializer = FirmSerializer(firm)
            return BaseResponse(
                data=serializer.data,
                status=200
            )
        except Firm.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )

    @staticmethod
    def update_firm(slug, data):
        try:
            firm = Firm.objects.get(slug=slug)
        except Firm.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )
        serializer = FirmSerializer(firm, data=data)
        if serializer.is_valid():
            serializer.save()
            return BaseResponse(
                message="Firm updated successfully",
                data=serializer.data,
                status=200
            )
        return BaseResponse(
            success=False,
            message="Invalid data",
            errors=serializer.errors,
            status=400
        )

    @staticmethod
    def delete_firm(slug):
        try:
            firm = Firm.objects.get(slug=slug)
        except Firm.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )
        firm.delete()
        return BaseResponse(
            message="Firm deleted successfully",
            status=200
        )

    @staticmethod
    def list_firms():
        firms = Firm.objects.all()
        serializer = FirmSerializer(firms, many=True)
        return BaseResponse(
            data={"rows": serializer.data, "count": firms.count()},
            status=200
        )

    @staticmethod
    def add_user_to_firm(slug, data):
        try:
            firm = Firm.objects.get(slug=slug)
        except Firm.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )
        
        # Inject firm ID
        data["firm"] = firm.id
        # Ensure user_type is FIRM_USER if not provided
        if "user_type" not in data:
            # We need to import UserTypeChoices. 
            # To avoid circular imports, maybe just string "FIRM_USER" if logic permits, 
            # but better to import from accounts.choices
            from accounts.choices import UserTypeChoices
            data["user_type"] = UserTypeChoices.FIRM_USER
        
        from accounts.serializers import UserCreateSerializer
        serializer = UserCreateSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            return BaseResponse(
                message="User created successfully",
                data={"id": user.id},
                status=201
            )
        return BaseResponse(
            success=False,
            message="Invalid data",
            errors=serializer.errors,
            status=400
        )

class ProductService:
    @staticmethod
    def create_product(firm_slug, data):
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
             return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )
        
        serializer = ProductSerializer(data=data)
        if serializer.is_valid():
            serializer.save(firm=firm)
            return BaseResponse(
                message="Product created successfully",
                data=serializer.data,
                status=201
            )
        return BaseResponse(
            success=False,
            message="Invalid data",
            errors=serializer.errors,
            status=400
        )

    @staticmethod
    def list_products(firm_slug):
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
             return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )
        
        products = Product.objects.filter(firm=firm)
        serializer = ProductSerializer(products, many=True)
        return BaseResponse(
            data={"rows": serializer.data, "count": products.count()},
            status=200
        )

    @staticmethod
    def delete_product(firm_slug, product_id):
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Product not found",
                status=404
            )
        product.delete()
        return BaseResponse(
            message="Product deleted successfully",
            status=200
        )

    @staticmethod
    def list_one_product(firm_slug, product_id):
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Product not found",
                status=404
            )
        serializer = ProductSerializer(product)
        return BaseResponse(
            data=serializer.data,
            status=200
        )
    @staticmethod
    def update_product(firm_slug, product_id, data):
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Product not found",
                status=404
            )
        serializer = ProductSerializer(product, data=data)
        if serializer.is_valid():
            serializer.save()
            return BaseResponse(
                message="Product updated successfully",
                data=serializer.data,
                status=200
            )
        return BaseResponse(
            success=False,
            message="Invalid data",
            errors=serializer.errors,
            status=400
        )

class VendorOrderService:
    @staticmethod
    def create_order(firm_slug, data):
        """Create a new vendor order with items"""
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )
        
        # Add firm to data
        data['firm'] = firm.id
        
        serializer = VendorOrderCreateSerializer(data=data)
        if serializer.is_valid():
            with transaction.atomic():
                order = serializer.save(firm=firm)
                # Return full order details
                response_serializer = VendorOrderSerializer(order)
                return BaseResponse(
                    message="Vendor order created successfully",
                    data=response_serializer.data,
                    status=201
                )
        return BaseResponse(
            success=False,
            message="Invalid data",
            errors=serializer.errors,
            status=400
        )
    
    @staticmethod
    def list_orders(firm_slug, filters=None):
        """List all vendor orders for a firm"""
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )
        
        orders = VendorOrder.objects.filter(firm=firm)
        
        # Apply filters if provided
        if filters:
            if 'vendor' in filters:
                orders = orders.filter(vendor_id=filters['vendor'])
            if 'order_status' in filters:
                orders = orders.filter(order_status=filters['order_status'])
            if 'payment_status' in filters:
                orders = orders.filter(payment_status=filters['payment_status'])
        
        serializer = VendorOrderSerializer(orders, many=True)
        return BaseResponse(
            data={"rows": serializer.data, "count": orders.count()},
            status=200
        )
    
    @staticmethod
    def get_order(firm_slug, order_id):
        """Get details of a specific vendor order"""
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )
        
        try:
            order = VendorOrder.objects.get(id=order_id, firm=firm)
            serializer = VendorOrderSerializer(order)
            return BaseResponse(
                data=serializer.data,
                status=200
            )
        except VendorOrder.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Order not found",
                status=404
            )
    
    @staticmethod
    def update_order(firm_slug, order_id, data):
        """Update a vendor order"""
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )
        
        try:
            order = VendorOrder.objects.get(id=order_id, firm=firm)
        except VendorOrder.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Order not found",
                status=404
            )
        
        serializer = VendorOrderCreateSerializer(order, data=data, partial=True)
        if serializer.is_valid():
            with transaction.atomic():
                order = serializer.save()
                response_serializer = VendorOrderSerializer(order)
                return BaseResponse(
                    message="Order updated successfully",
                    data=response_serializer.data,
                    status=200
                )
        return BaseResponse(
            success=False,
            message="Invalid data",
            errors=serializer.errors,
            status=400
        )
    
    @staticmethod
    def delete_order(firm_slug, order_id):
        """Delete a vendor order"""
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )
        
        try:
            order = VendorOrder.objects.get(id=order_id, firm=firm)
            order.delete()
            return BaseResponse(
                message="Order deleted successfully",
                status=200
            )
        except VendorOrder.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Order not found",
                status=404
            )
    
    @staticmethod
    def receive_order(firm_slug, order_id):
        """Mark order as received and create product batches"""
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )
        
        try:
            order = VendorOrder.objects.get(id=order_id, firm=firm)
        except VendorOrder.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Order not found",
                status=404
            )
        
        if order.order_status == 'RECEIVED' or order.order_status == 'COMPLETED':
            return BaseResponse(
                success=False,
                message="Order has already been received",
                status=400
            )
        
        with transaction.atomic():
            # Update order status
            order.order_status = 'RECEIVED'
            order.received_date = date.today()
            order.save()
            
            # Create product batches for all items
            batches_created = []
            for item in order.items.all():
                batch = item.create_product_batch()
                if batch:
                    batches_created.append(batch.id)
            
            response_serializer = VendorOrderSerializer(order)
            return BaseResponse(
                message=f"Order received successfully. {len(batches_created)} product batch(es) created.",
                data={
                    "order": response_serializer.data,
                    "batches_created": batches_created
                },
                status=200
            )


class DropdownsService: 
    @staticmethod
    def get_firm_dropdowns():
        try:
            firm = Firm.objects.all()
            serializer = FirmDropdownSerializer(firm, many=True)
            data = serializer.data
            return BaseResponse(
                data=data,
                status=200
            )
        except Exception as e:
            return BaseResponse(
                success=False,
                message=str(e),
                status=500
            )



class VendorService:

    @staticmethod
    def create_vendor(firm_slug, data):
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )

        serializer = VendorSerializer(data=data)
        if serializer.is_valid():
            serializer.save(firm=firm)
            return BaseResponse(
                message="Vendor created successfully",
                data=serializer.data,
                status=201
            )

        return BaseResponse(
            success=False,
            message="Invalid data",
            errors=serializer.errors,
            status=400
        )

    @staticmethod
    def list_vendors(firm_slug):
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
            return BaseResponse(
                success=False,
                message="Firm not found",
                status=404
            )

        vendors = Vendor.objects.filter(firm=firm)
        serializer = VendorSerializer(vendors, many=True)
        return BaseResponse(
            data={"rows": serializer.data, "count": vendors.count()},
            status=200
        )

    @staticmethod
    def get_vendor(firm_slug, vendor_id):
        try:
            firm = Firm.objects.get(slug=firm_slug)
            vendor = Vendor.objects.get(id=vendor_id, firm=firm)
        except (Firm.DoesNotExist, Vendor.DoesNotExist):
            return BaseResponse(
                success=False,
                message="Vendor not found",
                status=404
            )

        serializer = VendorSerializer(vendor)
        return BaseResponse(
            data=serializer.data,
            status=200
        )

    @staticmethod
    def update_vendor(firm_slug, vendor_id, data):
        try:
            firm = Firm.objects.get(slug=firm_slug)
            vendor = Vendor.objects.get(id=vendor_id, firm=firm)
        except (Firm.DoesNotExist, Vendor.DoesNotExist):
            return BaseResponse(
                success=False,
                message="Vendor not found",
                status=404
            )

        serializer = VendorSerializer(vendor, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return BaseResponse(
                message="Vendor updated successfully",
                data=serializer.data,
                status=200
            )

        return BaseResponse(
            success=False,
            message="Invalid data",
            errors=serializer.errors,
            status=400
        )

    @staticmethod
    def delete_vendor(firm_slug, vendor_id):
        try:
            firm = Firm.objects.get(slug=firm_slug)
            vendor = Vendor.objects.get(id=vendor_id, firm=firm)
        except (Firm.DoesNotExist, Vendor.DoesNotExist):
            return BaseResponse(
                success=False,
                message="Vendor not found",
                status=404
            )

        vendor.delete()
        return BaseResponse(
            message="Vendor deleted successfully",
            status=200
        )