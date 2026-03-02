import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Formik, Form } from "formik";
import { FormikInput } from "@/components/form/FormikInput";
import * as Yup from "yup";
import { Datagrid } from "@/components/ui/custom/datgrid";
import { ColumnDef } from "@tanstack/react-table";
import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import FirmDrawer from "./components/firm-form";
import { FirmInterface } from "@/interfaces/firm";
import { LuPen } from "react-icons/lu";
import { DeleteItem } from "@/components/ui/custom/delete-dialog";

export default function OwnerFirmPage() {
  const columns: ColumnDef<FirmInterface>[] = [
    {
      header: "Code",
      accessorKey: "code",
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Slug",
      accessorKey: "slug",
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
                setSelectedRow(row?.original);
              }}
            >
              <LuPen className="text-[#12B76A] size-[18px]" />
            </span>
            {/* <Separator
              orientation='vertical'
              className='!h-[15px] text-red-500'
            /> */}

            <DeleteItem
              endPoint={`/firm/${row?.original?.id}/delete/`}
              itemName={`${row?.original?.name}`}
              title="Delete Firm"
              refetchUrl={["/firm/all/"]}
            />
          </div>
        );
      },
    },
  ];

  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<FirmInterface | null>(null);
  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };
  return (
    <div className="mt-[150px]">
      <AppBar title="Firm" subTitle={`Create , Update and Delete Firms`} />
      <Datagrid
        columns={columns}
        title="Firms"
        url="/firm/all/"
        extraButtons={
          <CustomButton onClick={() => setOpen(true)}>
            Add Firm <FaPlus />
          </CustomButton>
        }
      />
      {open && (
        <FirmDrawer handleClose={handleClose} open={open} row={selectedRow} />
      )}
    </div>
  );
}
