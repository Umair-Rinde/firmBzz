import { Datagrid } from "@/components/ui/custom/datgrid";
import { ColumnDef } from "@tanstack/react-table";
import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import RetailerConfigDrawer from "./components/retailer-config";

export default function RetailerConfigPage() {
  const columns: ColumnDef<any>[] = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Contact",
      accessorKey: "contact",
    },
    {
      header: "Action",
      accessorKey: "action",
    },
  ];

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div className="mt-[150px]">
      <AppBar
        title="Retailers"
        subTitle={`Create, Update and Delete Retailers`}
      />
      <Datagrid
        columns={columns}
        title="Profucts"
        extraButtons={
          <CustomButton onClick={() => setOpen(true)}>
            Add Retailer <FaPlus />
          </CustomButton>
        }
      />
      {open && <RetailerConfigDrawer handleClose={handleClose} open={open} />}
    </div>
  );
}
