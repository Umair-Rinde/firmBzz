import { Datagrid } from "@/components/ui/custom/datgrid";
import { ColumnDef } from "@tanstack/react-table";
import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import VendorProductDrawer from "./components/vendor-product";

export default function FirmProductPage() {
  const columns: ColumnDef<any>[] = [
    {
      header: "Product Name",
      accessorKey: "product_name",
    },
    {
      header: "SKU",
      accessorKey: "SKU",
    },
    {
      header: "Category",
      accessorKey: "Category",
    },
    {
      header: "Wholesale Price ($)",
      accessorKey: "wholesale_price",
    },
  ];

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div className="mt-[150px]">
      <AppBar title="Products" subTitle={`Create, Update and Delete Product`} />
      <Datagrid
        columns={columns}
        title="Profucts"
        extraButtons={
          <CustomButton onClick={() => setOpen(true)}>
            Add Product <FaPlus />
          </CustomButton>
        }
      />
      {open && <VendorProductDrawer handleClose={handleClose} open={open} />}
    </div>
  );
}
