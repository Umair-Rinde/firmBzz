import { Datagrid } from "@/components/ui/custom/datgrid";
import { ColumnDef } from "@tanstack/react-table";
import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import RetailerConfigDrawer from "./components/retailer-config";
import { useCookies } from "react-cookie";
import { LuPen } from "react-icons/lu";
import { DeleteItem } from "@/components/ui/custom/delete-dialog";
import { Badge } from "@/components/ui/badge";

export default function RetailerConfigPage() {
  const [cookies] = useCookies(["firm"]);
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const columns: ColumnDef<any>[] = [
    {
      header: "Business Name",
      accessorKey: "business_name",
    },
    {
      header: "Owner",
      accessorKey: "owner_name",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "WhatsApp",
      accessorKey: "whatsapp_number",
    },
    {
      header: "Type",
      accessorKey: "customer_type_display",
    },
    {
      header: "Status",
      accessorKey: "is_active",
      cell({ row }) {
        const isActive = row.original.is_active;
        return (
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      header: "Action",
      accessorKey: "action",
      cell({ row }) {
        return (
          <div className="flex justify-start items-center gap-5">
            <span
              className="flex gap-1 items-center cursor-pointer text-[#006F6D]"
              onClick={() => {
                setSelectedRow(row.original);
                setOpen(true);
              }}
            >
              <LuPen className="text-[#12B76A] size-[18px]" />
            </span>

            <DeleteItem
              endPoint={`/firm/${cookies.firm}/customers/${row.original.id}/`}
              itemName={`${row?.original?.business_name}`}
              title="Delete Retailer"
              refetchUrl={[`firm/${cookies.firm}/customers/`]}
            />
          </div>
        );
      },
    },
  ];

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  return (
    <div className="mt-[150px]">
      <AppBar
        title="Retailers"
        subTitle={`Create, Update and Delete Retailers`}
      />
      <Datagrid
        columns={columns}
        title="Retailers"
        url={`firm/${cookies.firm}/customers/`}
        extraButtons={
          <CustomButton onClick={() => setOpen(true)}>
            Add Retailer <FaPlus />
          </CustomButton>
        }
      />
      {open && (
        <RetailerConfigDrawer
          handleClose={handleClose}
          open={open}
          id={selectedRow?.id}
          row={selectedRow}
        />
      )}
    </div>
  );
}
