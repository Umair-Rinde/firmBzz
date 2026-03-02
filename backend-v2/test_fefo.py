import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import TestCase
from django.contrib.auth import get_user_model
from firm.models import Firm, Customer, Product, Vendor, ProductBatch, Invoice, InvoiceItem
from firm.serializers import InvoiceCreateUpdateSerializer
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

User = get_user_model()

# Setup basic test objects
firm, _ = Firm.objects.get_or_create(code='TEST-FIRM-CODE', defaults={'name': 'Test Firm', 'slug': 'test-firm-code'})
user, _ = User.objects.get_or_create(email='test@example.com', defaults={'full_name': 'Test User'})


vendor, _ = Vendor.objects.get_or_create(firm=firm, vendor_name="Test Vendor")
product, _ = Product.objects.get_or_create(name='Test Product FEFO', firm=firm, category='ELECTRONICS')

# Customer (Super Seller)
customer_super, _ = Customer.objects.get_or_create(
    firm=firm, 
    business_name='Super Seller Cust',
    customer_type='SUPER_SELLER',
    defaults={'name': 'Super', 'phone_number': '1234'}
)

# Create two batches for this product
# Batch 1: expires sooner
batch1, _ = ProductBatch.objects.get_or_create(
    product=product,
    vendor=vendor,
    batch_number='BATCH-EXPIRE-SOON',
    defaults={
        'received_date': timezone.now() - timedelta(days=10),
        'expiry_date': timezone.now() + timedelta(days=5),
        'quantity_received': 100,
        'quantity_remaining': 10,  # only 10 left in this batch
        'cost_price': Decimal('5.00'),
        'selling_price_super_seller': Decimal('10.00'),
        'selling_price_distributor': Decimal('12.00')
    }
)

# Batch 2: expires later
batch2, _ = ProductBatch.objects.get_or_create(
    product=product,
    vendor=vendor,
    batch_number='BATCH-EXPIRE-LATER',
    defaults={
        'received_date': timezone.now() - timedelta(days=5),
        'expiry_date': timezone.now() + timedelta(days=30),
        'quantity_received': 100,
        'quantity_remaining': 50,  # 50 left here
        'cost_price': Decimal('6.00'),
        'selling_price_super_seller': Decimal('11.00'),
        'selling_price_distributor': Decimal('13.00')
    }
)

# Reset quantities just in case they already existed
batch1.quantity_remaining = 10
batch1.save()
batch2.quantity_remaining = 50
batch2.save()

print(f"Initial: Batch 1 remaining: {batch1.quantity_remaining}, Batch 2 remaining: {batch2.quantity_remaining}")

# Re-run Create Invoice serializer to ask for 15 units.
# Expectation: Takes 10 from batch1, 5 from batch2.
# Total for Super Seller: (10 * $10) + (5 * $11) = $100 + $55 = $155
data = {
    'customer': customer_super.id,
    'items': [
        {
            'product': product.id,
            'quantity': 15,
            'rate': 0 # not required because logic calculates it
        }
    ]
}

serializer = InvoiceCreateUpdateSerializer(data=data, context={'request_user': user})
if serializer.is_valid():
    invoice = serializer.save()
    print(f"Invoice Created: {invoice.invoice_number}")
    print(f"Total Amount Expected: 155.00, Actual: {invoice.total_amount}")
    
    for item in invoice.items.all():
        print(f"  Item: {item.product.name}, Qty: {item.quantity}, Rate: {item.rate}, Batch: {item.product_batch.batch_number if item.product_batch else 'None'}")
        
    batch1.refresh_from_db()
    batch2.refresh_from_db()
    
    print(f"Final: Batch 1 remaining (expected 0): {batch1.quantity_remaining}")
    print(f"Final: Batch 2 remaining (expected 45): {batch2.quantity_remaining}")
else:
    print("Errors:", serializer.errors)
