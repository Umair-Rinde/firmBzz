from django.db import models


class CustomerTypeChoices(models.TextChoices):
    SUPER_SELLER = "SUPER_SELLER", "Super Seller Retailer"
    DISTRIBUTOR = "DISTRIBUTOR", "Distribution Retailer"


class OrderStatusChoices(models.TextChoices):
    PENDING = "PENDING", "Pending"
    RECEIVED = "RECEIVED", "Received"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"


class PaymentStatusChoices(models.TextChoices):
    UNPAID = "UNPAID", "Unpaid"
    PARTIAL = "PARTIAL", "Partial"
    PAID = "PAID", "Paid"

class InvoiceStatusChoices(models.TextChoices):
    PENDING_APPROVAL = "PENDING_APPROVAL", "Pending Approval"
    APPROVED = "APPROVED", "Approved"
    CHANGES_REQUESTED = "CHANGES_REQUESTED", "Changes Requested"
    REJECTED = "REJECTED", "Rejected"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY", "Out for Delivery"
    DELIVERED = "DELIVERED", "Delivered"
    PARTIALLY_PAID = "PARTIALLY_PAID", "Partially Paid"
    PAID = "PAID", "Paid"
    CLOSED = "CLOSED", "Closed"
    CANCELLED = "CANCELLED", "Cancelled"


class RetailerOrderStatusChoices(models.TextChoices):
    """Salesman orders to retailers; firm admin bundles into invoices."""
    DRAFT = "DRAFT", "Draft"
    SUBMITTED = "SUBMITTED", "Submitted"
    INVOICED = "INVOICED", "Invoiced"
    CANCELLED = "CANCELLED", "Cancelled"


class SchemeTypeChoices(models.TextChoices):
    NONE = "NONE", "No scheme"
    BUY_X_GET_Y = "BUY_X_GET_Y", "Buy X Get Y Free"
    FLAT_DISCOUNT = "FLAT_DISCOUNT", "Flat Discount"


class PaymentModeChoices(models.TextChoices):
    CASH = "CASH", "Cash"
    ONLINE = "ONLINE", "Online Transfer"
    UPI = "UPI", "UPI"
    CHEQUE = "CHEQUE", "Cheque"
    OTHER = "OTHER", "Other"
