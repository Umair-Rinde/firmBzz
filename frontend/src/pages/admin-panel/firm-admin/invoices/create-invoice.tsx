import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import CustomInput from "@/components/ui/custom/custom-input";
import CustomSelect from "@/components/ui/custom/custom-select";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FieldArray, Form, Formik } from "formik";
import { ArrowLeft, Info, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import * as Yup from "yup";

import { useRef } from "react";

const InvoiceCreatePage = () => {
    const debounceRef = useRef<any>(null);
    const { firmId } = useParams();
    const navigate = useNavigate();
    const [pricing, setPricing] = useState<any>(null);
    const [isPreviewing, setIsPreviewing] = useState(false);

    const { data: customersData } = useQuery({
        queryKey: [`/firm/${firmId}/customers/`],
        queryFn: () => axios.get(`/firm/${firmId}/customers/`),
    });

    const { data: productsData } = useQuery({
        queryKey: [`/firm/${firmId}/products/`],
        queryFn: () => axios.get(`/firm/${firmId}/products/`),
    });

    const customers = customersData?.data?.data?.rows || [];
    const activeCustomers = customers.filter((c: any) => c.is_active);
    const products = productsData?.data?.data?.rows || [];

    const validationSchema = Yup.object().shape({
        customer: Yup.object({
            id: Yup.string().required("Customer ID is required"),
        }).nullable().required("Customer is required"),
        items: Yup.array().of(
            Yup.object().shape({
                product: Yup.object().required("Product is required"),
                quantity: Yup.number()
                    .min(1, "Minimum quantity is 1")
                    .required("Required")
                    .test('max-qty', 'Exceeds available stock', function (value) {
                        const product = this.parent.product;
                        if (!product || value == null) return true;
                        return value <= product.available_quantity;
                    }),
            })
        ).min(1, "Add at least one product to the invoice"),
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (data: any) => axios.post(`/firm/${firmId}/invoices/`, data),
        onSuccess: (res: any) => {
            toast.success("Invoice created successfully");
            queryClient.invalidateQueries({ queryKey: [`/firm/${firmId}/invoices/`] });
            navigate(`/dashboard/${firmId}/invoices/${res.data.data.id}`);
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to create invoice");
        },
    });

    const initialValues = {
        customer: null as any,
        items: [{ product: null as any, quantity: 1 }],
    };

    const fetchPricing = async (customer: any, items: any[]) => {
        const validItems = items.filter((i) => i.product && i.quantity > 0);
        if (!customer || validItems.length === 0) {
            setPricing(null);
            return;
        }
        setIsPreviewing(true);
        try {
            const res = await axios.post(`/firm/${firmId}/invoices/preview-pricing/`, {
                customer: customer.id,
                items: validItems.map((i) => ({
                    product: i.product.id,
                    quantity: Number(i.quantity),
                })),
            });
            if (res.data?.data) {
                setPricing(res.data.data);
            }
        } catch (err: any) {
            // Clear pricing if there's an error (e.g. insufficient stock)
            setPricing(null);
            const msg = err?.response?.data?.message;
            if (msg) toast.error(msg);
        } finally {
            setIsPreviewing(false);
        }
    };

    const handleSubmit = (values: any) => {
        const payload = {
            customer: values.customer.id,
            items: values.items.map((item: any) => ({
                product: item.product.id,
                quantity: Number(item.quantity),
            })),
        };
        mutate(payload);
    };

    return (
        <div className="mt-[150px] px-6 pb-20">
            <div className="flex items-center gap-4 mb-6">
                <CustomButton variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </CustomButton>
                <AppBar title="Create Invoice" subTitle="Generate a new invoice for a customer." />
            </div>

            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                {({ values, setFieldValue, errors, touched }) => {
                    const handleProductSelection = (product: any, index: number) => {
                        setFieldValue(`items.${index}.product`, product);
                        setFieldValue(`items.${index}.quantity`, 1);
                        // Trigger pricing with updated product list
                        const updatedItems = values.items.map((item, i) =>
                            i === index ? { ...item, product, quantity: 1 } : item
                        );
                        fetchPricing(values.customer, updatedItems);
                    };

                    const handleCustomerSelection = (customer: any) => {
                        setFieldValue("customer", customer);
                        fetchPricing(customer, values.items);
                    };

                    const handleQuantityBlur = () => {
                        fetchPricing(values.customer, values.items);
                    };

                    return (
                        <Form className="space-y-6">
                            {/* Customer + Form Card */}
                            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Customer Details</h3>
                                        <CustomSelect
                                            name="customer"
                                            label="Select Customer"
                                            placeholder="Select super seller or distributor"
                                            options={activeCustomers}
                                            getOptionLabel={(c) => `${c.business_name} (${c.customer_type === 'SUPER_SELLER' ? 'Super Seller' : 'Distributor'})`}
                                            getOptionValue={(c) => c.id}
                                            onChange={(c) => handleCustomerSelection(c)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Invoice Items</h3>
                                    <FieldArray name="items">
                                        {({ push, remove }) => (
                                            <div className="space-y-4">
                                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr className="bg-gray-50 text-left text-sm font-medium text-gray-500">
                                                                <th className="p-3 border-b min-w-[250px]">Product *</th>
                                                                <th className="p-3 border-b w-40">Quantity *</th>
                                                                <th className="p-3 border-b w-12 text-center"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {values.items.map((item, index) => {
                                                                const itemErrors = (errors.items as any)?.[index];
                                                                const itemTouched = (touched.items as any)?.[index];
                                                                return (
                                                                    <tr key={index} className="border-b last:border-0 hover:bg-gray-50/50">
                                                                        <td className="p-3">
                                                                            <CustomSelect
                                                                                name={`items.${index}.product`}
                                                                                options={products}
                                                                                getOptionLabel={(p) => `${p.name} (Stock: ${p.available_quantity ?? 0})`}
                                                                                getOptionValue={(p) => p.id}
                                                                                placeholder="Select product"
                                                                                onChange={(p) => handleProductSelection(p, index)}
                                                                                className="!w-full"
                                                                            />
                                                                        </td>
                                                                        <td className="p-3">
                                                                            <CustomInput
                                                                                name={`items.${index}.quantity`}
                                                                                type="number"
                                                                                className="!h-10"
                                                                                onChange={(e: any) => {
                                                                                    const value = e.target.value;
                                                                                    setFieldValue(`items.${index}.quantity`, value);

                                                                                    const updatedItems = values.items.map((item, i) =>
                                                                                        i === index
                                                                                            ? { ...item, quantity: Number(value) }
                                                                                            : item
                                                                                    );

                                                                                    if (debounceRef.current) clearTimeout(debounceRef.current);

                                                                                    debounceRef.current = setTimeout(() => {
                                                                                        fetchPricing(values.customer, updatedItems);
                                                                                    }, 400);
                                                                                }}
                                                                            />
                                                                            {itemErrors?.quantity && itemTouched?.quantity && (
                                                                                <p className="text-red-500 text-xs mt-1">{itemErrors.quantity}</p>
                                                                            )}
                                                                        </td>
                                                                        <td className="p-3 text-center">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    remove(index);
                                                                                    const updatedItems = values.items.filter((_, i) => i !== index);
                                                                                    fetchPricing(values.customer, updatedItems);
                                                                                }}
                                                                                className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors"
                                                                                disabled={values.items.length === 1}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <CustomButton
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => push({ product: null, quantity: 1 })}
                                                    className="flex gap-2 border-dashed"
                                                >
                                                    <Plus className="h-4 w-4" /> Add Item
                                                </CustomButton>
                                            </div>
                                        )}
                                    </FieldArray>
                                </div>
                            </div>

                            {/* Pricing Preview Card */}
                            {(isPreviewing || pricing) && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 space-y-4">
                                    <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                                        <Info className="h-4 w-4" />
                                        {isPreviewing ? "Calculating pricing..." : "Estimated Pricing Breakdown (FEFO)"}
                                    </div>
                                    {!isPreviewing && pricing && (
                                        <>
                                            {pricing.items.map((item: any, idx: number) => (
                                                <div key={idx} className="bg-white rounded-lg border border-blue-100 p-4 space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-gray-800">{item.product_name}</span>
                                                        <span className="text-sm text-gray-500">Qty: {item.requested_quantity}</span>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-xs text-gray-600">
                                                            <thead>
                                                                <tr className="text-gray-400 border-b">
                                                                    <th className="text-left py-1 pr-4">Batch</th>
                                                                    <th className="text-left py-1 pr-4">Expiry</th>
                                                                    <th className="text-right py-1 pr-4">Qty</th>
                                                                    <th className="text-right py-1 pr-4">Rate</th>
                                                                    <th className="text-right py-1">Amount</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {item.batches.map((batch: any, bi: number) => (
                                                                    <tr key={bi} className="border-b last:border-0">
                                                                        <td className="py-1.5 pr-4 font-mono">{batch.batch_number}</td>
                                                                        <td className="py-1.5 pr-4 text-amber-600">{batch.expiry_date || '—'}</td>
                                                                        <td className="py-1.5 pr-4 text-right">{batch.quantity}</td>
                                                                        <td className="py-1.5 pr-4 text-right">₹{batch.rate}</td>
                                                                        <td className="py-1.5 text-right font-medium">₹{batch.amount}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className="flex justify-end text-sm font-semibold text-blue-700 pt-1 border-t border-blue-50">
                                                        Subtotal: ₹{item.estimated_total}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-end items-center gap-4 pt-2 border-t border-blue-200">
                                                <span className="text-sm text-blue-600 font-medium">Grand Total</span>
                                                <span className="text-2xl font-bold text-teal-600">₹{pricing.grand_total}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-4">
                                <CustomButton variant="outline" type="button" onClick={() => navigate(-1)}>
                                    Cancel
                                </CustomButton>
                                <CustomButton
                                    type="submit"
                                    isPending={isPending}
                                    disabled={isPending || values.items.length === 0}
                                    className="min-w-[150px]"
                                >
                                    Create Invoice
                                </CustomButton>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};

export default InvoiceCreatePage;
