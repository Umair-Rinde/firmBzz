"""
Seed the entire database with realistic test data.

Usage:
    python manage.py seed            # full seed (wipes existing data first)
    python manage.py seed --no-flush # seed without deleting existing rows
"""

import random
import string
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify

from accounts.models import User, FirmUsers
from firm.pricing import effective_unit_rate
from firm.models import (
    Firm,
    Product,
    ProductBatch,
    Customer,
    Vendor,
    VendorOrder,
    VendorOrderItem,
    RetailerOrder,
    RetailerOrderItem,
    Invoice,
    InvoiceItem,
    Payment,
)

# ---------------------------------------------------------------------------
# Data pools
# ---------------------------------------------------------------------------

FIRM_DATA = [
    {"name": "Sunrise Beverages Pvt Ltd", "code": "SUNBEV"},
    {"name": "GreenLeaf Agro Foods", "code": "GRNLF"},
    {"name": "Royal Spice Traders", "code": "RYLSPC"},
    {"name": "Desi Dairy Products", "code": "DSDRY"},
]

PRODUCT_CATEGORIES = [
    "Soft Drinks", "Juices", "Water", "Energy Drinks", "Tea & Coffee",
    "Snacks", "Biscuits", "Namkeen", "Chips", "Chocolates",
    "Oils & Ghee", "Spices", "Flour", "Rice", "Pulses",
    "Dairy", "Ice Cream", "Frozen Foods", "Sauces", "Pickles",
]

PRODUCT_NAMES = [
    "Cola Classic 250ml", "Cola Classic 500ml", "Cola Classic 1L", "Cola Classic 2L",
    "Lime Soda 250ml", "Lime Soda 500ml", "Orange Fizz 300ml", "Orange Fizz 1L",
    "Mango Juice 200ml", "Mango Juice 1L", "Apple Juice 250ml", "Mixed Fruit 1L",
    "Mineral Water 500ml", "Mineral Water 1L", "Mineral Water 5L", "Mineral Water 20L",
    "Energy Boost 250ml", "Energy Boost 500ml", "Sports Drink 500ml", "Sports Drink 1L",
    "Green Tea 100g", "Masala Chai 250g", "Filter Coffee 200g", "Instant Coffee 50g",
    "Salted Chips 50g", "Salted Chips 150g", "Masala Chips 50g", "Masala Chips 150g",
    "Cream Biscuit 100g", "Cream Biscuit 250g", "Digestive 200g", "Marie Gold 250g",
    "Aloo Bhujia 200g", "Mixture 400g", "Sev 200g", "Peanuts Masala 150g",
    "Dark Chocolate 50g", "Milk Chocolate 100g", "White Chocolate 50g", "Chocolate Bar 40g",
    "Groundnut Oil 1L", "Groundnut Oil 5L", "Sunflower Oil 1L", "Sunflower Oil 5L",
    "Mustard Oil 1L", "Coconut Oil 500ml", "Pure Ghee 500ml", "Pure Ghee 1L",
    "Turmeric 100g", "Red Chilli 100g", "Coriander 100g", "Garam Masala 50g",
    "Cumin Seeds 100g", "Black Pepper 50g", "Kitchen King 100g", "Biryani Masala 50g",
    "Wheat Flour 5kg", "Wheat Flour 10kg", "Maida 1kg", "Besan 500g",
    "Basmati Rice 5kg", "Basmati Rice 10kg", "Sona Masoori 5kg", "Brown Rice 1kg",
    "Toor Dal 1kg", "Moong Dal 1kg", "Chana Dal 1kg", "Urad Dal 500g",
    "Fresh Milk 500ml", "Fresh Milk 1L", "Paneer 200g", "Butter 100g",
    "Curd 400g", "Lassi 200ml", "Flavored Yogurt 100g", "Cheese Slice 100g",
    "Vanilla Ice Cream 500ml", "Chocolate Ice Cream 500ml", "Mango Kulfi 60ml",
    "Tomato Ketchup 500g", "Soy Sauce 200ml", "Hot Sauce 100ml", "Mayo 250g",
    "Mango Pickle 500g", "Lemon Pickle 300g", "Mixed Pickle 500g", "Garlic Pickle 250g",
    "Frozen Peas 500g", "Frozen Corn 500g", "Frozen Paratha 5pc", "Frozen Samosa 10pc",
]

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan",
    "Krishna", "Ishaan", "Aadhya", "Ananya", "Diya", "Myra", "Sara", "Ira",
    "Priya", "Riya", "Neha", "Pooja", "Rahul", "Vikram", "Amit", "Rohit",
    "Suresh", "Rajesh", "Deepak", "Manoj", "Karan", "Nikhil", "Sneha", "Kavita",
    "Sunita", "Meera", "Lakshmi", "Anjali", "Divya", "Swati", "Nisha", "Pallavi",
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Gupta", "Singh", "Kumar", "Reddy", "Nair",
    "Joshi", "Mehta", "Rao", "Iyer", "Pillai", "Desai", "Shah", "Agarwal",
    "Mishra", "Tiwari", "Pandey", "Saxena", "Bansal", "Malhotra", "Kapur", "Bhat",
]

