import os
from decimal import Decimal, InvalidOperation
from pathlib import Path

import xlrd


DEFAULT_FIRM_SLUG = "anmol-corner-anmolcnr"
DEFAULT_XLS_PATH = Path("migrationdata") / "Anmol Corner customer Master 2026.xls"


def _to_decimal_percent(val) -> Decimal | None:
    if val is None:
        return None
    s = str(val).strip()
    if not s:
        return None
    s = s.replace("%", "").strip()
    try:
        return Decimal(s)
    except InvalidOperation:
        return None


def main() -> int:
    # Django setup
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
    import django  # noqa: WPS433

    django.setup()

    from firm.models import Firm, Customer  # noqa: WPS433

    firm_slug = os.environ.get("FIRM_SLUG", DEFAULT_FIRM_SLUG).strip()
    xls_path = Path(os.environ.get("XLS_PATH", str(DEFAULT_XLS_PATH))).resolve()
    dry_run = (os.environ.get("DRY_RUN", "0").strip().lower() in ("1", "true", "yes"))

    firm = Firm.objects.get(slug=firm_slug)

    book = xlrd.open_workbook(str(xls_path))
    sh = book.sheet_by_index(0)

    header_row_idx = 1  # known for this file (row 2 in Excel)
    headers = [str(sh.cell_value(header_row_idx, c)).strip() for c in range(sh.ncols)]
    header_map = {h.lower(): i for i, h in enumerate(headers) if h}

    name_col = header_map.get("name")
    disc_col = header_map.get("dis %") or header_map.get("disc %") or header_map.get("discount") or header_map.get("dis%")

    if name_col is None or disc_col is None:
        raise SystemExit(f"Could not find required columns. Headers: {headers}")

    updated = 0
    unchanged = 0
    missing = 0
    bad_rows = 0

    # Build quick lookup by normalized business_name
    customers = list(Customer.objects.filter(firm=firm).only("id", "business_name", "default_discount_percent"))
    by_name = {}
    for c in customers:
        key = (c.business_name or "").strip().lower()
        if not key:
            continue
        by_name.setdefault(key, []).append(c)

    for r in range(header_row_idx + 1, sh.nrows):
        name = str(sh.cell_value(r, name_col)).strip()
        if not name:
            continue
        disc_raw = sh.cell_value(r, disc_col)
        disc = _to_decimal_percent(disc_raw)
        if disc is None:
            continue

        key = name.strip().lower()
        matches = by_name.get(key) or []
        if not matches:
            missing += 1
            continue
        if len(matches) > 1:
            # Ambiguous - skip (shouldn't happen normally)
            bad_rows += 1
            continue

        cust = matches[0]
        new_val = disc.quantize(Decimal("0.01"))
        cur_val = (cust.default_discount_percent or Decimal("0")).quantize(Decimal("0.01"))

        if cur_val == new_val:
            unchanged += 1
            continue

        if not dry_run:
            Customer.objects.filter(id=cust.id).update(default_discount_percent=new_val)
        updated += 1

    total_customers = Customer.objects.filter(firm=firm).count()
    print(
        {
            "firm": firm.slug,
            "xls": str(xls_path),
            "dry_run": dry_run,
            "total_customers_in_db": total_customers,
            "updated": updated,
            "unchanged": unchanged,
            "missing_in_db": missing,
            "ambiguous_skipped": bad_rows,
        }
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

