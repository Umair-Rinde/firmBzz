import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import CustomInput from "@/components/ui/custom/custom-input";
import CustomSelect from "@/components/ui/custom/custom-select";
import { DatePickerComponent as CustomDatePicker } from "@/components/ui/custom/date-picker";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FieldArray, Form, Formik } from "formik";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import * as Yup from "yup";

const VendorOrderAddPage = () => {
    const { firmId } = useParams();
    const navigate = useNavigate();

    const { data: vendorsData } = useQuery({
        queryKey: [`/firm/${firmId}/vendors/`],
        queryFn: () => axios.get(`/firm/${firmId}/vendors/`),
    });

    const { data: productsData } = useQuery({
        queryKey: [`/firm/${firmId}/products/`],
        queryFn: () => axios.get(`/firm/${firmId}/products/`),
    });

    const vendors = vendorsData?.data?.data?.rows || [];
    const products = productsData?.data?.data?.rows || [];

    const validationSchema = Yup.object().shape({
        vendor: Yup.object().required("Vendor is required"),
        order_number: Yup.string().required("Order number is required"),
        order_date: Yup.date().required("Order date is required"),
        vendor_invoice_number: Yup.string().nullable(),
        items: Yup.array().of(
            Yup.object().shape({
                product: Yup.object().required("Product is required"),
                quantity_ordered: Yup.number().min(1, "Min 1").required("Req"),
                cost_price_per_unit: Yup.number().min(0).required("Req"),
                selling_price_super_seller: Yup.number().min(0).required("Req"),
                selling_price_distributor: Yup.number().min(0).required("Req"),
                batch_number: Yup.string().required("Req"),
            })
        ).min(1, "At least one item is required"),
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (data: any) => axios.post(`/firm/${firmId}/vendor-orders/`, data),
        onSuccess: () => {
            toast.success("Vendor order created successfully");
            queryClient.invalidateQueries({ queryKey: [`/firm/${firmId}/vendor-orders/`] });
            navigate(`/dashboard/${firmId}/vendor-orders`);
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to create order");
        },
    });

    const initialValues = {
        vendor: null,
        order_number: `ORD-${Date.now().toString().slice(-6)}`,
        order_date: new Date(),
        vendor_invoice_number: "",
        items: [
            {
                product: null,
                quantity_ordered: 1,
                cost_price_per_unit: 0,
                selling_price_super_seller: 0,
                selling_price_distributor: 0,
                batch_number: "",
                manufacturing_date: null,
                expiry_date: null,
            },
        ],
        notes: "",
    };

    const handleSubmit = (values: any) => {
        const payload = {
            ...values,
            vendor: values.vendor.id,
            total_amount: values.items.reduce((acc: number, item: any) => acc + (item.quantity_ordered * item.cost_price_per_unit), 0),
            items: values.items.map((item: any) => ({
                ...item,
                product: item.product.id,
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
                <AppBar title="Create Vendor Order" subTitle="Place a new order with your vendor." />
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue }) => (
                    <Form className="space-y-8 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <CustomSelect
                                name="vendor"
                                label="Select Vendor"
                                placeholder="Select a vendor"
                                options={vendors}
                                getOptionLabel={(v) => v.vendor_name}
                                getOptionValue={(v) => v.id}
                                required
                            />
                            <CustomInput name="order_number" label="Order Number" required />
                            <CustomDatePicker name="order_date" label="Order Date" required />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                Order Items
                            </h3>
                            <FieldArray name="items">
                                {({ push, remove }) => (
                                    <div className="space-y-4">
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50 text-left text-sm font-medium text-gray-500">
                                                        <th className="p-3 border min-w-[200px]">Product *</th>
                                                        <th className="p-3 border w-24">Qty *</th>
                                                        <th className="p-3 border w-32">Cost/Unit *</th>
                                                        <th className="p-3 border w-32">SS Price *</th>
                                                        <th className="p-3 border w-32">Dist Price *</th>
                                                        <th className="p-3 border w-32">Batch # *</th>
                                                        <th className="p-3 border w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {values.items.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="p-2 border">
                                                                <CustomSelect
                                                                    name={`items.${index}.product`}
                                                                    options={products}
                                                                    getOptionLabel={(p) => p.name}
                                                                    getOptionValue={(p) => p.id}
                                                                    placeholder="Select product"
                                                                    className="!w-full"
                                                                />
                                                            </td>
                                                            <td className="p-2 border">
                                                                <CustomInput name={`items.${index}.quantity_ordered`} type="number" className="!h-11" />
                                                            </td>
                                                            <td className="p-2 border">
                                                                <CustomInput name={`items.${index}.cost_price_per_unit`} type="number" className="!h-11" />
                                                            </td>
                                                            <td className="p-2 border">
                                                                <CustomInput name={`items.${index}.selling_price_super_seller`} type="number" className="!h-11" />
                                                            </td>
                                                            <td className="p-2 border">
                                                                <CustomInput name={`items.${index}.selling_price_distributor`} type="number" className="!h-11" />
                                                            </td>
                                                            <td className="p-2 border">
                                                                <CustomInput name={`items.${index}.batch_number`} className="!h-11" />
                                                            </td>
                                                            <td className="p-2 border text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => remove(index)}
                                                                    className="text-red-500 hover:bg-red-50 p-2 rounded"
                                                                    disabled={values.items.length === 1}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <CustomButton
                                            type="button"
                                            variant="outline"
                                            onClick={() => push({
                                                product: null,
                                                quantity_ordered: 1,
                                                cost_price_per_unit: 0,
                                                selling_price_super_seller: 0,
                                                selling_price_distributor: 0,
                                                batch_number: "",
                                                manufacturing_date: null,
                                                expiry_date: null,
                                            })}
                                            className="flex gap-2"
                                        >
                                            <Plus className="h-4 w-4" /> Add Another Item
                                        </CustomButton>
                                    </div>
                                )}
                            </FieldArray>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-6 border-t">
                            <div className="w-full md:w-1/2">
                                <CustomInput name="notes" label="Notes" placeholder="Add any special instructions or notes..." />
                            </div>
                            <div className="text-right space-y-2">
                                <p className="text-sm text-gray-500 font-medium whitespace-nowrap">
                                    Total Amount:
                                </p>
                                <p className="text-3xl font-bold text-teal-600">
                                    ₹{values.items.reduce((acc, item) => acc + (item.quantity_ordered * item.cost_price_per_unit), 0).toFixed(2)}
                                </p>
                                <div className="flex gap-4">
                                    <CustomButton variant="outline" type="button" onClick={() => navigate(-1)}>
                                        Cancel
                                    </CustomButton>
                                    <CustomButton type="submit" isPending={isPending} disabled={isPending}>
                                        Place Order
                                    </CustomButton>
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default VendorOrderAddPage;
