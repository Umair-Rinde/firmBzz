import { useState } from "react";
import { useFirmSlug } from "@/hooks/useFirmSlug";
import { Datagrid, FilterConfig } from "@/components/ui/custom/datgrid";
import CustomButton from "@/components/ui/custom/custom-button";
import { Plus } from "lucide-react";
import AppBar from "@/components/ui/custom/app-bar";
import { LuPen } from "react-icons/lu";
import FirmUserDrawer from "./components/firm-user-drawer";

const firmUserFilterConfig: FilterConfig[] = [
    {
        param: "role",
        label: "Role",
        options: [
            { label: "Firm Admin", value: "FIRM_ADMIN" },
            { label: "Firm User", value: "FIRM_USER" },
            { label: "Super Seller", value: "SUPERSELLER_USER" },
            { label: "Distributor", value: "DISTRIBUTOR_USER" },
            { label: "Sales Person", value: "SALES_PERSON" },
        ],
    },
];

const ROLE_COLORS: Record<string, string> = {
    FIRM_ADMIN: "bg-blue-100 text-blue-800",
    FIRM_USER: "bg-gray-100 text-gray-800",
    SUPERSELLER_USER: "bg-purple-100 text-purple-800",
    DISTRIBUTOR_USER: "bg-amber-100 text-amber-800",
    SALES_PERSON: "bg-teal-100 text-teal-800",
};

export default function FirmUserManagementPage() {
    const firmId = useFirmSlug();
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
            cell: ({ row }: any) => {
                const role = row.original.role;
                return (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ROLE_COLORS[role] || "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {row.original.role_display}
                    </span>
                );
            },
        },
        {
            header: "Status",
            accessorKey: "is_active",
            cell: ({ row }: any) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.original.is_active
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
        <div className="dashboard-page-offset max-w-full min-w-0">
            <AppBar
                title="User Management"
                subTitle="Manage users and their roles for your firm. Users can belong to multiple firms."
            />

            <Datagrid
                columns={columns}
                title="Firm Users"
                url={`/firm/${firmId}/firm-users/`}
                filterConfig={firmUserFilterConfig}
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
