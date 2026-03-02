import { useState } from "react";
import { useParams } from "react-router-dom";
import { Datagrid } from "@/components/ui/custom/datgrid";
import CustomButton from "@/components/ui/custom/custom-button";
import { Plus } from "lucide-react";
import AppBar from "@/components/ui/custom/app-bar";
import { LuPen } from "react-icons/lu";
import FirmUserDrawer from "./components/firm-user-drawer";

export default function FirmUserManagementPage() {
    const { firmId } = useParams();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const columns = [
        {
            header: "Full Name",
            accessorKey: "user_full_name",
        },
        {
            header: "Email",
            accessorKey: "user_email",
        },
        {
            header: "Phone",
            accessorKey: "user_phone",
        },
        {
            header: "Role",
            accessorKey: "role_display",
        },
        {
            header: "Status",
            accessorKey: "is_active",
            cell: ({ row }: any) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                >
                    {row.original.is_active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            header: "Action",
            accessorKey: "Action",
            cell: ({ row }: any) => (
                <div className="flex justify-start items-center gap-5">
                    <span
                        className="flex gap-1 items-center cursor-pointer text-[#006F6D]"
                        onClick={() => {
                            setSelectedUser(row.original);
                            setOpenDrawer(true);
                        }}
                    >
                        <LuPen className="text-[#12B76A] size-[18px]" />
                    </span>
                </div>
            ),
        },
    ];

    const handleAdd = () => {
        setSelectedUser(null);
        setOpenDrawer(true);
    };

    return (
        <div className="mt-[150px]">
            <AppBar
                title="User Management"
                subTitle="Manage users and their roles for your firm."
            />

            <Datagrid
                columns={columns}
                title="Firm Users"
                url={`/firm/${firmId}/firm-users/`}
                extraButtons={
                    <CustomButton onClick={handleAdd} className="flex gap-2">
                        <Plus className="h-4 w-4" />
                        Add User
                    </CustomButton>
                }
            />

            {openDrawer && (
                <FirmUserDrawer
                    open={openDrawer}
                    onOpenChange={setOpenDrawer}
                    user={selectedUser}
                />
            )}
        </div>
    );
}
