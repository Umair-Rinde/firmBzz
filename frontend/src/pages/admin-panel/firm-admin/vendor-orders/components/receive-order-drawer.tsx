import CustomButton from "@/components/ui/custom/custom-button";
import { Drawer } from "@/components/ui/custom/custom-drawer";
import CustomInput from "@/components/ui/custom/custom-input";
import { getApiErrorMessage } from "@/config/api-error";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useFirmSlug } from "@/hooks/useFirmSlug";
import { toast } from "sonner";
import * as Yup from "yup";

const ReceiveOrderDrawer = ({
    open,
    onOpenChange,
    order,
    onSuccess,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: any;
    onSuccess?: () => void;
}) => {
    const firmId = useFirmSlug();

    const validationSchema = Yup.object().shape({
        items: Yup.array().of(
            Yup.object().shape({
                quantity_received: Yup.number().min(0).required("Required"),
            })
        ),
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (data: any) => axios.post(`/firm/${firmId}/vendor-orders/${order.id}/receive/`, data),
        onSuccess() {
            toast.success("Order received and inventory updated");
            onOpenChange(false);
            if (onSuccess) onSuccess();
            queryClient.invalidateQueries({ queryKey: [`/firm/${firmId}/vendor-orders/`] });
            queryClient.invalidateQueries({ queryKey: [`/firm/${firmId}/products/`] });
        },
        onError: (err: unknown) => {
            toast.error(getApiErrorMessage(err, "Something went wrong!"));
        },
    });

    const initialValues = {
        items: order?.items?.map((item: any) => ({
            id: item.id,
            quantity_received: item.quantity_received || item.quantity_ordered,
        })) || [],
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} width="600px">
            <div className="h-full flex flex-col pt-14">
                <div className="h-[3.75rem] w-full absolute top-0 z-50 border-b px-[20px] bg-white border-[#D0D0D7] text-[18px] font-bold py-[16px]">
                    Receive Order: {order?.order_number}
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    enableReinitialize
                    onSubmit={(values) => {
                        mutate(values);
                    }}
                >
                    {({ values }) => (
                        <Form className="flex-1 overflow-y-auto px-5 py-6">
                            <div className="space-y-6 mb-20">
                                <p className="text-sm text-gray-500">
                                    Confirm the quantity received for each item. This will create product batches and update your inventory.
                                </p>

                                <div className="space-y-4">
                                    {order?.items?.map((item: any, index: number) => (
                                        <div key={item.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{item.product_name}</p>
                                                <p className="text-xs text-gray-500">Ordered: {item.quantity_ordered} | Batch: {item.batch_number}</p>
                                            </div>
                                            <div className="w-32">
                                                <CustomInput
                                                    name={`items.${index}.quantity_received`}
                                                    label="Received Qty"
                                                    type="number"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white absolute bottom-0 right-0 border-t w-full flex justify-end items-center px-7 py-4 gap-4 z-50">
                                <CustomButton variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </CustomButton>
                                <CustomButton type="submit" isPending={isPending} disabled={isPending}>
                                    Confirm Receipt
                                </CustomButton>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </Drawer>
    );
};

export default ReceiveOrderDrawer;
