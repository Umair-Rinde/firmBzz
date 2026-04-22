from django.core.management.base import BaseCommand

from firm.apis import InvoiceService


class Command(BaseCommand):
    help = (
        "Mark invoices as CLOSED when they were delivered at least 2 days ago "
        "and are still DELIVERED, PARTIALLY_PAID, or PAID."
    )

    def handle(self, *args, **options):
        n = InvoiceService.auto_close_delivered_invoices(firm=None)
        self.stdout.write(self.style.SUCCESS(f"Closed {n} invoice(s)."))
