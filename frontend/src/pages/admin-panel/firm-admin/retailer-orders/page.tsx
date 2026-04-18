import { Datagrid, FilterConfig } from "@/components/ui/custom/datgrid";
import { ColumnDef } from "@tanstack/react-table";
import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
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
