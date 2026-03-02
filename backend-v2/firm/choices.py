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
