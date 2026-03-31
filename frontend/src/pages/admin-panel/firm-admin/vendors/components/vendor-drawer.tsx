import CustomButton from "@/components/ui/custom/custom-button";
import { Drawer } from "@/components/ui/custom/custom-drawer";
import CustomInput from "@/components/ui/custom/custom-input";
import { DatePickerComponent as CustomDatePicker } from "@/components/ui/custom/date-picker";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import * as Yup from "yup";

const VendorDrawer = ({
    open,
    onOpenChange,
    vendor,
    onSuccess,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vendor?: any;
    onSuccess?: () => void;
}) => {
    const { firmId } = useParams();

    const validationSchema = Yup.object().shape({
        vendor_name: Yup.string().required("Vendor name is required"),
        owner_name: Yup.string().required("Owner name is required"),
        gst_number: Yup.string().nullable(),
        gst_expiry: Yup.date().nullable(),
        whatsapp_number: Yup.string().required("WhatsApp number is required"),
        telephone_number: Yup.string().nullable(),
        address: Yup.string().required("Address is required"),
        bank_account_number: Yup.string().nullable(),
        ifsc_code: Yup.string().nullable(),
        email: Yup.string().email("Invalid email").required("Email is required"),
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (data: any) =>
            vendor
                ? axios.put(`/firm/${firmId}/vendors/${vendor.id}/`, data)
                : axios.post(`/firm/${firmId}/vendors/`, data),
        onSuccess() {
            toast.success(vendor ? "Vendor updated successfully" : "Vendor added successfully");
            onOpenChange(false);
            if (onSuccess) onSuccess();
            queryClient.refetchQueries({
                queryKey: [`/firm/${firmId}/vendors/`],
            });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Something went wrong!");
        },
    });

    const initialValues = {
        reference_code: vendor?.reference_code || "",
        vendor_name: vendor?.vendor_name || "",
        owner_name: vendor?.owner_name || "",
        gst_number: vendor?.gst_number || "",
        gst_expiry: vendor?.gst_expiry ? new Date(vendor.gst_expiry) : null,
        whatsapp_number: vendor?.whatsapp_number || "",
        telephone_number: vendor?.telephone_number || "",
        address: vendor?.address || "",
        bank_account_number: vendor?.bank_account_number || "",
        ifsc_code: vendor?.ifsc_code || "",
        email: vendor?.email || "",
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} width="600px">
            <div className="h-full flex flex-col pt-14">
                <div className="h-[3.75rem] w-full absolute top-0 z-50 border-b px-[20px] bg-white border-[#D0D0D7] text-[18px] font-bold py-[16px]">
                    {vendor ? "Update Vendor" : "Add Vendor"}
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    enableReinitialize
                    onSubmit={(values) => {
                        mutate(values);
                    }}
                >
                    {() => (
                        <Form className="flex-1 overflow-y-auto px-5 py-6">
                            <div className="space-y-6 mb-20">
                                <CustomInput
                                    name="reference_code"
                                    label="Vendor code (e.g. V001)"
                                    placeholder="Optional external id"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <CustomInput
                                        name="vendor_name"
                                        label="Vendor Name"
                                        required
                                        placeholder="Enter vendor name"
                                    />
                                    <CustomInput
                                        name="owner_name"
                                        label="Owner Name"
                                        required
                                        placeholder="Enter owner name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <CustomInput
                                        name="email"
                                        label="Email"
                                        required
                                        placeholder="Enter email"
                                    />
                                    <CustomInput
                                        name="whatsapp_number"
                                        label="WhatsApp Number"
                                        required
                                        placeholder="Enter WhatsApp number"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <CustomInput
                                        name="gst_number"
                                        label="GST Number"
                                        placeholder="Enter GST number"
                                    />
                                    <CustomDatePicker
                                        name="gst_expiry"
                                        label="GST Expiry"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <CustomInput
                                        name="telephone_number"
                                        label="Telephone Number"
                                        placeholder="Enter telephone number"
                                    />
                                    <CustomInput
                                        name="ifsc_code"
                                        label="IFSC Code"
                                        placeholder="Enter IFSC code"
                                    />
                                </div>

                                <CustomInput
                                    name="bank_account_number"
                                    label="Bank Account Number"
                                    placeholder="Enter bank account number"
                                />

                                <CustomInput
                                    name="address"
                                    label="Address"
                                    required
                                    placeholder="Enter complete address"
                                />
                            </div>

                            <div className="bg-white absolute bottom-0 right-0 border-t w-full flex justify-end items-center px-7 py-4 gap-4 z-50">
                                <CustomButton variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </CustomButton>
                                <CustomButton type="submit" isPending={isPending} disabled={isPending}>
                                    {vendor ? "Update Vendor" : "Add Vendor"}
                                </CustomButton>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </Drawer>
    );
};

export default VendorDrawer;
