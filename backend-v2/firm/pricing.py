"""Product pricing and FEFO batch allocation (simplified batches: quantity + expiry)."""
from decimal import Decimal

from django.db.models import F
from rest_framework.exceptions import ValidationError


def effective_unit_rate(product, customer):
    """Unit rate after product discount % (Excel: SRate vs Rate/uni by retailer type)."""
    if customer.customer_type == "SUPER_SELLER":
        base = product.sale_rate or Decimal("0")
    else:
        base = product.rate_per_unit or Decimal("0")
    disc = product.product_discount or Decimal("0")
    if disc <= 0:
        return base
    return (base * (Decimal("100") - disc) / Decimal("100")).quantize(Decimal("0.01"))


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
