from .models import Firm, Product, VendorOrder, VendorOrderItem, Vendor, Customer
from accounts.models import FirmUsers
from .serializers import (
    FirmSerializer, ProductSerializer, VendorOrderSerializer, 
    VendorOrderCreateSerializer, FirmUserSerializer, FirmUserCreateSerializer,
    FirmUserUpdateSerializer, VendorSerializer, CustomerSerializer
)
from portal.base import BaseResponse
from django.db import transaction
from django.utils import timezone

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
    def list_firms():
        firms = Firm.objects.all()
        serializer = FirmSerializer(firms, many=True)
        data = {"rows": serializer.data, "count": firms.count()}
        return BaseResponse(
            data=data,
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
        data = {"rows": serializer.data, "count": products.count()}
        return BaseResponse(
            data=data,
            status=200
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
        data = {"rows": serializer.data, "count": orders.count()}
        return BaseResponse(
            data=data,
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
    def receive_order(firm_slug, order_id, data):
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
            # Process received quantities if provided
            items_data = data.get('items', [])
            for item_data in items_data:
                try:
                    order_item = VendorOrderItem.objects.get(id=item_data['id'], order=order)
                    order_item.quantity_received = item_data.get('quantity_received', order_item.quantity_ordered)
                    order_item.save()
                except (VendorOrderItem.DoesNotExist, KeyError):
                    continue

            # Update order status
            order.order_status = 'RECEIVED'
            order.received_date = timezone.now()
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

class FirmUserService:
    @staticmethod
    def list_firm_users(firm_slug):
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
            return BaseResponse(success=False, message="Firm not found", status=404)

        # Exclude admin and owner users from firm user management
        firm_users = FirmUsers.objects.filter(
            firm=firm,
        ).exclude(user__user_type='ADMIN')

        serializer = FirmUserSerializer(firm_users, many=True)
        data = {"rows": serializer.data, "count": firm_users.count()}
        return BaseResponse(data=data, status=200)

    @staticmethod
    def create_firm_user(firm_slug, data):
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
            return BaseResponse(success=False, message="Firm not found", status=404)

        serializer = FirmUserCreateSerializer(data=data, context={'firm': firm})
        if serializer.is_valid():
            firm_user = serializer.save()
            return BaseResponse(
                message="User created and added to firm successfully",
                data=FirmUserSerializer(firm_user).data,
                status=201
            )
        return BaseResponse(
            success=False,
            message="Invalid data",
            errors=serializer.errors,
            status=400
        )

    @staticmethod
    def get_firm_user(firm_slug, user_id):
        try:
            firm_user = FirmUsers.objects.get(id=user_id, firm__slug=firm_slug)
            serializer = FirmUserSerializer(firm_user)
            return BaseResponse(data=serializer.data, status=200)
        except FirmUsers.DoesNotExist:
            return BaseResponse(success=False, message="User not found", status=404)

    @staticmethod
    def update_firm_user(firm_slug, user_id, data):
        try:
            firm_user = FirmUsers.objects.get(id=user_id, firm__slug=firm_slug)
        except FirmUsers.DoesNotExist:
            return BaseResponse(success=False, message="User not found", status=404)

        serializer = FirmUserUpdateSerializer(firm_user, data=data, partial=True)
        if serializer.is_valid():
            firm_user = serializer.save()
            return BaseResponse(
                message="User updated successfully",
                data=FirmUserSerializer(firm_user).data,
                status=200
            )
        return BaseResponse(
            success=False,
            message="Invalid data",
            errors=serializer.errors,
            status=400
        )

    @staticmethod
    def delete_firm_user(firm_slug, user_id):
        # We implementation deactivation instead of hard delete for users
        try:
            firm_user = FirmUsers.objects.get(id=user_id, firm__slug=firm_slug)
            user = firm_user.user
            user.is_active = False
            user.save()
            return BaseResponse(message="User deactivated successfully", status=200)
        except FirmUsers.DoesNotExist:
            return BaseResponse(success=False, message="User not found", status=404)


class VendorService:
    @staticmethod
    def list_vendors(firm_slug):
        try:
            vendors = Vendor.objects.filter(firm__slug=firm_slug)
            serializer = VendorSerializer(vendors, many=True)
            data = {"rows": serializer.data, "count": vendors.count()}
            return BaseResponse(data=data, status=200)
        except Exception as e:
            return BaseResponse(success=False, message=str(e), status=500)

    @staticmethod
    def create_vendor(firm_slug, data):
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
            return BaseResponse(success=False, message="Firm not found", status=404)

        serializer = VendorSerializer(data=data)
        if serializer.is_valid():
            serializer.save(firm=firm)
            return BaseResponse(message="Vendor created successfully", data=serializer.data, status=201)
        return BaseResponse(success=False, message="Invalid data", errors=serializer.errors, status=400)

    @staticmethod
    def get_vendor(firm_slug, vendor_id):
        try:
            vendor = Vendor.objects.get(id=vendor_id, firm__slug=firm_slug)
            serializer = VendorSerializer(vendor)
            return BaseResponse(data=serializer.data, status=200)
        except Vendor.DoesNotExist:
            return BaseResponse(success=False, message="Vendor not found", status=404)

    @staticmethod
    def update_vendor(firm_slug, vendor_id, data):
        try:
            vendor = Vendor.objects.get(id=vendor_id, firm__slug=firm_slug)
        except Vendor.DoesNotExist:
            return BaseResponse(success=False, message="Vendor not found", status=404)

        serializer = VendorSerializer(vendor, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return BaseResponse(message="Vendor updated successfully", data=serializer.data, status=200)
        return BaseResponse(success=False, message="Invalid data", errors=serializer.errors, status=400)

    @staticmethod
    def delete_vendor(firm_slug, vendor_id):
        try:
            vendor = Vendor.objects.get(id=vendor_id, firm__slug=firm_slug)
            vendor.delete()
            return BaseResponse(message="Vendor deleted successfully", status=200)
        except Vendor.DoesNotExist:
            return BaseResponse(success=False, message="Vendor not found", status=404)


class CustomerService:
    @staticmethod
    def list_customers(firm_slug):
        try:
            customers = Customer.objects.filter(firm__slug=firm_slug)
            serializer = CustomerSerializer(customers, many=True)
            data = {"rows": serializer.data, "count": customers.count()}
            return BaseResponse(data=data, status=200)
        except Exception as e:
            return BaseResponse(success=False, message=str(e), status=500)

    @staticmethod
    def create_customer(firm_slug, data):
        try:
            firm = Firm.objects.get(slug=firm_slug)
        except Firm.DoesNotExist:
            return BaseResponse(success=False, message="Firm not found", status=404)

        serializer = CustomerSerializer(data=data)
        if serializer.is_valid():
            serializer.save(firm=firm)
            return BaseResponse(message="Customer created successfully", data=serializer.data, status=201)
        return BaseResponse(success=False, message="Invalid data", errors=serializer.errors, status=400)

    @staticmethod
    def get_customer(firm_slug, customer_id):
        try:
            customer = Customer.objects.get(id=customer_id, firm__slug=firm_slug)
            serializer = CustomerSerializer(customer)
            return BaseResponse(data=serializer.data, status=200)
        except Customer.DoesNotExist:
            return BaseResponse(success=False, message="Customer not found", status=404)

    @staticmethod
    def update_customer(firm_slug, customer_id, data):
        try:
            customer = Customer.objects.get(id=customer_id, firm__slug=firm_slug)
        except Customer.DoesNotExist:
            return BaseResponse(success=False, message="Customer not found", status=404)

        serializer = CustomerSerializer(customer, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return BaseResponse(message="Customer updated successfully", data=serializer.data, status=200)
        return BaseResponse(success=False, message="Invalid data", errors=serializer.errors, status=400)

    @staticmethod
    def delete_customer(firm_slug, customer_id):
        try:
            customer = Customer.objects.get(id=customer_id, firm__slug=firm_slug)
            customer.delete()
            return BaseResponse(message="Customer deleted successfully", status=200)
        except Customer.DoesNotExist:
            return BaseResponse(success=False, message="Customer not found", status=404)


class ProductCrudService:
    @staticmethod
    def get_product(firm_slug, product_id):
        try:
            product = Product.objects.get(id=product_id, firm__slug=firm_slug)
            serializer = ProductSerializer(product)
            return BaseResponse(data=serializer.data, status=200)
        except Product.DoesNotExist:
            return BaseResponse(success=False, message="Product not found", status=404)

    @staticmethod
    def update_product(firm_slug, product_id, data):
        try:
            product = Product.objects.get(id=product_id, firm__slug=firm_slug)
        except Product.DoesNotExist:
            return BaseResponse(success=False, message="Product not found", status=404)

        serializer = ProductSerializer(product, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return BaseResponse(message="Product updated successfully", data=serializer.data, status=200)
        return BaseResponse(success=False, message="Invalid data", errors=serializer.errors, status=400)

    @staticmethod
    def delete_product(firm_slug, product_id):
        try:
            product = Product.objects.get(id=product_id, firm__slug=firm_slug)
            product.delete()
            return BaseResponse(message="Product deleted successfully", status=200)
        except Product.DoesNotExist:
            return BaseResponse(success=False, message="Product not found", status=404)