import { Datagrid } from "@/components/ui/custom/datgrid";
import { ColumnDef } from "@tanstack/react-table";
import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import { useFirmSlug } from "@/hooks/useFirmSlug";
import RetailerOrderDrawer from "@/pages/admin-panel/firm-admin/retailer-orders/components/retailer-order-drawer";
import { useNavigate } from "react-router-dom";

export default function RetailerOrderPage() {
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
    },
    {
      header: "Created",
      accessorKey: "created_on",
      cell: ({ row }) =>
        row.original.created_on
          ? new Date(row.original.created_on).toLocaleString()
          : "—",
    },
  ];

  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  if (!slug) {
    return (
      <div className="dashboard-page-offset max-w-full min-w-0">
        <AppBar title="Orders" subTitle="Select a firm from your profile to view orders." />
        <p className="text-sm text-gray-600 mt-4">
          No firm context. Log in again or switch role with a firm assigned.
        </p>
        <CustomButton className="mt-4" onClick={() => navigate("/login")}>
          Go to login
        </CustomButton>
      </div>
    );
  }

  return (
    <div className="dashboard-page-offset max-w-full min-w-0">
      <AppBar
        title="Retailer orders"
        subTitle="Place orders against your firm."
      />
      <Datagrid
        columns={columns}
        title="Your orders"
        url={`/firm/${slug}/retailer-orders/`}
        extraButtons={
          <CustomButton onClick={() => setOpen(true)}>
            New order <FaPlus />
          </CustomButton>
        }
      />
      {open && <RetailerOrderDrawer handleClose={handleClose} open={open} />}
    </div>
  );
}
