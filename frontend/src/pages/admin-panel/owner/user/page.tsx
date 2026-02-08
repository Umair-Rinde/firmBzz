import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { Datagrid } from "@/components/ui/custom/datgrid";
import { DeleteItem } from "@/components/ui/custom/delete-dialog";
import { UserInterface } from "@/interfaces/user";
import { ColumnDef } from "@tanstack/react-table";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { LuPen } from "react-icons/lu";
import UserDrawer from "./components/user-form";

const UserConfig = () => {
  const columns: ColumnDef<UserInterface>[] = [
    {
      header: "Full Name",
      accessorKey: "full_name",
    },
    {
      header: "Gender",
      accessorKey: "gender",
    },
    {
      header: "State",
      accessorKey: "state",
    },
    {
      header: "City",
      accessorKey: "city",
    },
    {
      header: "Pincode",
      accessorKey: "pincode",
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

            <DeleteItem
              endPoint={`/accounts/${row?.original?.id}/delete/`}
              itemName={`${row?.original?.full_name}`}
              title="Delete user"
              refetchUrl={["/accounts/list/get/"]}
            />
          </div>
        );
      },
    },
  ];

  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<UserInterface | null>(null);

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div className="mt-[150px]">
      <AppBar title="User" subTitle={`Create , Update and Delete Users`} />
      <Datagrid
        columns={columns}
        title="Users"
        url="/accounts/list/get/"
        extraButtons={
          <CustomButton onClick={() => setOpen(true)}>
            Add user <FaPlus />
          </CustomButton>
        }
      />
      {open && (
        <UserDrawer handleClose={handleClose} open={open} row={selectedRow} />
      )}
    </div>
  );
};

export default UserConfig;
