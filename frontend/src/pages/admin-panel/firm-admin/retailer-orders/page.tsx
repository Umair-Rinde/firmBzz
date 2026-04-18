import { Datagrid, FilterConfig } from "@/components/ui/custom/datgrid";
import { ColumnDef } from "@tanstack/react-table";
import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { useQuery } from "@/hooks/useQuerry";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import { useFirmSlug } from "@/hooks/useFirmSlug";
import {
  formatFssaiDate,
  fssaiAlertLabel,
  getFssaiRetailStatus,
} from "@/utils/fssai-retailer";
import RetailerOrderDrawer from "./components/retailer-order-drawer";

const retailerOrderFilterConfig: FilterConfig[] = [
  {
    param: "status",
    label: "Status",
    options: [
      { label: "Submitted", value: "SUBMITTED" },
      { label: "Invoiced", value: "INVOICED" },
      { label: "Draft", value: "DRAFT" },
      { label: "Cancelled", value: "CANCELLED" },
    ],
  },
];

export default function FirmRetailerOrdersPage() {
  const slug = useFirmSlug();

  const { data: fssaiAlertRows = [] } = useQuery<any[]>({
    queryKey: [`/firm/${slug}/customers/fssai-expiry-alerts/`],
    enabled: !!slug,
    select: (res: any) => res?.data?.data?.rows ?? [],
  });

  const columns: ColumnDef<any>[] = [
    {
      header: "Reference",
      accessorKey: "reference",
      cell: ({ row }) => row.original.reference || "—",
    },
    {
      header: "Customer",
      accessorKey: "customer_name",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <span
          className={
            row.original.status === "SUBMITTED"
              ? "text-emerald-700 font-medium"
              : row.original.status === "INVOICED"
                ? "text-gray-600"
                : ""
          }
        >
          {row.original.status}
        </span>
      ),
    },
    {
      header: "Created",
      accessorKey: "created_on",
      cell: ({ row }) =>
        row.original.created_on
          ? new Date(row.original.created_on).toLocaleString()
          : "—",
    },
    {
      header: "By",
      accessorKey: "created_by_name",
      cell: ({ row }) => row.original.created_by_name || "—",
    },
  ];

  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  return (
    <div className="dashboard-page-offset max-w-full min-w-0">
      <AppBar
        title="Retailer orders"
        subTitle="Sales orders from retailers; firm admin invoices from submitted orders."
      />

      <div className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/40 px-3 py-3 sm:px-4 sm:py-4">
        <p className="text-sm font-semibold text-amber-950">
          FSSAI expiry — expired or within 7 days
        </p>
        <p className="text-xs text-amber-900/80 mt-0.5 mb-2">
          Retailers listed here need FSSAI renewal soon. Expired FSSAI cannot be used for new orders.
        </p>
        {fssaiAlertRows.length === 0 ? (
          <p className="text-sm text-gray-600 py-1">No retailers in this window.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-amber-100/90 bg-white">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-600 border-b border-gray-100">
                  <th className="py-2 px-3">Retailer</th>
                  <th className="py-2 px-3">FSSAI #</th>
                  <th className="py-2 px-3">Expiry</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {fssaiAlertRows.map((r: any) => {
                  const st = getFssaiRetailStatus(r.fssai_expiry);
                  return (
                    <tr key={r.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 px-3">
                        <span className="font-medium text-gray-900">{r.business_name}</span>
                        {r.reference_code && (
                          <span className="ml-1.5 text-xs font-mono text-gray-500">
                            [{r.reference_code}]
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-xs font-mono text-gray-700">
                        {r.fssai_number || "—"}
                      </td>
                      <td className="py-2 px-3 text-gray-700">
                        {formatFssaiDate(r.fssai_expiry)}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={
                            st === "expired"
                              ? "text-red-700 font-medium"
                              : "text-amber-800 font-medium"
                          }
                        >
                          {fssaiAlertLabel(st)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Datagrid
        columns={columns}
        title="Orders"
        url={slug ? `/firm/${slug}/retailer-orders/` : undefined}
        filterConfig={retailerOrderFilterConfig}
        extraButtons={
          <CustomButton
            className="w-full min-[480px]:w-auto shrink-0 justify-center"
            onClick={() => setOpen(true)}
          >
            New order <FaPlus />
          </CustomButton>
        }
      />
      {open && (
        <RetailerOrderDrawer handleClose={handleClose} open={open} />
      )}
    </div>
  );
}
