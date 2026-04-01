import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { Datagrid } from "@/components/ui/custom/datgrid";
import { DeleteItem } from "@/components/ui/custom/delete-dialog";
import { UserInterface } from "@/interfaces/user";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { LuPen } from "react-icons/lu";
import UserDrawer from "./components/user-form";

const ROLE_COLORS: Record<string, string> = {
  FIRM_ADMIN: "bg-blue-100 text-blue-800",
  FIRM_USER: "bg-gray-100 text-gray-800",
  SUPERSELLER_USER: "bg-purple-100 text-purple-800",
  DISTRIBUTOR_USER: "bg-amber-100 text-amber-800",
  SALES_PERSON: "bg-teal-100 text-teal-800",
};

const ROLE_LABELS: Record<string, string> = {
  FIRM_ADMIN: "Firm Admin",
  FIRM_USER: "Firm User",
  SUPERSELLER_USER: "Super Seller",
  DISTRIBUTOR_USER: "Distributor",
  SALES_PERSON: "Sales Person",
};

const UserConfig = () => {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<UserInterface | null>(null);

  const columns: ColumnDef<UserInterface>[] = [
    {
      header: "Full Name",
      accessorKey: "full_name",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Phone",
      accessorKey: "phone",
    },
    {
      header: "User Type",
      accessorKey: "user_type",
      cell: ({ row }) => {
        const type = row.original.user_type;
        const isAdmin = type === "ADMIN";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isAdmin
                ? "bg-red-100 text-red-800"
                : "bg-indigo-100 text-indigo-800"
            }`}
          >
            {isAdmin ? "Admin" : "Firm User"}
          </span>
        );
      },
    },
    {
      header: "Firms & Roles",
      accessorKey: "firms",
      cell: ({ row }) => {
        const firms = row.original.firms || [];
        if (!firms.length) {
          return <span className="text-gray-400 text-xs italic">No firm assigned</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {firms.map((f) => (
              <span
                key={f.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  ROLE_COLORS[f.role] || "bg-gray-100 text-gray-700"
                }`}
              >
                {f.name}
                <span className="opacity-60">({ROLE_LABELS[f.role] || f.role})</span>
              </span>
            ))}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "is_active",
      cell: ({ row }) => {
        const active = row.original.is_active;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
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

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  return (
    <div className="dashboard-page-offset max-w-full min-w-0">
      <AppBar
        title="User Management"
        subTitle="Create, update and manage users across all firms."
      />
      <Datagrid
        columns={columns}
        title="Users"
        url="/accounts/list/get/"
        extraButtons={
          <CustomButton
            onClick={() => {
              setSelectedRow(null);
              setOpen(true);
            }}
          >
            Add User <FaPlus />
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