CITIES = [
    ("Mumbai", "Maharashtra"), ("Delhi", "Delhi"), ("Bangalore", "Karnataka"),
    ("Hyderabad", "Telangana"), ("Chennai", "Tamil Nadu"), ("Kolkata", "West Bengal"),
    ("Pune", "Maharashtra"), ("Ahmedabad", "Gujarat"), ("Jaipur", "Rajasthan"),
    ("Lucknow", "Uttar Pradesh"), ("Surat", "Gujarat"), ("Nagpur", "Maharashtra"),
    ("Indore", "Madhya Pradesh"), ("Bhopal", "Madhya Pradesh"), ("Coimbatore", "Tamil Nadu"),
    ("Vadodara", "Gujarat"), ("Patna", "Bihar"), ("Kanpur", "Uttar Pradesh"),
]

BUSINESS_PREFIXES = [
    "Sri", "Shree", "New", "Modern", "Royal", "City", "Star", "Golden",
    "Diamond", "Pearl", "Silver", "National", "Popular", "Lucky", "Super",
]

BUSINESS_SUFFIXES = [
    "Traders", "Enterprises", "Distributors", "Agencies", "Stores", "Mart",
    "Sales Corporation", "General Store", "Provision Store", "Trading Co",
    "Supply Chain", "Wholesale", "Retail Hub", "Super Market", "Bazaar",
]

VENDOR_TYPES = [
    "Foods", "Beverages", "Dairy", "FMCG", "Agro", "Spices", "Oils",
    "Chemicals", "Packaging", "Logistics", "Cold Chain", "Imports",
]

HSN_CODES = [
    "2201", "2202", "2009", "1905", "1704", "1507", "0904",
    "1006", "0713", "0401", "2103", "2001", "0710", "1101",
]

PAYMENT_REFS = [
    "UTR", "NEFT", "IMPS", "CHQ", "TXN", "REF",
]

NOTES_POOL = [
    "Urgent delivery needed", "Regular monthly order", "Special discount applied",
    "Holiday season stock", "Replace damaged goods", "Priority customer",
    "Check quality before dispatch", "Fragile items - handle carefully",
    "Bulk order discount agreed", "Cash on delivery", "Need by weekend",
    "Festival season order", "Repeat order - same specs", "Trial order for new product",
    "", "", "", "",
]


def rand_phone():
    return f"9{random.randint(100000000, 999999999)}"


def rand_gst():
    state = random.randint(1, 37)
    chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=10))
    return f"{state:02d}{chars}Z{random.choice(string.digits)}"


def rand_fssai():
    return f"{random.randint(10000000000000, 99999999999999)}"


def rand_pincode():
    return str(random.randint(100000, 999999))


def rand_email(name):
    domain = random.choice(["gmail.com", "yahoo.com", "outlook.com", "business.in"])
    clean = name.lower().replace(" ", ".").replace("'", "")
    return f"{clean}{random.randint(1, 999)}@{domain}"


def rand_date_past(days_back=365):
    return timezone.now() - timedelta(days=random.randint(1, days_back))


def rand_date_future(days_ahead=365):
    return timezone.now() + timedelta(days=random.randint(30, days_ahead))


def rand_decimal(low, high, places=2):
    val = random.uniform(low, high)
    return Decimal(str(round(val, places)))


