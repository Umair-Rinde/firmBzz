import { Datagrid } from "@/components/ui/custom/datgrid";
import { ColumnDef } from "@tanstack/react-table";
import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import VendorProductDrawer from "./components/vendor-product";
import { useCookies } from "react-cookie";
import { LuPen } from "react-icons/lu";
import { DeleteItem } from "@/components/ui/custom/delete-dialog";

export default function FirmProductPage() {
  const columns: ColumnDef<any>[] = [
    {
      header: "HSN",
      accessorKey: "hsn_code",
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "description",
      accessorKey: "description",
    },

    {
      header: "Category",
      accessorKey: "category",
    },
    {
      header: "Action",
      accessorKey: "Action",
      cell({ row }) {
        return (
          <div className="flex justify-start items-center gap-5">
            <span
              className="flex gap-1 items-center cursor-pointer text-[#006F6D]"
              onClick={() => {
                setOpen(true);
                setSelectedRow(row?.original?.id);
              }}
            >
              <LuPen className="text-[#12B76A] size-[18px]" />
            </span>

            <DeleteItem
              endPoint={`/firm/${cookies.firm}/products/${row.original.id}/`}
              itemName={`${row?.original?.name}`}
              title="Delete Product"
              refetchUrl={[`/firm/${cookies.firm}/products/`]}
            />
          </div>
        );
      },
    },
  ];

  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const [cookies] = useCookies(["current_role", "firm"]);

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div className="mt-[150px]">
      <AppBar title="Products" subTitle={`Create, Update and Delete Product`} />
      <Datagrid
        columns={columns}
        title="Profucts"
        url={`firm/${cookies.firm}/products/`}
        extraButtons={
          <CustomButton onClick={() => setOpen(true)}>
            Add Product <FaPlus />
          </CustomButton>
        }
      />
      {open && (
        <VendorProductDrawer
          handleClose={handleClose}
          open={open}
          id={selectedRow}
        />
      )}
    </div>
  );
}
