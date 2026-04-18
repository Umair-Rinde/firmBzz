"""Product pricing and FEFO batch allocation (simplified batches: quantity + expiry)."""
from decimal import Decimal

from django.db.models import F
from rest_framework.exceptions import ValidationError


def effective_unit_rate(product, customer):
    """
    Per-unit list price before line discounts (Super Seller: sale_rate; Distributor: rate_per_unit).
    Line-level discount (e.g. retailer default_discount_percent) is applied separately on orders/invoices.
    """
    if customer.customer_type == "SUPER_SELLER":
        base = product.sale_rate or Decimal("0")
    else:
        base = product.rate_per_unit or Decimal("0")
    return base.quantize(Decimal("0.01"))


def line_total_inclusive(taxable_line_amount: Decimal, gst_percent) -> Decimal:
    """
    Discount-adjusted taxable amount → stored invoice line total (GST on top).
    Matches seed invoices and InvoiceItem.line_total help text (tax-inclusive snapshot).
    """
    amt = taxable_line_amount.quantize(Decimal("0.01"))
    gst = Decimal(str(gst_percent or 0))
    if gst <= 0:
        return amt
    return (amt * (Decimal("100") + gst) / Decimal("100")).quantize(Decimal("0.01"))


def allocate_batches_fefo(product, quantity_needed):
    """
    Returns list of (ProductBatch instance, qty_to_take). Does not save.
    Raises ValidationError if stock insufficient.
    """
    from .models import ProductBatch

    if quantity_needed <= 0:
        return []

    batches = list(
        ProductBatch.objects.filter(product=product, quantity__gt=0).order_by(
            F("expiry_date").asc(nulls_last=True), "created_on"
        )
    )
    remaining = quantity_needed
    out = []
    for batch in batches:
        if remaining <= 0:
            break
        take = min(batch.quantity, remaining)
        if take <= 0:
            continue
        out.append((batch, take))
        remaining -= take

    if remaining > 0:
        raise ValidationError(
            f"Insufficient stock for {product.name}. Needed {quantity_needed}, "
            f"short by {remaining}."
        )
    return out