class Command(BaseCommand):
    help = "Seed the database with comprehensive test data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-flush",
            action="store_true",
            help="Don't delete existing data before seeding",
        )

    def handle(self, *args, **options):
        if not options["no_flush"]:
            self.stdout.write("Flushing existing data...")
            Payment.objects.all().delete()
            InvoiceItem.objects.all().delete()
            Invoice.objects.all().delete()
            RetailerOrderItem.objects.all().delete()
            RetailerOrder.objects.all().delete()
            VendorOrderItem.objects.all().delete()
            VendorOrder.objects.all().delete()
            ProductBatch.objects.all().delete()
            Product.objects.all().delete()
            Customer.objects.all().delete()
            Vendor.objects.all().delete()
            FirmUsers.objects.all().delete()
            Firm.objects.all().delete()
            User.objects.filter(is_admin=False).delete()

        self._seed_admin()
        firms = self._seed_firms()
        users = self._seed_users(firms)
        products_map = self._seed_products(firms)
        customers_map = self._seed_customers(firms)
        vendors_map = self._seed_vendors(firms)
        self._seed_product_batches(products_map)
        self._seed_vendor_orders(firms, vendors_map, products_map, users)
        self._seed_retailer_orders(firms, customers_map, products_map, users)
        self._seed_invoices(firms, customers_map, products_map, users)

        self.stdout.write(self.style.SUCCESS("\nSeed complete!"))

    # ------------------------------------------------------------------
    def _seed_admin(self):
        if User.objects.filter(email="admin@firmbizz.com").exists():
            self.stdout.write("  Admin user already exists, skipping.")
            return
        admin = User.objects.create_user(
            email="admin@firmbizz.com",
            password="admin123",
            full_name="System Admin",
            phone="9000000000",
        )
        admin.user_type = "ADMIN"
        admin.is_admin = True
        admin.is_active = True
        admin.save()
        self.stdout.write(self.style.SUCCESS("  Created admin: admin@firmbizz.com / admin123"))

    # ------------------------------------------------------------------
    def _seed_firms(self):
        firms = []
        for fd in FIRM_DATA:
            firm, created = Firm.objects.get_or_create(
                code=fd["code"],
                defaults={"name": fd["name"]},
            )
            firms.append(firm)
            tag = "Created" if created else "Exists"
            self.stdout.write(f"  {tag} firm: {firm.name} ({firm.slug})")
        return firms

    # ------------------------------------------------------------------
    def _seed_users(self, firms):
        """Create 8-12 users per firm with different roles."""
        all_users = {}
        roles = ["FIRM_ADMIN", "FIRM_USER", "SALES_PERSON", "SUPERSELLER_USER", "DISTRIBUTOR_USER"]
        user_counter = 0

        for firm in firms:
            firm_users_list = []
            num_users = random.randint(8, 12)

            for i in range(num_users):
                user_counter += 1
                first = random.choice(FIRST_NAMES)
                last = random.choice(LAST_NAMES)
                full_name = f"{first} {last}"
                email = f"{first.lower()}.{last.lower()}{user_counter}@firmbizz.com"
                city, state = random.choice(CITIES)
                gender = random.choice(["MALE", "FEMALE", "OTHER"])

                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        "full_name": full_name,
                        "phone": rand_phone(),
                        "gender": gender,
                        "user_type": "FIRM_USER",
                        "address": f"{random.randint(1, 500)}, {random.choice(BUSINESS_PREFIXES)} Street",
                        "city": city,
                        "state": state,
                        "country": "India",
                        "pincode": rand_pincode(),
                        "is_active": random.random() > 0.1,
                    },
                )
                if created:
                    user.set_password("test1234")
                    user.save()

                role = roles[0] if i == 0 else random.choice(roles[1:])
                fu, _ = FirmUsers.objects.get_or_create(
                    user=user,
                    firm=firm,
                    defaults={
                        "role": role,
                        "aadhaar_number": f"{random.randint(100000000000, 999999999999)}",
                        "pan_number": f"{''.join(random.choices(string.ascii_uppercase, k=5))}{random.randint(1000, 9999)}{''.join(random.choices(string.ascii_uppercase, k=1))}",
                        "home_address": f"{city}, {state}",
                    },
                )
                firm_users_list.append(user)

            all_users[firm.id] = firm_users_list
            self.stdout.write(f"  Created {num_users} users for {firm.name}")

        # Cross-firm memberships: pick 5 random users and add to another firm
        all_user_objs = list(User.objects.filter(is_admin=False))
        for _ in range(min(5, len(all_user_objs))):
            user = random.choice(all_user_objs)
            other_firm = random.choice(firms)
            FirmUsers.objects.get_or_create(
                user=user,
                firm=other_firm,
                defaults={"role": random.choice(roles[1:])},
            )

        return all_users

    # ------------------------------------------------------------------
    def _seed_products(self, firms):
        """Create 40-60 products per firm."""
        products_map = {}
        for firm in firms:
            products = []
            num_products = random.randint(40, 60)
            used_names = set()

            for i in range(num_products):
                name = random.choice(PRODUCT_NAMES)
                while name in used_names:
                    name = random.choice(PRODUCT_NAMES)
                used_names.add(name)

                category = random.choice(PRODUCT_CATEGORIES)
                mrp = rand_decimal(10, 2000)
                purchase_rate = mrp * Decimal("0.55")
                sale_rate = mrp * Decimal("0.75")
                rate_per_unit = mrp * Decimal("0.70")
                gst = random.choice([Decimal("5"), Decimal("12"), Decimal("18"), Decimal("28")])

                scheme_type = random.choices(
                    ["NONE", "BUY_X_GET_Y", "FLAT_DISCOUNT"],
                    weights=[70, 20, 10],
                )[0]

                prod = Product.objects.create(
                    firm=firm,
                    product_code=f"P{firm.code[:3]}{i + 1:04d}",
                    name=name,
                    category=category,
                    hsn_code=random.choice(HSN_CODES),
                    gst_percent=gst,
                    mrp=mrp,
                    purchase_rate=round(purchase_rate, 2),
                    purchase_rate_per_unit=round(purchase_rate * Decimal("0.95"), 2),
                    sale_rate=round(sale_rate, 2),
                    rate_per_unit=round(rate_per_unit, 2),
                    product_discount=rand_decimal(0, 15) if random.random() > 0.5 else Decimal("0"),
                    no_discount=random.random() < 0.1,
                    scheme_type=scheme_type,
                    scheme_buy_qty=random.randint(3, 10) if scheme_type == "BUY_X_GET_Y" else 0,
                    scheme_free_qty=random.randint(1, 3) if scheme_type == "BUY_X_GET_Y" else 0,
                    scheme_discount_percent=rand_decimal(5, 25) if scheme_type == "FLAT_DISCOUNT" else Decimal("0"),
                    is_active=random.random() > 0.05,
                    liters=rand_decimal(0, 5) if "ml" in name.lower() or "l" in name.lower() else Decimal("0"),
                    pack=Decimal(str(random.choice([1, 6, 12, 24]))),
                )
                products.append(prod)

            products_map[firm.id] = products
            self.stdout.write(f"  Created {num_products} products for {firm.name}")
        return products_map

    # ------------------------------------------------------------------
    def _seed_customers(self, firms):
        """Create 20-30 customers per firm."""
        customers_map = {}
        for firm in firms:
            customers = []
            num_customers = random.randint(20, 30)

            for i in range(num_customers):
                city, state = random.choice(CITIES)
                owner = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
                biz_name = f"{random.choice(BUSINESS_PREFIXES)} {random.choice(LAST_NAMES)} {random.choice(BUSINESS_SUFFIXES)}"
                ctype = random.choice(["SUPER_SELLER", "DISTRIBUTOR"])

                cust = Customer(
                    firm=firm,
                    customer_type=ctype,
                    business_name=biz_name,
                    owner_name=owner,
                    fssai_number=rand_fssai() if random.random() > 0.3 else None,
                    gst_number=rand_gst() if random.random() > 0.2 else None,
                    fssai_expiry=rand_date_future() if random.random() > 0.4 else None,
                    gst_expiry=rand_date_future() if random.random() > 0.4 else None,
                    whatsapp_number=rand_phone(),
                    contact_number=rand_phone(),
                    business_address=f"{random.randint(1, 999)}, {city} Main Road, {city}, {state}",
                    email=rand_email(biz_name.split()[0]),
                    is_active=random.random() > 0.08,
                    reference_code=f"R{firm.code[:3]}{i + 1:04d}",
                    default_discount_percent=rand_decimal(0, 12)
                    if random.random() > 0.25
                    else Decimal("0"),
                    slug=slugify(f"{biz_name}-{firm.code}-{i}"),
                )
                cust.save()
                customers.append(cust)

            customers_map[firm.id] = customers
            self.stdout.write(f"  Created {num_customers} customers for {firm.name}")
        return customers_map

    # ------------------------------------------------------------------
    def _seed_vendors(self, firms):
        """Create 8-15 vendors per firm."""
        vendors_map = {}
        for firm in firms:
            vendors = []
            num_vendors = random.randint(8, 15)

            for i in range(num_vendors):
                city, state = random.choice(CITIES)
                owner = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
                vtype = random.choice(VENDOR_TYPES)
                v_name = f"{random.choice(LAST_NAMES)} {vtype} Pvt Ltd"

                vendor = Vendor.objects.create(
                    firm=firm,
                    vendor_name=v_name,
                    owner_name=owner,
                    gst_number=rand_gst(),
                    gst_expiry=rand_date_future(),
                    whatsapp_number=rand_phone(),
                    telephone_number=rand_phone() if random.random() > 0.3 else None,
                    address=f"Plot {random.randint(1, 200)}, Industrial Area, {city}, {state}",
                    bank_account_number=f"{random.randint(10000000000, 99999999999)}",
                    ifsc_code=f"{''.join(random.choices(string.ascii_uppercase, k=4))}0{random.randint(100000, 999999)}",
                    email=rand_email(v_name.split()[0]),
                    reference_code=f"V{firm.code[:3]}{i + 1:04d}",
                )
                vendors.append(vendor)

            vendors_map[firm.id] = vendors
            self.stdout.write(f"  Created {num_vendors} vendors for {firm.name}")
        return vendors_map

    # ------------------------------------------------------------------
    def _seed_product_batches(self, products_map):
        """Create 2-4 batches per product."""
        total = 0
        for firm_id, products in products_map.items():
            for prod in products:
                num_batches = random.randint(2, 4)
                for b in range(num_batches):
                    expiry = (timezone.now() + timedelta(days=random.randint(30, 730))).date()
                    ProductBatch.objects.get_or_create(
                        product=prod,
                        expiry_date=expiry,
                        defaults={"quantity": random.randint(50, 5000)},
                    )
                    total += 1
        self.stdout.write(f"  Created {total} product batches")

    # ------------------------------------------------------------------
    def _seed_vendor_orders(self, firms, vendors_map, products_map, users_map):
        """Create 15-25 vendor orders per firm with items."""
        order_counter = 0
        for firm in firms:
            vendors = vendors_map[firm.id]
            products = products_map[firm.id]
            num_orders = random.randint(15, 25)

            for _ in range(num_orders):
                order_counter += 1
                vendor = random.choice(vendors)
                order_date = rand_date_past(180)
                status = random.choices(
                    ["PENDING", "RECEIVED", "COMPLETED", "CANCELLED"],
                    weights=[30, 35, 25, 10],
                )[0]

                num_items = random.randint(3, 12)
                order_products = random.sample(products, min(num_items, len(products)))
                total = Decimal("0")

                order = VendorOrder.objects.create(
                    firm=firm,
                    vendor=vendor,
                    order_number=f"VO-{firm.code}-{order_counter:05d}",
                    order_date=order_date,
                    vendor_invoice_number=f"VINV-{random.randint(10000, 99999)}" if status != "PENDING" else None,
                    order_status=status,
                    notes=random.choice(NOTES_POOL) or None,
                    received_date=order_date + timedelta(days=random.randint(1, 14)) if status in ("RECEIVED", "COMPLETED") else None,
                )

                for prod in order_products:
                    qty_ordered = random.randint(10, 500)
                    qty_received = qty_ordered if status in ("RECEIVED", "COMPLETED") else 0
                    cost = float(prod.purchase_rate) or random.uniform(20, 500)
                    ss_price = cost * 1.25
                    dist_price = cost * 1.15

                    VendorOrderItem.objects.create(
                        order=order,
                        product=prod,
                        quantity_ordered=qty_ordered,
                        quantity_received=qty_received,
                        cost_price_per_unit=Decimal(str(round(cost, 2))),
                        selling_price_super_seller=Decimal(str(round(ss_price, 2))),
                        selling_price_distributor=Decimal(str(round(dist_price, 2))),
                        batch_number=f"B{random.randint(1000, 9999)}",
                        manufacturing_date=order_date - timedelta(days=random.randint(10, 90)),
                        expiry_date=order_date + timedelta(days=random.randint(180, 730)),
                    )
                    total += Decimal(str(round(cost * qty_ordered, 2)))

                paid = Decimal("0")
                if status == "COMPLETED":
                    paid = total
                    pay_status = "PAID"
                elif status == "RECEIVED":
                    paid = round(total * Decimal(str(random.uniform(0.3, 0.9))), 2)
                    pay_status = "PARTIAL"
                else:
                    pay_status = "UNPAID"

                order.total_amount = total
                order.amount_paid = paid
                order.payment_status = pay_status
                order.save(update_fields=["total_amount", "amount_paid", "payment_status"])

            self.stdout.write(f"  Created {num_orders} vendor orders for {firm.name}")

    # ------------------------------------------------------------------
    def _seed_retailer_orders(self, firms, customers_map, products_map, users_map):
        """Create 25-40 retailer orders per firm."""
        for firm in firms:
            customers = customers_map[firm.id]
            products = products_map[firm.id]
            firm_users = users_map.get(firm.id, [])
            num_orders = random.randint(25, 40)

            for _ in range(num_orders):
                customer = random.choice(customers)
                creator = random.choice(firm_users) if firm_users else None
                status = random.choices(
                    ["SUBMITTED", "INVOICED", "DRAFT", "CANCELLED"],
                    weights=[35, 40, 15, 10],
                )[0]

                order = RetailerOrder.objects.create(
                    firm=firm,
                    customer=customer,
                    created_by=creator,
                    status=status,
                    reference=f"RO-{random.randint(10000, 99999)}",
                    notes=random.choice(NOTES_POOL) or None,
                )

                num_items = random.randint(2, 8)
                for prod in random.sample(products, min(num_items, len(products))):
                    rate = effective_unit_rate(prod, customer)
                    line_disc = (
                        Decimal("0")
                        if prod.no_discount
                        else (customer.default_discount_percent or Decimal("0"))
                    )
                    RetailerOrderItem.objects.create(
                        order=order,
                        product=prod,
                        quantity=random.randint(5, 200),
                        rate=rate,
                        applied_discount_percent=line_disc,
                        scheme_applied=(
                            {"buy_qty": prod.scheme_buy_qty, "free_qty": prod.scheme_free_qty}
                            if prod.scheme_type == "BUY_X_GET_Y" and random.random() > 0.5
                            else {}
                        ),
                    )

            self.stdout.write(f"  Created {num_orders} retailer orders for {firm.name}")

    # ------------------------------------------------------------------
    def _seed_invoices(self, firms, customers_map, products_map, users_map):
        """Create 30-50 invoices per firm across all status stages + payments."""
        invoice_counter = 0
        statuses_weighted = [
            ("PENDING_APPROVAL", 15),
            ("APPROVED", 15),
            ("CHANGES_REQUESTED", 5),
            ("OUT_FOR_DELIVERY", 10),
            ("DELIVERED", 15),
            ("PARTIALLY_PAID", 10),
            ("PAID", 15),
            ("CLOSED", 10),
            ("CANCELLED", 5),
        ]
        status_choices = [s[0] for s in statuses_weighted]
        status_weights = [s[1] for s in statuses_weighted]

        for firm in firms:
            customers = customers_map[firm.id]
            products = products_map[firm.id]
            firm_users = users_map.get(firm.id, [])
            num_invoices = random.randint(30, 50)

            for _ in range(num_invoices):
                invoice_counter += 1
                customer = random.choice(customers)
                creator = random.choice(firm_users) if firm_users else None
                status = random.choices(status_choices, weights=status_weights)[0]
                approver = random.choice(firm_users) if firm_users and status not in ("PENDING_APPROVAL", "CHANGES_REQUESTED", "CANCELLED") else None

                is_printed = status in ("OUT_FOR_DELIVERY", "DELIVERED", "PARTIALLY_PAID", "PAID", "CLOSED") and random.random() > 0.2
                printed_by = random.choice(firm_users) if is_printed and firm_users else None
                printed_on = rand_date_past(60) if is_printed else None

                invoice = Invoice.objects.create(
                    firm=firm,
                    customer=customer,
                    invoice_number=f"INV-{firm.code}-{invoice_counter:06d}",
                    status=status,
                    rejection_note="Please correct item quantities and resubmit." if status == "CHANGES_REQUESTED" else None,
                    is_printed=is_printed,
                    printed_on=printed_on,
                    printed_by=printed_by,
                    created_by=creator,
                    approved_by=approver,
                )

                # Items
                num_items = random.randint(3, 15)
                invoice_total = Decimal("0")
                order_products = random.sample(products, min(num_items, len(products)))
                batches_cache = {}

                for prod in order_products:
                    if prod.id not in batches_cache:
                        batches_cache[prod.id] = list(prod.batches.all()[:1])
                    batch = batches_cache[prod.id][0] if batches_cache[prod.id] else None

                    is_ss = customer.customer_type == "SUPER_SELLER"
                    rate = float(prod.sale_rate if is_ss else prod.rate_per_unit) or random.uniform(20, 500)
                    qty = random.randint(5, 200)
                    disc = (
                        float(customer.default_discount_percent)
                        if not prod.no_discount
                        else 0.0
                    )
                    gst = float(prod.gst_percent)

                    base = round(rate * qty * (1 - disc / 100), 2)
                    line_total = round(base * (1 + gst / 100), 2)

                    free_qty = 0
                    if prod.scheme_type == "BUY_X_GET_Y" and prod.scheme_buy_qty > 0:
                        free_qty = (qty // prod.scheme_buy_qty) * prod.scheme_free_qty

                    InvoiceItem.objects.create(
                        invoice=invoice,
                        product=prod,
                        product_batch=batch,
                        quantity=qty,
                        free_quantity=free_qty,
                        rate=Decimal(str(round(rate, 2))),
                        discount_percent=Decimal(str(round(disc, 2))),
                        gst_percent=Decimal(str(round(gst, 2))),
                        line_total=Decimal(str(line_total)),
                    )
                    invoice_total += Decimal(str(line_total))

                invoice.total_amount = invoice_total
                invoice.save(update_fields=["total_amount"])

                # Payments for relevant statuses
                if status in ("PARTIALLY_PAID", "PAID", "CLOSED", "DELIVERED"):
                    if status == "PAID" or status == "CLOSED":
                        self._create_payments(invoice, invoice_total, firm_users, full=True)
                    elif status == "PARTIALLY_PAID":
                        partial_pct = Decimal(str(random.uniform(0.2, 0.8)))
                        self._create_payments(invoice, round(invoice_total * partial_pct, 2), firm_users, full=False)
                    elif status == "DELIVERED" and random.random() > 0.5:
                        partial_pct = Decimal(str(random.uniform(0.1, 0.5)))
                        self._create_payments(invoice, round(invoice_total * partial_pct, 2), firm_users, full=False)

            self.stdout.write(f"  Created {num_invoices} invoices for {firm.name}")

        self.stdout.write(f"  Total invoices created: {invoice_counter}")

    # ------------------------------------------------------------------
    def _create_payments(self, invoice, target_amount, firm_users, full=True):
        """Create 1-4 payment records adding up to target_amount."""
        modes = ["CASH", "ONLINE", "UPI", "CHEQUE", "OTHER"]
        remaining = target_amount
        num_payments = 1 if full and random.random() > 0.5 else random.randint(1, 4)
        recorder = random.choice(firm_users) if firm_users else None

        for i in range(num_payments):
            if remaining <= 0:
                break
            if i == num_payments - 1:
                amt = remaining
            else:
                amt = round(remaining * Decimal(str(random.uniform(0.2, 0.6))), 2)
                amt = min(amt, remaining)

            Payment.objects.create(
                invoice=invoice,
                amount=amt,
                mode=random.choice(modes),
                reference=f"{random.choice(PAYMENT_REFS)}{random.randint(100000, 999999)}" if random.random() > 0.3 else None,
                note=random.choice(["", "", "Advance payment", "Final settlement", "Partial clearance"]) or None,
                paid_on=rand_date_past(60),
                recorded_by=recorder,
            )
            remaining -= amt
