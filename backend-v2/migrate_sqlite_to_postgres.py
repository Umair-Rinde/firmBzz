import os
import subprocess
import sys
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
MANAGE = str(BASE_DIR / "manage.py")
EXPORT_PATH = str(BASE_DIR / "sqlite_export.json")


EXCLUDES = [
    "contenttypes",
    "auth.permission",
    "admin.logentry",
    "sessions",
]


def run(cmd: list[str], env: dict[str, str] | None = None) -> None:
    print(f"\n$ {' '.join(cmd)}")
    subprocess.check_call(cmd, env=env)


def main() -> int:
    pg_url = os.environ.get("DATABASE_URL", "").strip()
    if not pg_url:
        print(
            "DATABASE_URL is required.\n"
            "Example:\n"
            "  set DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME\n"
            "Then run:\n"
            "  python migrate_sqlite_to_postgres.py\n"
        )
        return 2

    # 1) Export from SQLite (force empty DATABASE_URL)
    sqlite_env = dict(os.environ)
    sqlite_env.pop("DATABASE_URL", None)

    dump_cmd = [sys.executable, MANAGE, "dumpdata", "--output", EXPORT_PATH]
    for x in EXCLUDES:
        dump_cmd.extend(["--exclude", x])
    dump_cmd.extend(["--natural-foreign", "--natural-primary"])

    run(dump_cmd, env=sqlite_env)
    print(f"Exported SQLite data to: {EXPORT_PATH}")

    # 2) Migrate schema on Postgres
    run([sys.executable, MANAGE, "migrate"], env=os.environ.copy())

    # 3) Import into Postgres
    run([sys.executable, MANAGE, "loaddata", EXPORT_PATH], env=os.environ.copy())
    print("Imported data into Postgres.")

    # 4) Quick sanity checks
    run(
        [
            sys.executable,
            MANAGE,
            "shell",
            "-c",
            "from accounts.models import User; from firm.models import Firm, Invoice; "
            "print({'users': User.objects.count(), 'firms': Firm.objects.count(), 'invoices': Invoice.objects.count()})",
        ],
        env=os.environ.copy(),
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

