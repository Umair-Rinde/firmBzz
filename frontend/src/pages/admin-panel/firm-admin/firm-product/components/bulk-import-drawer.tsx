import CustomButton from "@/components/ui/custom/custom-button";
import { Drawer } from "@/components/ui/custom/custom-drawer";
import CustomFileInput from "@/components/ui/custom/custom-file-input";
import { getApiErrorMessage } from "@/config/api-error";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useFirmSlug } from "@/hooks/useFirmSlug";
import { useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import { FaDownload } from "react-icons/fa";

const BulkImportDrawer = ({
    handleClose,
    open,
}: {
    handleClose: () => void;
    open: boolean;
}) => {
    const firmId = useFirmSlug();
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const [successCount, setSuccessCount] = useState<number | null>(null);

    //--------- validation schema -----------//
    const validationSchema = Yup.object().shape({
        file: Yup.mixed().required("File is required"),
    });

    const downloadTemplate = () => {
        const headers =
            "itemname,description,category,hsnno,gstper,liters,pack,mrp,prate,prateur,srate,rate/uni,product_discount,active";
        const sample =
            "Sample Oil,Optional text,Beverages,123456,18,1,6,120,1000,950,800,75,10,yes";
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${sample}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "product_import_template.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    //-------- api call ---------//
    const { mutate, isPending } = useMutation({
        mutationFn: (data: FormData) =>
            axios.post(`/firm/${firmId}/products/bulk-import/`, data),
        onSuccess(data) {
            toast.success(data?.data?.message || "Products imported successfully");

            const successCount = data?.data?.data?.success_count;
            const errors = data?.data?.data?.errors;

            setSuccessCount(successCount || 0);
            setImportErrors(errors || []);

            queryClient.invalidateQueries({
                queryKey: [`/firm/${firmId}/products/`],
            });

            if (!errors || errors.length === 0) {
                handleClose();
            }
        },
        onError: (resp: unknown) => {
            const errorsList = (resp as { response?: { data?: { errors?: unknown } } })
                ?.response?.data?.errors;
            if (Array.isArray(errorsList) && errorsList.length > 0) {
                setImportErrors(errorsList as string[]);
                setSuccessCount(0);
                toast.error(getApiErrorMessage(resp, "Import encountered errors"));
            } else {
                toast.error(getApiErrorMessage(resp));
            }
        },
    });

    const handleDrawerClose = () => {
        setImportErrors([]);
        setSuccessCount(null);
        handleClose();
    };

    return (
        <div>
            <Drawer open={open} onOpenChange={handleDrawerClose} width="500px">
                <div className="h-full overflow-y-auto">
                    <div className="h-[3.75rem] w-full absolute top-0 z-50 border-b px-[20px] bg-white border-[#D0D0D7] text-[18px] flex justify-between items-center py-[16px]">
                        <span className="font-bold">Bulk Import Products</span>
                        <CustomButton
                            variant="outline"
                            className="text-primary border-primary hover:bg-primary/5 h-8 text-xs"
                            onClick={downloadTemplate}
                            type="button"
                        >
                            <FaDownload className="mr-2" /> Template
                        </CustomButton>
                    </div>

                    <Formik
                        initialValues={{ file: null }}
                        validateOnMount
                        onSubmit={(values: any) => {
                            if (values.file) {
                                setImportErrors([]);
                                setSuccessCount(null);
                                const formData = new FormData();
                                formData.append("file", values.file);
                                mutate(formData);
                            }
                        }}
                        validationSchema={validationSchema}
                    >
                        {({ errors, values }) => (
                            <Form className="h-full flex flex-col justify-between pt-16">
                                <div className="flex flex-col gap-6 py-4 px-[20px] mb-16">
                                    <div className="text-sm text-gray-500 mb-2">
                                        Upload Excel (.xlsx, .xls) or CSV. Headers are matched case-insensitive.
                                        <ul className="list-disc ml-5 mt-2 text-xs space-y-1">
                                            <li><b>itemname</b> / name / product name (required)</li>
                                            <li><b>hsnno</b> / hsn_code / hsn</li>
                                            <li><b>gstper</b> / gst_percent</li>
                                            <li><b>liters</b>, <b>pack</b>, <b>mrp</b></li>
                                            <li><b>prate</b> purchase_rate, <b>prateur</b> purchase_rate_per_unit</li>
                                            <li><b>srate</b> sale_rate, <b>rate/uni</b> rate_per_unit</li>
                                            <li><b>product_discount</b> / discount / disc</li>
                                            <li><b>active</b> / is_active (yes/no)</li>
                                        </ul>
                                    </div>

                                    <CustomFileInput
                                        name="file"
                                        label="Upload File"
                                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                        required
                                        className="w-full"
                                    />

                                    {successCount !== null && (
                                        <div className="mt-4 p-4 rounded-md bg-green-50 text-green-800 border border-green-200">
                                            <p className="font-medium">Successfully imported {successCount} products.</p>
                                        </div>
                                    )}

                                    {importErrors.length > 0 && (
                                        <div className="mt-4 p-4 rounded-md bg-red-50 text-red-800 border border-red-200 max-h-48 overflow-y-auto">
                                            <p className="font-medium mb-2">Failed Rows ({importErrors.length}):</p>
                                            <ul className="list-disc ml-5 text-sm space-y-1">
                                                {importErrors.map((err, i) => (
                                                    <li key={i}>{err}</li>
                                                ))}
                                            </ul>
                                            <p className="text-xs mt-2 text-red-600">Note: Rows with errors were skipped. Successful rows were saved.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white border-t flex justify-end items-center px-[28px] py-[16px] gap-5 mt-auto sticky bottom-0">
                                    <CustomButton variant="outline" onClick={() => handleDrawerClose()}>
                                        Cancel
                                    </CustomButton>
                                    <CustomButton
                                        type="submit"
                                        isPending={isPending}
                                        disabled={isPending}
                                    >
                                        Import
                                    </CustomButton>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Drawer>
        </div>
    );
};

export default BulkImportDrawer;
