import os
import django
import random
from decimal import Decimal
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from firm.models import Firm, Vendor, Customer, Product, VendorOrder, VendorOrderItem, Invoice, InvoiceItem
from django.utils import timezone
from datetime import timedelta

def seed_data():
    print("Starting data seed...")

    firms_data = [
        {"name": "Tech Solutions Inc", "slug": "tech-solutions", "code": "TECH01"},
        {"name": "Global Traders LLC", "slug": "global-traders", "code": "GLOB01"}
    ]
    
    firms = []
    for fd in firms_data:
        firm, created = Firm.objects.get_or_create(slug=fd["slug"], defaults={"name": fd["name"], "code": fd["code"]})
        firms.append(firm)
        if created:
            print(f"Created Firm: {firm.name}")

    for firm in firms:
        print(f"\n--- Seeding for Firm: {firm.name} ---")

        vendors = []
        for i in range(3):
            v, created = Vendor.objects.get_or_create(
                firm=firm,
                vendor_name=f"{firm.name} Vendor {i+1}",
                defaults={
                    "owner_name": f"Vendor Contact {i+1}",
                    "email": f"vendor{i+1}_{firm.slug}@example.com",
                    "whatsapp_number": f"9876543{random.randint(100,999)}",
                    "telephone_number": f"9876543{random.randint(100,999)}",
                    "address": f"Vendor Address {i+1}"
                }
            )
            vendors.append(v)

        customers = []
        for i in range(5):
            c, created = Customer.objects.get_or_create(
                firm=firm,
                business_name=f"{firm.name} Customer {i+1}",
                defaults={
                    "owner_name": f"Customer Contact {i+1}",
                    "email": f"customer{i+1}_{firm.slug}@example.com",
                    "whatsapp_number": f"8765432{random.randint(100,999)}",
                    "contact_number": f"8765432{random.randint(100,999)}",
                    "business_address": f"Customer Address {i+1}",
                    "customer_type": "RETAILER"
                }
            )
            customers.append(c)

        products = []
        for i in range(10):
            p, created = Product.objects.get_or_create(
                firm=firm,
                name=f"Product {i+1} for {firm.name}"
            )
            products.append(p)

        for i in range(15):
            status = random.choice(['PENDING', 'RECEIVED', 'COMPLETED'])
            payment = random.choice(['UNPAID', 'PARTIAL', 'PAID'])
            
            total_amount = Decimal(random.randint(5000, 50000))
            amount_paid = Decimal(0)
            if payment == 'PAID':
                amount_paid = total_amount
            elif payment == 'PARTIAL':
                amount_paid = total_amount / 2
                
            order = VendorOrder.objects.create(
                firm=firm,
                vendor=random.choice(vendors),
                order_number=f"ORD-{firm.code}-{uuid.uuid4().hex[:6].upper()}",
                order_date=timezone.now() - timedelta(days=random.randint(1, 30)),
                order_status=status,
                payment_status=payment,
                total_amount=total_amount,
                amount_paid=amount_paid
            )
            
            VendorOrderItem.objects.create(
                order=order,
                product=random.choice(products),
                quantity_ordered=random.randint(10, 100),
                quantity_received=random.randint(10, 100) if status in ['RECEIVED', 'COMPLETED'] else 0,
                cost_price_per_unit=total_amount / 10,
                selling_price_super_seller=(total_amount / 10) * Decimal('1.2'),
                selling_price_distributor=(total_amount / 10) * Decimal('1.1'),
                batch_number=f"BATCH-{random.randint(1000,9999)}"
            )

        for i in range(20):
            status = random.choice(['PENDING_APPROVAL', 'APPROVED', 'CHANGES_REQUESTED'])
            total_amount = Decimal(random.randint(2000, 30000))
            
            invoice = Invoice.objects.create(
                firm=firm,
                customer=random.choice(customers),
                created_on=timezone.now() - timedelta(days=random.randint(1, 30)),
                status=status,
                total_amount=total_amount,
            )
            
            InvoiceItem.objects.create(
                invoice=invoice,
                product=random.choice(products),
                quantity=random.randint(5, 50),
                rate=total_amount / 5,
            )

        print(f"Seeded 3 Vendors, 5 Customers, 10 Products, 15 Orders, 20 Invoices for {firm.name}")

    print("\nData seed complete!")

if __name__ == "__main__":
    seed_data()
