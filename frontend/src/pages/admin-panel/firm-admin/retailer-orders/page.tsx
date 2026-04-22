import { Datagrid, FilterConfig } from "@/components/ui/custom/datgrid";
import { ColumnDef } from "@tanstack/react-table";
import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFirmSlug } from "@/hooks/useFirmSlug";
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
  const navigate = useNavigate();

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
    {
      id: "invoice",
      header: "Invoice",
      cell: ({ row }) => {
        const o = row.original;
        if (o.status !== "SUBMITTED") {
          return <span className="text-xs text-gray-400">—</span>;
        }
        return (
          <CustomButton
            type="button"
            variant="outline"
            className="text-xs h-8 px-2.5 whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              const q = new URLSearchParams({
                customer: String(o.customer),
                order: String(o.id),
              });
              navigate(`/dashboard/${slug}/invoices/create?${q.toString()}`);
            }}
          >
            Create invoice
          </CustomButton>
        );
      },
    },
  ];

  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  return (
    <div className="dashboard-page-offset max-w-full min-w-0">
      <AppBar
        title="Retailer orders"
        subTitle="Sales orders from retailers; create invoices from submitted orders."
      />

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
