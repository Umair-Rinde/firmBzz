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

const BulkImportOrderDrawer = ({
    handleClose,
    open,
}: {
    handleClose: () => void;
    open: boolean;
}) => {
    const firmId = useFirmSlug();
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const [successCount, setSuccessCount] = useState<number | null>(null);

    const validationSchema = Yup.object().shape({
        file: Yup.mixed().required("File is required"),
    });

    const downloadTemplate = () => {
        const csvContent =
            "data:text/csv;charset=utf-8," +
            "order_number,vendor_name,order_date,vendor_invoice_number,product_name,quantity_ordered,cost_price_per_unit,selling_price_super_seller,selling_price_distributor,batch_number,manufacturing_date,expiry_date,notes\n" +
            "ORD-001,Sample Vendor,2026-03-15,INV-001,Sample Product,10,100,120,110,BATCH-001,2026-01-01,2027-01-01,First order";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "vendor_order_import_template.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const { mutate, isPending } = useMutation({
        mutationFn: (data: FormData) =>
            axios.post(`/firm/${firmId}/vendor-orders/bulk-import/`, data),
        onSuccess(data) {
            toast.success(data?.data?.message || "Orders imported successfully");

            const ordersCreated = data?.data?.data?.orders_created;
            const errors = data?.data?.data?.errors;

            setSuccessCount(ordersCreated || 0);
            setImportErrors(errors || []);

            queryClient.invalidateQueries({
                queryKey: [`/firm/${firmId}/vendor-orders/`],
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
            <Drawer open={open} onOpenChange={handleDrawerClose} width="550px">
                <div className="h-full overflow-y-auto">
                    <div className="h-[3.75rem] w-full absolute top-0 z-50 border-b px-[20px] bg-white border-[#D0D0D7] text-[18px] flex justify-between items-center py-[16px]">
                        <span className="font-bold">Bulk Import Vendor Orders</span>
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
                                        Upload an Excel (.xlsx, .xls) or CSV (.csv) file.
                                        <br />
                                        Each row is one order item. Rows with the same <b>order_number</b> are grouped into one order.
                                        <br /><br />
                                        <b>Required columns:</b>
                                        <ul className="list-disc ml-5 mt-1 text-xs">
                                            <li><b>order_number</b> — groups items into orders</li>
                                            <li><b>vendor_name</b> — must match an existing vendor</li>
                                            <li><b>order_date</b> — e.g. 2026-03-15</li>
                                            <li><b>product_name</b> — must match an existing product</li>
                                            <li><b>quantity_ordered</b></li>
                                            <li><b>cost_price_per_unit</b></li>
                                            <li><b>selling_price_super_seller</b></li>
                                            <li><b>selling_price_distributor</b></li>
                                            <li><b>batch_number</b></li>
                                        </ul>
                                        <br />
                                        <b>Optional:</b> manufacturing_date, expiry_date, vendor_invoice_number, notes
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
                                            <p className="font-medium">Successfully imported {successCount} vendor order(s).</p>
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
                                            <p className="text-xs mt-2 text-red-600">
                                                Note: Rows with errors were skipped. Successfully matched rows were saved.
                                            </p>
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

export default BulkImportOrderDrawer;
