import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import CustomInput from "@/components/ui/custom/custom-input";
import CustomSelect from "@/components/ui/custom/custom-select";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FieldArray, Form, Formik } from "formik";
import { ArrowLeft, Check, Plus, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import * as Yup from "yup";

const InvoiceEditPage = () => {
    const { firmId, id } = useParams();
    const navigate = useNavigate();
    const [rejectionNote, setRejectionNote] = useState("");

    const { data: invoiceData, isLoading: isLoadingInvoice } = useQuery({
        queryKey: [`/firm/${firmId}/invoices/${id}`],
        queryFn: () => axios.get(`/firm/${firmId}/invoices/${id}/`),
    });

    const { data: customersData } = useQuery({
        queryKey: [`/firm/${firmId}/customers/`],
        queryFn: () => axios.get(`/firm/${firmId}/customers/`),
    });

    const { data: productsData } = useQuery({
        queryKey: [`/firm/${firmId}/products/`],
        queryFn: () => axios.get(`/firm/${firmId}/products/`),
    });

    const invoice = invoiceData?.data?.data;
    const customers = customersData?.data?.data?.rows || [];
    const products = productsData?.data?.data?.rows || [];

    // We assume the logged-in user context helps decide if we can approve.
    // In a real app, this value would come from an auth hook (e.g., useAuth().user.role).
    // For now, testing generic layout capabilities.
    const isFirmAdmin = true; // Hardcoded for demo logic but can wire to role later 

    const validationSchema = Yup.object().shape({
        customer: Yup.object().required("Customer is required"),
        items: Yup.array().of(
            Yup.object().shape({
                product: Yup.object().required("Product is required"),
                quantity: Yup.number().min(1, "Min 1").required("Req"),
                // rate removed from validation because it's calculated on backend like create, but maybe sent just to make form match.
            })
        ).min(1, "Add at least one product"),
    });

    const { mutate: updateInvoice, isPending: isUpdating } = useMutation({
        mutationFn: (data: any) => axios.put(`/firm/${firmId}/invoices/${id}/`, data),
        onSuccess: () => {
            toast.success("Invoice updated successfully");
            queryClient.invalidateQueries({ queryKey: [`/firm/${firmId}/invoices/${id}`] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update invoice");
        },
    });

    const { mutate: approveInvoice, isPending: isApproving } = useMutation({
        mutationFn: () => axios.post(`/firm/${firmId}/invoices/${id}/approve/`),
        onSuccess: () => {
            toast.success("Invoice approved successfully");
            queryClient.invalidateQueries({ queryKey: [`/firm/${firmId}/invoices/${id}`] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to approve invoice");
        },
    });

    const { mutate: rejectInvoice, isPending: isRejecting } = useMutation({
        mutationFn: (data: { note: string }) => axios.post(`/firm/${firmId}/invoices/${id}/request-changes/`, data),
        onSuccess: () => {
            toast.success("Changes requested successfully");
            setRejectionNote("");
            queryClient.invalidateQueries({ queryKey: [`/firm/${firmId}/invoices/${id}`] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to request changes");
        },
    });

    if (isLoadingInvoice || !invoice) return <div className="mt-[150px] px-6">Loading invoice...</div>;

    const initialValues = {
        customer: customers.find((c: any) => c.id === invoice.customer) || null,
        items: invoice.items.map((item: any) => ({
            product: products.find((p: any) => p.id === item.product) || null,
            quantity: item.quantity,
            rate: item.rate, // we still show the existing rate if it's already generated
            amount: item.amount,
            batch_number: item.batch_number,
        })),
    };

    const handleSubmit = (values: any) => {
        const payload = {
            customer: values.customer.id,
            items: values.items.map((item: any) => ({
                product: item.product.id,
                quantity: Number(item.quantity),
            })),
        };
        updateInvoice(payload);
    };

    const handleReject = () => {
        if (!rejectionNote.trim()) {
            toast.error("Please provide a note for requesting changes");
            return;
        }
        rejectInvoice({ note: rejectionNote });
    };

    const isEditable = invoice.status !== 'APPROVED';

    return (
        <div className="mt-[150px] px-6 pb-20">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <CustomButton variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </CustomButton>
                    <AppBar
                        title={`Invoice ${invoice.invoice_number || 'Pending'}`}
                        subTitle={`Status: ${invoice.status_display}`}
                    />
                </div>

                {isFirmAdmin && invoice.status === 'PENDING_APPROVAL' && (
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 mr-4">
                            <input
                                type="text"
                                placeholder="Change request note..."
                                value={rejectionNote}
                                onChange={(e) => setRejectionNote(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                            />
                            <CustomButton
                                variant="outline"
                                className="bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200"
                                onClick={handleReject}
                                isPending={isRejecting}
                                disabled={isApproving || isUpdating}
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Request Changes
                            </CustomButton>
                        </div>
                        <CustomButton
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => approveInvoice()}
                            isPending={isApproving}
                            disabled={isRejecting || isUpdating}
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Approve Invoice
                        </CustomButton>
                    </div>
                )}
            </div>

            {invoice.rejection_note && invoice.status === 'CHANGES_REQUESTED' && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-lg flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-orange-800">Changes Requested</h4>
                        <p className="text-orange-700 text-sm mt-1">{invoice.rejection_note}</p>
                    </div>
                </div>
            )}

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, setFieldValue }) => {
                    const totalAmount = values.items.reduce((acc, item) => {
                        // For newly added items before save, rate might be 0 until backend computes it. 
                        // But we want to sum what we have correctly for existing items
                        const rate = Number(item.rate) || 0;
                        return acc + (Number(item.quantity) * rate);
                    }, 0);

                    return (
                        <Form className="space-y-8 bg-white p-8 rounded-xl border border-gray-100 shadow-sm relative">
                            {/* Overlay if not editable */}
                            {!isEditable && (
                                <div className="absolute inset-0 bg-gray-50/40 z-10 pointer-events-none rounded-xl"></div>
                            )}

                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100 ${!isEditable ? 'opacity-80' : ''}`}>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Customer Details</h3>
                                    <CustomSelect
                                        name="customer"
                                        label="Select Customer"
                                        placeholder="Select customer"
                                        options={customers}
                                        getOptionLabel={(c) => `${c.business_name} (${c.customer_type === 'SUPER_SELLER' ? 'Super Seller' : 'Distributor'})`}
                                        getOptionValue={(c) => c.id}
                                        required
                                        disabled={!isEditable}
                                    />
                                </div>
                                <div className="space-y-2 pt-6">
                                    <p className="text-sm">
                                        <span className="text-gray-500">Created By:</span> <span className="font-medium text-gray-900">{invoice.created_by_name || '-'}</span>
                                    </p>
                                    {invoice.status === 'APPROVED' && (
                                        <p className="text-sm">
                                            <span className="text-gray-500">Approved By:</span> <span className="font-medium text-green-700">{invoice.approved_by_name || '-'}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className={`space-y-4 ${!isEditable ? 'opacity-80' : ''}`}>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                    Invoice Items
                                </h3>
                                <FieldArray name="items">
                                    {({ push, remove }) => (
                                        <div className="space-y-4">
                                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-50 text-left text-sm font-medium text-gray-500">
                                                            <th className="p-3 border-b min-w-[250px]">Product *</th>
                                                            <th className="p-3 border-b w-32">Batch</th>
                                                            <th className="p-3 border-b w-32">Quantity *</th>
                                                            <th className="p-3 border-b w-40">Allocated Rate (₹)</th>
                                                            <th className="p-3 border-b w-40 text-right">Amount (₹)</th>
                                                            {isEditable && <th className="p-3 border-b w-12 text-center"></th>}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {values.items.map((item, index) => {
                                                            const rate = Number(item.rate) || 0;
                                                            const amount = (Number(item.quantity) * rate).toFixed(2);
                                                            return (
                                                                <tr key={index} className="border-b last:border-0 hover:bg-gray-50/50">
                                                                    <td className="p-3">
                                                                        <CustomSelect
                                                                            name={`items.${index}.product`}
                                                                            options={products}
                                                                            getOptionLabel={(p) => `${p.name} (Stock: ${p.available_quantity || 0})`}
                                                                            getOptionValue={(p) => p.id}
                                                                            placeholder="Select product"
                                                                            className="!w-full"
                                                                            disabled={!isEditable}
                                                                        />
                                                                    </td>
                                                                    <td className="p-3 text-sm text-gray-600">
                                                                        {item.batch_number || <span className="text-gray-400 italic">Pending Allocation</span>}
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <CustomInput
                                                                            name={`items.${index}.quantity`}
                                                                            type="number"
                                                                            className="!h-10"
                                                                            disabled={!isEditable}
                                                                        />
                                                                    </td>
                                                                    <td className="p-3 font-medium text-gray-600">
                                                                        {rate > 0 ? `₹${rate.toFixed(2)}` : '-'}
                                                                    </td>
                                                                    <td className="p-3 text-right font-medium text-gray-700">
                                                                        {amount !== "0.00" ? amount : "TBD"}
                                                                    </td>
                                                                    {isEditable && (
                                                                        <td className="p-3 text-center">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => remove(index)}
                                                                                className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                                                                                disabled={values.items.length === 1}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </button>
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {isEditable && (
                                                <div className="flex justify-between items-center">
                                                    <CustomButton
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => push({
                                                            product: null,
                                                            quantity: 1,
                                                            rate: 0,
                                                            amount: 0,
                                                            batch_number: null,
                                                        })}
                                                        className="flex gap-2 border-dashed"
                                                    >
                                                        <Plus className="h-4 w-4" /> Add Item
                                                    </CustomButton>
                                                    <p className="text-xs text-blue-500 max-w-xs text-right">
                                                        Saving changes will re-calculate batch pricing automatically.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </FieldArray>
                            </div>

                            <div className="flex flex-col md:flex-row justify-end items-end gap-6 pt-6 border-t border-gray-100">
                                <div className="text-right space-y-3 w-full md:w-auto">
                                    <div className="flex justify-between md:justify-end gap-8 text-sm text-gray-500 font-medium">
                                        <span>Items Count:</span>
                                        <span>{values.items.length}</span>
                                    </div>
                                    <div className="flex justify-between md:justify-end gap-8 items-end">
                                        <p className="text-sm text-gray-500 font-medium whitespace-nowrap mb-1">
                                            Total Amount:
                                        </p>
                                        <p className="text-3xl font-bold text-teal-600">
                                            ₹{totalAmount.toFixed(2)}
                                        </p>
                                    </div>

                                    {isEditable && (
                                        <div className="flex gap-4 pt-4 relative z-20">
                                            <CustomButton type="submit" isPending={isUpdating} disabled={isUpdating || isApproving || values.items.length === 0} className="w-full md:w-auto min-w-[150px]">
                                                Save Changes
                                            </CustomButton>
                                        </div>
                                    )}
                                    {!isEditable && invoice.status === 'APPROVED' && (
                                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                                            <Check className="w-5 h-5" />
                                            <span className="font-semibold">Approved</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};

export default InvoiceEditPage;
