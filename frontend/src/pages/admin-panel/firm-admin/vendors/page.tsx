import { useState } from "react";
import { useParams } from "react-router-dom";
import { Datagrid } from "@/components/ui/custom/datgrid";
import CustomButton from "@/components/ui/custom/custom-button";
import { Plus } from "lucide-react";
import AppBar from "@/components/ui/custom/app-bar";
import { LuPen } from "react-icons/lu";
import { DeleteItem } from "@/components/ui/custom/delete-dialog";
import VendorDrawer from "./components/vendor-drawer";

export default function VendorListPage() {
    const { firmId } = useParams();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<any>(null);

    const columns = [
        {
            header: "Vendor Name",
            accessorKey: "vendor_name",
        },
        {
            header: "Owner Name",
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
            header: "GST Number",
            accessorKey: "gst_number",
        },
        {
            header: "Action",
            accessorKey: "Action",
            cell: ({ row }: any) => (
                <div className="flex justify-start items-center gap-5">
                    <span
                        className="flex gap-1 items-center cursor-pointer text-[#006F6D]"
                        onClick={() => {
                            setSelectedVendor(row.original);
                            setOpenDrawer(true);
                        }}
                    >
                        <LuPen className="text-[#12B76A] size-[18px]" />
                    </span>

                    <DeleteItem
                        endPoint={`/firm/${firmId}/vendors/${row.original.id}/`}
                        itemName={`${row?.original?.vendor_name}`}
                        title="Delete Vendor"
                        refetchUrl={[`/firm/${firmId}/vendors/`]}
                    />
                </div>
            ),
        },
    ];

    const handleAdd = () => {
        setSelectedVendor(null);
        setOpenDrawer(true);
    };

    return (
        <div className="mt-[150px]">
            <AppBar
                title="Vendors"
                subTitle="Manage your firm's suppliers and vendors."
            />

            <Datagrid
                columns={columns}
                title="Vendors"
                url={`/firm/${firmId}/vendors/`}
                extraButtons={
                    <CustomButton onClick={handleAdd} className="flex gap-2">
                        <Plus className="h-4 w-4" />
                        Add Vendor
                    </CustomButton>
                }
            />

            {openDrawer && (
                <VendorDrawer
                    open={openDrawer}
                    onOpenChange={setOpenDrawer}
                    vendor={selectedVendor}
                />
            )}
        </div>
    );
}
