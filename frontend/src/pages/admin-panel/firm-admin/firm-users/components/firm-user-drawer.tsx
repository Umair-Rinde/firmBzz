import CustomButton from "@/components/ui/custom/custom-button";
import { Drawer } from "@/components/ui/custom/custom-drawer";
import CustomInput from "@/components/ui/custom/custom-input";
import CustomFileInput from "@/components/ui/custom/custom-file-input";
import CustomSelect from "@/components/ui/custom/custom-select";
import { DatePickerComponent as CustomDatePicker } from "@/components/ui/custom/date-picker";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import * as Yup from "yup";

const FirmUserDrawer = ({
    open,
    onOpenChange,
    user,
    onSuccess,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: any;
    onSuccess?: () => void;
}) => {
    const { firmId } = useParams();

    const validationSchema = Yup.object().shape({
        full_name: Yup.string().required("Full name is required"),
        email: Yup.string().email("Invalid email").required("Email is required"),
        phone: Yup.string().required("Phone number is required"),
        password: user
            ? Yup.string().min(6, "Password must be at least 6 characters")
            : Yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
        gender: Yup.object().required("Gender is required"),
        role: Yup.object().required("Role is required"),
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (data: any) =>
            user
                ? axios.put(`/firm/${firmId}/firm-users/${user.id}/`, data)
                : axios.post(`/firm/${firmId}/firm-users/`, data),
        onSuccess() {
            toast.success(user ? "User updated successfully" : "User added successfully");
            onOpenChange(false);
            if (onSuccess) onSuccess();
            queryClient.invalidateQueries({
                queryKey: [`/firm/${firmId}/firm-users/`],
            });
        },
        onError: (resp: any) => {
            toast.error(resp?.response?.data?.message || "Something went wrong!");
        },
    });

    const genderOptions = [
        { label: "Male", value: "MALE" },
        { label: "Female", value: "FEMALE" },
        { label: "Other", value: "OTHER" },
    ];

    const roleOptions = [
        { label: "Firm Admin", value: "FIRM_ADMIN" },
        { label: "Firm User", value: "FIRM_USER" },
        { label: "Super Seller", value: "SUPERSELLER_USER" },
        { label: "Distributor", value: "DISTRIBUTOR_USER" },
        { label: "Sales Person", value: "SALES_PERSON" },
    ];

    const statusOptions = [
        { label: "Active", value: true },
        { label: "Inactive", value: false },
    ];

    const initialValues = {
        full_name: user?.user_full_name || "",
        email: user?.user_email || "",
        phone: user?.user_phone || "",
        password: "",
        gender: user?.user_gender
            ? genderOptions.find((g) => g.value === user.user_gender)
            : genderOptions[0],
        role: user?.role
            ? roleOptions.find((r) => r.value === user.role)
            : roleOptions[1],
        aadhaar_number: user?.aadhaar_number || "",
        pan_number: user?.pan_number || "",
        driving_license: user?.driving_license || "",
        license_expiry: user?.license_expiry || null,
        home_address: user?.home_address || "",
        license_document: user?.license_document || null,
        address_proof_document: user?.address_proof_document || null,
        is_active: user?.is_active !== undefined
            ? statusOptions.find((s) => s.value === user.is_active)
            : statusOptions[0],
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} width="600px">
            <div className="h-full flex flex-col pt-14">
                <div className="h-[3.75rem] w-full absolute top-0 z-50 border-b px-[20px] bg-white border-[#D0D0D7] text-[18px] font-bold py-[16px]">
                    {user ? "Update User" : "Add User"}
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    enableReinitialize
                    onSubmit={(values) => {
                        const formData = new FormData();

                        Object.keys(values).forEach(key => {
                            let value = (values as any)[key];

                            if (value === null || value === undefined || value === "") {
                                return; // Skip nulls
                            }

                            // Don't re-upload string file URLs
                            if (typeof value === 'string' && (key === 'license_document' || key === 'address_proof_document')) {
                                return;
                            }

                            if (key === 'gender' || key === 'role' || key === 'is_active') {
                                formData.append(key, value.value);
                            } else if (key === 'license_expiry') {
                                if (value instanceof Date) {
                                    formData.append(key, value.toISOString());
                                } else {
                                    formData.append(key, value);
                                }
                            } else if (key === 'password' && !value) {
                                // Skip empty password
                                return;
                            } else if (value instanceof File) {
                                formData.append(key, value);
                            } else {
                                formData.append(key, value);
                            }
                        });

                        mutate(formData as any);
                    }}
                >
                    {({ errors, touched }) => (
                        <Form className="flex-1 overflow-y-auto px-5 py-6">
                            <div className="space-y-6 mb-20">
                                <div className="grid grid-cols-2 gap-4">
                                    <CustomInput
                                        name="full_name"
                                        label="Full Name"
                                        required
                                        placeholder="Enter full name"
                                    />
                                    <CustomInput
                                        name="email"
                                        label="Email"
                                        required
                                        disabled={!!user}
                                        placeholder="Enter email"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <CustomInput
                                        name="phone"
                                        label="Phone Number"
                                        required
                                        placeholder="Enter phone number"
                                    />
                                    <CustomInput
                                        name="password"
                                        label={user ? "New Password (optional)" : "Password"}
                                        type="password"
                                        required={!user}
                                        placeholder="Enter password"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <CustomSelect
                                        name="gender"
                                        label="Gender"
                                        options={genderOptions}
                                        getOptionLabel={(o) => o.label}
                                        getOptionValue={(o) => o.value}
                                        required
                                    />
                                    <CustomSelect
                                        name="role"
                                        label="Role"
                                        options={roleOptions}
                                        getOptionLabel={(o) => o.label}
                                        getOptionValue={(o) => o.value}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <CustomInput
                                        name="aadhaar_number"
                                        label="Aadhaar Number"
                                        placeholder="Enter 12-digit Aadhaar"
                                    />
                                    <CustomInput
                                        name="pan_number"
                                        label="PAN Number"
                                        placeholder="Enter PAN"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <CustomInput
                                        name="driving_license"
                                        label="Driving License"
                                        placeholder="Enter DL number"
                                    />
                                    <CustomDatePicker
                                        name="license_expiry"
                                        label="License Expiry"
                                    />
                                </div>

                                <CustomInput
                                    name="home_address"
                                    label="Home Address"
                                    placeholder="Enter complete address"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <CustomFileInput
                                        name="license_document"
                                        label="License Document (Optional)"
                                        className="w-full"
                                    />
                                    <CustomFileInput
                                        name="address_proof_document"
                                        label="Address Proof (Optional)"
                                        className="w-full"
                                    />
                                </div>

                                <CustomSelect
                                    name="is_active"
                                    label="Status"
                                    options={statusOptions}
                                    getOptionLabel={(o) => o.label}
                                    getOptionValue={(o) => o.value}
                                    required
                                />
                            </div>

                            <div className="bg-white absolute bottom-0 right-0 border-t w-full flex justify-end items-center px-7 py-4 gap-4 z-50">
                                <CustomButton variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </CustomButton>
                                <CustomButton type="submit" isPending={isPending} disabled={isPending}>
                                    {user ? "Update User" : "Add User"}
                                </CustomButton>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </Drawer>
    );
};

export default FirmUserDrawer;
