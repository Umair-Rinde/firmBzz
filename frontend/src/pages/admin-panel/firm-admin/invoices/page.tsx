import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { Datagrid, FilterConfig } from "@/components/ui/custom/datgrid";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, Plus, Printer } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";


const STATUS_STYLE: Record<string, string> = {
    PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    CHANGES_REQUESTED: "bg-orange-100 text-orange-800",
    REJECTED: "bg-red-100 text-red-800",
    OUT_FOR_DELIVERY: "bg-blue-100 text-blue-800",
    DELIVERED: "bg-indigo-100 text-indigo-800",
    PARTIALLY_PAID: "bg-amber-100 text-amber-800",
    PAID: "bg-emerald-100 text-emerald-800",
    CLOSED: "bg-gray-200 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
};

const PAYMENT_STYLE: Record<string, string> = {
    PAID: "bg-green-100 text-green-800",
    PARTIAL: "bg-amber-100 text-amber-800",
    UNPAID: "bg-red-100 text-red-800",
};

const invoiceFilterConfig: FilterConfig[] = [
    {
        param: "status",
        label: "Status",
        options: [
            { label: "Pending Approval", value: "PENDING_APPROVAL" },
            { label: "Approved", value: "APPROVED" },
            { label: "Changes Requested", value: "CHANGES_REQUESTED" },
            { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
            { label: "Delivered", value: "DELIVERED" },
            { label: "Partially Paid", value: "PARTIALLY_PAID" },
            { label: "Paid", value: "PAID" },
            { label: "Closed", value: "CLOSED" },
            { label: "Cancelled", value: "CANCELLED" },
        ],
    },
    {
        param: "is_printed",
        label: "Printed",
        options: [
            { label: "Printed", value: "true" },
            { label: "Not Printed", value: "false" },
        ],
    },
];

const InvoicesPage = () => {
    const { firmId } = useParams();
    const navigate = useNavigate();

    const openPrintPage = (invoiceId: string) => {
        window.open(`/dashboard/${firmId}/invoices/${invoiceId}/print`, "_blank");
    };

    const { mutate: batchPrint, isPending: isBatchPrinting } = useMutation({
        mutationFn: () => axios.post(`/firm/${firmId}/invoices/batch-print/`),
        onSuccess: (res: any) => {
            const count = res?.data?.data?.printed_count ?? 0;
            const ids: string[] = res?.data?.data?.printed_ids ?? [];
            toast.success(`${count} invoice(s) sent to print`);
            queryClient.invalidateQueries({ queryKey: [`/firm/${firmId}/invoices/`] });
            ids.forEach((invId) => {
                window.open(`/dashboard/${firmId}/invoices/${invId}/print`, "_blank");
            });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Batch print failed");
        },
    });

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
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[row.original.status] || "bg-gray-100 text-gray-800"}`}>
                    {row.original.status_display}
                </span>
            ),
        },
        {
            id: "payment_info",
            header: "Payment",
            cell: ({ row }) => {
                const ps = row.original.payment_status;
                const pending = Number(row.original.amount_pending ?? 0);
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block w-fit ${PAYMENT_STYLE[ps] ?? "bg-gray-100 text-gray-800"}`}>
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
            id: "printed",
            header: "Printed",
            cell: ({ row }) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.original.is_printed ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                    {row.original.is_printed ? (
                        <span className="flex items-center gap-1"><Printer className="h-3 w-3" /> Yes</span>
                    ) : "No"}
                </span>
            ),
        },
        {
            accessorKey: "created_on",
            header: "Created",
            cell: ({ row }) => (
                <div className="text-gray-500">
                    {format(new Date(row.original.created_on), "dd MMM yyyy")}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const inv = row.original;
                return (
                    <div className="flex gap-2 justify-end">
                        <CustomButton
                            variant="outline"
                            size="sm"
                            className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => openPrintPage(inv.id)}
                        >
                            <Printer className="w-4 h-4 mr-1" />
                            Print
                        </CustomButton>
                        <CustomButton
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => navigate(`/dashboard/${firmId}/invoices/${inv.id}`)}
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                        </CustomButton>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="mt-[150px] px-6 pb-20">
            <div className="flex justify-between items-center mb-6">
                <AppBar
                    title="Invoices"
                    subTitle="Manage all customer invoices, super seller and distributor orders."
                />
                <div className="flex gap-3">
                    <CustomButton
                        variant="outline"
                        className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => batchPrint()}
                        isPending={isBatchPrinting}
                    >
                        <Printer className="w-4 h-4" />
                        Print All Approved
                    </CustomButton>
                    <Link to={`/dashboard/${firmId}/invoices/create`}>
                        <CustomButton className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create Invoice
                        </CustomButton>
                    </Link>
                </div>
            </div>

            <Datagrid
                columns={columns}
                title="Invoices"
                url={`/firm/${firmId}/invoices/`}
                filterConfig={invoiceFilterConfig}
            />
        </div>
    );
};

export default InvoicesPage;
