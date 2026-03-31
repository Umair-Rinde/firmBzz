"""
Smoke script: FEFO from simplified ProductBatch + invoice from retailer orders.
Run: python test_fefo.py  (from backend-v2, with Django configured)
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from decimal import Decimal
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from firm.models import (
    Firm,
    Customer,
    Product,
    ProductBatch,
    RetailerOrder,
    RetailerOrderItem,
    Invoice,
)
from firm.serializers import (
    RetailerOrderCreateSerializer,
    InvoiceFromRetailerOrdersSerializer,
)
from firm.choices import RetailerOrderStatusChoices

User = get_user_model()

firm, _ = Firm.objects.get_or_create(
    code="TEST-FEFO", defaults={"name": "Test FEFO Firm"}
)

user, _ = User.objects.get_or_create(
    email="fefo-test@example.com",
    defaults={"full_name": "FEFO Test", "phone": "9999999999"},
)

product, _ = Product.objects.get_or_create(
    name="FEFO Ice Cream",
    firm=firm,
    defaults={
        "sale_rate": Decimal("10.00"),
        "rate_per_unit": Decimal("12.00"),
        "product_discount": Decimal("0"),
    },
)

customer, _ = Customer.objects.get_or_create(
    firm=firm,
    business_name="Retailer One",
    defaults={
        "owner_name": "Owner",
        "customer_type": "SUPER_SELLER",
        "whatsapp_number": "111",
        "contact_number": "111",
        "business_address": "Addr",
        "email": "r1@example.com",
    },
)

# Two batches: sooner expiry first
today = date.today()
ProductBatch.objects.filter(product=product).delete()
b1 = ProductBatch.objects.create(
    product=product, quantity=10, expiry_date=today + timedelta(days=5)
)
b2 = ProductBatch.objects.create(
    product=product, quantity=50, expiry_date=today + timedelta(days=30)
)

order_data = {
    "customer": str(customer.id),
    "items": [{"product": str(product.id), "quantity": 15}],
}
ro_ser = RetailerOrderCreateSerializer(
    data=order_data, context={"firm": firm, "request_user": user}
)
assert ro_ser.is_valid(), ro_ser.errors
order = ro_ser.save()
assert order.status == RetailerOrderStatusChoices.SUBMITTED

inv_ser = InvoiceFromRetailerOrdersSerializer(
    data={"retailer_order_ids": [str(order.id)]},
    context={"firm": firm, "request_user": user},
)
assert inv_ser.is_valid(), inv_ser.errors
invoice = inv_ser.save()

b1.refresh_from_db()
b2.refresh_from_db()
print("Invoice total:", invoice.total_amount)
print("Batch1 qty (expect 0):", b1.quantity)
print("Batch2 qty (expect 45):", b2.quantity)
print("Invoice lines:", invoice.items.count())
assert b1.quantity == 0 and b2.quantity == 45
print("OK")
