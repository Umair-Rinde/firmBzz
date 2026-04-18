/** FSSAI licence status for a retailer (customer) row from the API. */
export type FssaiRetailStatus = "none" | "expired" | "expiring_soon" | "ok";

export function getFssaiRetailStatus(
  fssaiExpiry: string | null | undefined,
  now = new Date(),
): FssaiRetailStatus {
  if (!fssaiExpiry) return "none";
  const exp = new Date(fssaiExpiry);
  if (Number.isNaN(exp.getTime())) return "none";
  if (exp.getTime() < now.getTime()) return "expired";
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  if (exp.getTime() <= now.getTime() + weekMs) return "expiring_soon";
  return "ok";
}

export function formatFssaiDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fssaiAlertLabel(status: FssaiRetailStatus): string {
  switch (status) {
    case "expired":
      return "Expired";
    case "expiring_soon":
      return "Expires within 7 days";
    case "none":
      return "Not set";
    default:
      return "—";
  }
}
