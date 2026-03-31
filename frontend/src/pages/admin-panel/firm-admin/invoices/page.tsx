import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { axios } from "@/config/axios";

import { Datagrid } from "@/components/ui/custom/datgrid";
import { queryClient } from "@/config/query-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const InvoicesPage = () => {
    const { firmId } = useParams();
    const navigate = useNavigate();

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data: invoicesData, isLoading } = useQuery({
        queryKey: [`/firm/${firmId}/invoices/`, pagination],
        queryFn: () => axios.get(`/firm/${firmId}/invoices/`, {
            params: {
                page: pagination.pageIndex + 1,
                page_size: pagination.pageSize,
            }
        }),
    });

    const invoices = invoicesData?.data?.data?.rows || [];
    const totalCount = invoicesData?.data?.data?.count || 0;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "PENDING_APPROVAL":
                return "bg-yellow-100 text-yellow-800";
            case "APPROVED":
                return "bg-green-100 text-green-800";
            case "CHANGES_REQUESTED":
                return "bg-orange-100 text-orange-800";
            case "REJECTED":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "invoice_number",
            header: "Invoice No.",
            cell: ({ row }) => (
                <div className="font-medium text-gray-900">
                    {row.original.invoice_number || "Pending"}
                </div>
            ),
        },
        {
            accessorKey: "customer_name",
            header: "Customer",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.customer_name}</div>
                    <div className="text-xs text-gray-500">
                        {row.original.customer_type === "SUPER_SELLER" ? "Super Seller" : "Distributor"}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "total_amount",
            header: "Total Amount",
            cell: ({ row }) => (
                <div className="font-medium">
                    ₹{parseFloat(row.original.total_amount).toFixed(2)}
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(row.original.status)}`}>
                    {row.original.status_display}
                </span>
            ),
        },
        {
            id: "payment_status",
            header: "Payment",
            cell: ({ row }) => {
                const ps = row.original.payment_status;
                const pending = Number(row.original.amount_pending ?? 0);
                const cfg: Record<string, string> = {
                    PAID: "bg-green-100 text-green-800",
                    PARTIAL: "bg-amber-100 text-amber-800",
                    UNPAID: "bg-red-100 text-red-800",
                };
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block w-fit ${cfg[ps] ?? "bg-gray-100 text-gray-800"}`}>
                            {ps === "PAID" ? "Paid" : ps === "PARTIAL" ? "Partial" : "Unpaid"}
                        </span>
                        {pending > 0 && (
                            <span className="text-xs text-red-600">
                                Due: ₹{pending.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "created_on",
            header: "Created On",
            cell: ({ row }) => (
                <div className="text-gray-500">
                    {format(new Date(row.original.created_on), "dd MMM yyyy")}
                </div>
            ),
        },
        {
            accessorKey: "created_by_name",
            header: "Created By",
            cell: ({ row }) => (
                <div className="text-gray-500">
                    {row.original.created_by_name || "-"}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex gap-2 justify-end">
                    <CustomButton
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => navigate(`/dashboard/${firmId}/invoices/${row.original.id}`)}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View / Edit
                    </CustomButton>
                </div>
            ),
        },
    ];

    return (
        <div className="mt-[150px] px-6 pb-20">
            <div className="flex justify-between items-center mb-6">
                <AppBar
                    title="Invoices"
                    subTitle="Manage all customer invoices, super seller and distributor orders."
                />
                <Link to={`/dashboard/${firmId}/invoices/create`}>
                    <CustomButton className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Invoice
                    </CustomButton>
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <Datagrid
                    columns={columns}
                    data={invoices}
                />
            </div>
        </div>
    );
};

export default InvoicesPage;
