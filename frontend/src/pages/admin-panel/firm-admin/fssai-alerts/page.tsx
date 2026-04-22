import { Datagrid, FilterConfig } from "@/components/ui/custom/datgrid";
import { ColumnDef } from "@tanstack/react-table";
import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { useFirmSlug } from "@/hooks/useFirmSlug";
import { Link } from "react-router-dom";
import {
  formatFssaiDate,
  fssaiAlertLabel,
  getFssaiRetailStatus,
} from "@/utils/fssai-retailer";

const fssaiAlertFilterConfig: FilterConfig[] = [
  {
    param: "window",
    label: "Alert",
    options: [
      { label: "Expired", value: "expired" },
      { label: "Within 7 days", value: "expiring" },
    ],
  },
];

export default function FirmFssaiAlertsPage() {
  const slug = useFirmSlug();

  const columns: ColumnDef<any>[] = [
    {
      header: "Retailer",
      accessorKey: "business_name",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <span>
            <span className="font-medium text-gray-900">{r.business_name}</span>
            {r.reference_code && (
              <span className="ml-1.5 text-xs font-mono text-gray-500">
                [{r.reference_code}]
              </span>
            )}
          </span>
        );
      },
    },
    {
      header: "FSSAI #",
      accessorKey: "fssai_number",
      cell: ({ row }) => row.original.fssai_number || "—",
    },
    {
      header: "Expiry",
      accessorKey: "fssai_expiry",
      cell: ({ row }) => formatFssaiDate(row.original.fssai_expiry),
    },
    {
      id: "fssai_status",
      header: "Status",
      accessorKey: "fssai_expiry",
      cell: ({ row }) => {
        const st = getFssaiRetailStatus(row.original.fssai_expiry);
        return (
          <span
            className={
              st === "expired"
                ? "text-red-700 font-medium"
                : st === "expiring_soon"
                  ? "text-amber-800 font-medium"
                  : "text-gray-600"
            }
          >
            {fssaiAlertLabel(st)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="dashboard-page-offset max-w-full min-w-0">
      <AppBar
        title="FSSAI expiry alerts"
        subTitle="Retailers with FSSAI expired or expiring within 7 days (requires expiry date set). Search and filters apply to this list."
      />

      <div className="mb-3 flex flex-wrap gap-2">
        <Link to={`/dashboard/${slug}/create-retailer`}>
          <CustomButton type="button" variant="outline" className="text-sm h-9">
            Manage retailers
          </CustomButton>
        </Link>
        <Link to={`/dashboard/${slug}/retailer-orders`}>
          <CustomButton type="button" variant="ghost" className="text-sm h-9">
            Retailer orders
          </CustomButton>
        </Link>
      </div>

      <Datagrid
        columns={columns}
        title="Alerts"
        url={slug ? `/firm/${slug}/customers/fssai-expiry-alerts/` : undefined}
        filterConfig={fssaiAlertFilterConfig}
      />
    </div>
  );
}
