import { Datagrid } from "@/components/ui/custom/datgrid";
import { ColumnDef } from "@tanstack/react-table";
import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import OrderDrawer from "./components/order-drawer";

export default function RetailerOrderPage() {
  const columns: ColumnDef<any>[] = [
    {
      header: "Order ID",
      accessorKey: "facility_name",
    },
    {
      header: "Customer",
      accessorKey: "customer",
    },
    {
      header: "Product",
      accessorKey: "product",
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
    },
    {
      header: "Status",
      accessorKey: "status",
    },
    {
      header: "Date",
      accessorKey: "date",
    },
    {
      header: "Action",
      accessorKey: "Action",
      cell({ row }) {
        return "";
      },
    },
  ];

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div className="mt-[150px]">
      <AppBar title="Orders" subTitle={`Create, Update and Delete Orders`} />
      <Datagrid
        columns={columns}
        title="Recent Orders"
        extraButtons={
          <CustomButton onClick={() => setOpen(true)}>
            Add Order <FaPlus />
          </CustomButton>
        }
      />
      {open && <OrderDrawer handleClose={handleClose} open={open} />}
    </div>
  );
}
