import os
from decimal import Decimal, InvalidOperation
from pathlib import Path

import xlrd


FIRM_SLUG = os.environ.get("FIRM_SLUG", "anmol-corner-anmolcnr").strip()
XLS_PATH = Path(os.environ.get("XLS_PATH", "migrationdata/Anmol corner item master 2026.xls"))


def d(val) -> Decimal | None:
    if val is None:
        return None
    s = str(val).strip()
    if not s:
        return None
    try:
        return Decimal(s.replace(",", ""))
    except InvalidOperation:
        return None


def norm(s: str) -> str:
    return (s or "").strip().lower()


def main() -> int:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
    import django  # noqa: WPS433

    django.setup()

    from firm.models import Firm, Product  # noqa: WPS433

    firm = Firm.objects.get(slug=FIRM_SLUG)
    products = list(
        Product.objects.filter(firm=firm).only(
            "id",
            "name",
            "product_code",
            "sale_rate",
            "rate_per_unit",
            "purchase_rate",
            "purchase_rate_per_unit",
            "mrp",
        )
    )

    by_code = {norm(p.product_code): p for p in products if p.product_code}
    by_name = {norm(p.name): p for p in products if p.name}

    book = xlrd.open_workbook(str(XLS_PATH))
    sh = book.sheet_by_index(0)

    header_row = 1
    headers = [str(sh.cell_value(header_row, c)).strip() for c in range(sh.ncols)]
    hm = {h.lower(): i for i, h in enumerate(headers) if h}

    col_name = hm.get("itemname")
    col_pr = hm.get("prate")
    col_pru = hm.get("prateunit")
    col_sr = hm.get("srate")
    col_ru = hm.get("rate/unit")
    col_mrp = hm.get("mrp")

    if col_name is None:
        raise SystemExit(f"Could not find ItemName column. Headers: {headers}")

    mismatches = []
    missing_in_db = []

    for r in range(header_row + 1, sh.nrows):
        item_name = str(sh.cell_value(r, col_name)).strip()
        if not item_name:
            continue

        x_pr = d(sh.cell_value(r, col_pr)) if col_pr is not None else None
        x_pru = d(sh.cell_value(r, col_pru)) if col_pru is not None else None
        x_sr = d(sh.cell_value(r, col_sr)) if col_sr is not None else None
        x_ru = d(sh.cell_value(r, col_ru)) if col_ru is not None else None
        x_mrp = d(sh.cell_value(r, col_mrp)) if col_mrp is not None else None

        # match strategy: product_code not present in this XLS, so use name
        p = by_name.get(norm(item_name))
        if not p:
            missing_in_db.append(item_name)
            continue

        def q2(x: Decimal | None) -> str | None:
            return str(x.quantize(Decimal("0.01"))) if x is not None else None

        diffs = {}
        if x_mrp is not None and q2(Decimal(str(p.mrp))) != q2(x_mrp):
            diffs["mrp"] = {"db": q2(Decimal(str(p.mrp))), "xls": q2(x_mrp)}
        if x_pr is not None and q2(Decimal(str(p.purchase_rate))) != q2(x_pr):
            diffs["purchase_rate"] = {"db": q2(Decimal(str(p.purchase_rate))), "xls": q2(x_pr)}
        if x_pru is not None and q2(Decimal(str(p.purchase_rate_per_unit))) != q2(x_pru):
            diffs["purchase_rate_per_unit"] = {
                "db": q2(Decimal(str(p.purchase_rate_per_unit))),
                "xls": q2(x_pru),
            }
        if x_sr is not None and q2(Decimal(str(p.sale_rate))) != q2(x_sr):
            diffs["sale_rate"] = {"db": q2(Decimal(str(p.sale_rate))), "xls": q2(x_sr)}
        if x_ru is not None and q2(Decimal(str(p.rate_per_unit))) != q2(x_ru):
            diffs["rate_per_unit"] = {
                "db": q2(Decimal(str(p.rate_per_unit))),
                "xls": q2(x_ru),
            }

        if diffs:
            mismatches.append(
                {
                    "product_name": p.name,
                    "product_code": p.product_code,
                    "diffs": diffs,
                }
            )

    # Print report
    print(
        {
            "firm": firm.slug,
            "xls": str(Path(XLS_PATH).resolve()),
            "db_products": len(products),
            "mismatches": len(mismatches),
            "missing_in_db": len(missing_in_db),
        }
    )

    if mismatches:
        print("\n--- MISMATCHES (name -> differing fields) ---")
        for m in mismatches:
            print(f"- {m['product_name']} ({m['product_code'] or '—'}): {m['diffs']}")

    if missing_in_db:
        print("\n--- PRESENT IN XLS BUT NOT IN DB (first 50) ---")
        for name in missing_in_db[:50]:
            print(f"- {name}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

