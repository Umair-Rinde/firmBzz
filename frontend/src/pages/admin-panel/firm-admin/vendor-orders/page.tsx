import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Datagrid } from "@/components/ui/custom/datgrid";
import CustomButton from "@/components/ui/custom/custom-button";
import { Plus, PackageCheck, Upload } from "lucide-react";
import AppBar from "@/components/ui/custom/app-bar";
import { Badge } from "@/components/ui/badge";
import ReceiveOrderDrawer from "./components/receive-order-drawer";
import BulkImportOrderDrawer from "./components/bulk-import-order-drawer";

export default function VendorOrderListPage() {
    const { firmId } = useParams();
    const navigate = useNavigate();
    const [openReceiveDrawer, setOpenReceiveDrawer] = useState(false);
    const [bulkImportOpen, setBulkImportOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const columns = [
        {
            header: "Order Number",
            accessorKey: "order_number",
        },
        {
            header: "Vendor",
            accessorKey: "vendor_name",
        },
        {
            header: "Order Date",
            accessorKey: "order_date",
        },
        {
            header: "Status",
            accessorKey: "order_status",
            cell: ({ row }: any) => {
                const status = row.original.order_status;
                const colorMap: any = {
                    'PENDING': 'bg-yellow-100 text-yellow-800',
                    'RECEIVED': 'bg-green-100 text-green-800',
                    'CANCELLED': 'bg-red-100 text-red-800',
                };
                return (
                    <Badge className={colorMap[status] || 'bg-gray-100 text-gray-800'}>
                        {row.original.order_status_display}
                    </Badge>
                );
            },
        },
        {
            header: "Payment",
            accessorKey: "payment_status_display",
            cell: ({ row }: any) => {
                const status = row.original.payment_status;
                const colorMap: any = {
                    'UNPAID': 'bg-red-100 text-red-800',
                    'PARTIAL': 'bg-blue-100 text-blue-800',
                    'PAID': 'bg-green-100 text-green-800',
                };
                return (
                    <Badge className={colorMap[status] || 'bg-gray-100 text-gray-800'}>
                        {row.original.payment_status_display}
                    </Badge>
                );
            },
        },
        {
            header: "Total Amount",
            accessorKey: "total_amount",
            cell: ({ row }: any) => `₹${row.original.total_amount}`,
        },
        {
            header: "Action",
            accessorKey: "Action",
            cell: ({ row }: any) => (
                <div className="flex justify-start items-center gap-5">
                    {row.original.order_status === 'PENDING' && (
                        <CustomButton
                            variant="outline"
                            size="sm"
                            className="flex gap-2"
                            onClick={() => {
                                setSelectedOrder(row.original);
                                setOpenReceiveDrawer(true);
                            }}
                        >
                            <PackageCheck className="h-4 w-4" />
                            Receive
                        </CustomButton>
                    )}
                </div>
            ),
        },
    ];

    const handleAdd = () => {
        navigate(`/dashboard/${firmId}/vendor-orders/create`);
    };

    return (
        <div className="mt-[150px]">
            <AppBar
                title="Vendor Orders"
                subTitle="Manage and track orders from your vendors."
            />

            <Datagrid
                columns={columns}
                title="Vendor Orders"
                url={`/firm/${firmId}/vendor-orders/`}
                extraButtons={
                    <div className="flex gap-4">
                        <CustomButton
                            variant="outline"
                            onClick={() => setBulkImportOpen(true)}
                            className="flex gap-2 border-primary text-primary hover:bg-primary/5"
                        >
                            <Upload className="h-4 w-4" />
                            Bulk Import
                        </CustomButton>
                        <CustomButton onClick={handleAdd} className="flex gap-2">
                            <Plus className="h-4 w-4" />
                            Create Order
                        </CustomButton>
                    </div>
                }
            />

            {openReceiveDrawer && (
                <ReceiveOrderDrawer
                    open={openReceiveDrawer}
                    onOpenChange={setOpenReceiveDrawer}
                    order={selectedOrder}
                />
            )}

            {bulkImportOpen && (
                <BulkImportOrderDrawer
                    handleClose={() => setBulkImportOpen(false)}
                    open={bulkImportOpen}
                />
            )}
        </div>
    );
}
