"""Lightweight DB helpers (keep free of model imports to avoid cycles)."""

from django.db import connection

_TABLE = "firm_invoice"
_COLUMN = "delivered_at"
_checked = False


def ensure_firm_invoice_delivered_at_column() -> None:
    """
    Older SQLite DBs may lack firm_invoice.delivered_at while migration state
    thinks 0001/0002 already ran. Add the column if missing before ORM queries.
    """
    global _checked
    if _checked:
        return

    conn = connection
    vendor = conn.vendor
    with conn.cursor() as cursor:
        if vendor == "sqlite":
            cursor.execute(f"PRAGMA table_info({_TABLE})")
            columns = {row[1] for row in cursor.fetchall()}
            if _COLUMN not in columns:
                cursor.execute(
                    f"ALTER TABLE {_TABLE} ADD COLUMN {_COLUMN} datetime NULL"
                )
        elif vendor == "postgresql":
            cursor.execute(
                """
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = current_schema()
                  AND table_name = %s
                  AND column_name = %s
                """,
                [_TABLE, _COLUMN],
            )
            if not cursor.fetchone():
                cursor.execute(
                    f'ALTER TABLE "{_TABLE}" ADD COLUMN "{_COLUMN}" timestamptz NULL'
                )
        elif vendor == "mysql":
            cursor.execute(
                """
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = %s
                  AND column_name = %s
                """,
                [_TABLE, _COLUMN],
            )
            if not cursor.fetchone():
                cursor.execute(
                    f"ALTER TABLE `{_TABLE}` ADD COLUMN `{_COLUMN}` datetime(6) NULL"
                )

    _checked = True


_CUSTOMER_TABLE = "firm_customer"
_CUSTOMER_DISCOUNT_COL = "default_discount_percent"
_checked_customer_discount = False


def ensure_firm_customer_default_discount_percent_column() -> None:
    """
    Legacy firm_customer rows may lack default_discount_percent (schema drift).
    Match DecimalField(max_digits=5, decimal_places=2, default=0).
    """
    global _checked_customer_discount
    if _checked_customer_discount:
        return

    conn = connection
    vendor = conn.vendor
    with conn.cursor() as cursor:
        if vendor == "sqlite":
            cursor.execute(f"PRAGMA table_info({_CUSTOMER_TABLE})")
            columns = {row[1] for row in cursor.fetchall()}
            if _CUSTOMER_DISCOUNT_COL not in columns:
                cursor.execute(
                    f"ALTER TABLE {_CUSTOMER_TABLE} ADD COLUMN {_CUSTOMER_DISCOUNT_COL} "
                    f"numeric(5, 2) NOT NULL DEFAULT 0"
                )
        elif vendor == "postgresql":
            cursor.execute(
                """
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = current_schema()
                  AND table_name = %s
                  AND column_name = %s
                """,
                [_CUSTOMER_TABLE, _CUSTOMER_DISCOUNT_COL],
            )
            if not cursor.fetchone():
                cursor.execute(
                    f'ALTER TABLE "{_CUSTOMER_TABLE}" ADD COLUMN "{_CUSTOMER_DISCOUNT_COL}" '
                    f"numeric(5, 2) NOT NULL DEFAULT 0"
                )
        elif vendor == "mysql":
            cursor.execute(
                """
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = %s
                  AND column_name = %s
                """,
                [_CUSTOMER_TABLE, _CUSTOMER_DISCOUNT_COL],
            )
            if not cursor.fetchone():
                cursor.execute(
                    f"ALTER TABLE `{_CUSTOMER_TABLE}` ADD COLUMN `{_CUSTOMER_DISCOUNT_COL}` "
                    f"decimal(5,2) NOT NULL DEFAULT 0"
                )

    _checked_customer_discount = True
