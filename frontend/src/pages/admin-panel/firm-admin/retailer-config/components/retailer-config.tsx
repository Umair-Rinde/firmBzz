import CustomButton from "@/components/ui/custom/custom-button";
import { Drawer } from "@/components/ui/custom/custom-drawer";
import CustomInput from "@/components/ui/custom/custom-input";
import CustomSelect from "@/components/ui/custom/custom-select";
import { DatePickerComponent as CustomDatePicker } from "@/components/ui/custom/date-picker";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import * as Yup from "yup";

const RetailerConfigDrawer = ({
  handleClose,
  id,
  row,
  open,
}: {
  handleClose: () => void;
  id?: string;
  row?: any;
  open: boolean;
}) => {
  const { firmId } = useParams();

  //--------- validation schema -----------//
  const validationSchema = Yup.object().shape({
    business_name: Yup.string().required("Business name is required"),
    owner_name: Yup.string().required("Owner name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    whatsapp_number: Yup.string().required("WhatsApp number is required"),
    contact_number: Yup.string().required("Contact number is required"),
    customer_type: Yup.object().required("Customer type is required"),
    business_address: Yup.string().required("Business address is required"),
  });

  //-------- api call ---------//
  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) =>
      id
        ? axios.put(`/firm/${firmId}/customers/${id}/`, data)
        : axios.post(`/firm/${firmId}/customers/`, data),
    onSuccess(data) {
      toast.success(
        id ? "Retailer updated successfully" : "Retailer added successfully"
      );
      handleClose();
      queryClient.invalidateQueries({
        queryKey: [`firm/${firmId}/customers/`],
      });
    },
    onError: (resp: any) => {
      toast.error(resp?.response?.data?.message || "Something went wrong!");
    },
  });

  //-------- initial values ---------//
  const customerTypes = [
    { label: "Super Seller Retailer", value: "SUPER_SELLER" },
    { label: "Distribution Retailer", value: "DISTRIBUTOR" },
  ];

  const activeOptions = [
    { label: "Active", value: true },
    { label: "Inactive", value: false },
  ];

  const initialValues = {
    business_name: row?.business_name || "",
    owner_name: row?.owner_name || "",
    email: row?.email || "",
    whatsapp_number: row?.whatsapp_number || "",
    contact_number: row?.contact_number || "",
    customer_type: row?.customer_type
      ? customerTypes.find((t) => t.value === row.customer_type)
      : customerTypes[0],
    fssai_number: row?.fssai_number || "",
    gst_number: row?.gst_number || "",
    fssai_expiry: row?.fssai_expiry || null,
    gst_expiry: row?.gst_expiry || null,
    business_address: row?.business_address || "",
    is_active: row?.is_active !== undefined
      ? activeOptions.find((a) => a.value === row.is_active)
      : activeOptions[0],
  };

  return (
    <div>
      <Drawer open={open} onOpenChange={handleClose} width="600px">
        <div className="h-full overflow-y-auto">
          <div className="h-[3.75rem] w-full absolute top-0 z-50 border-b px-[20px] bg-white border-[#D0D0D7] text-[18px] font-bold py-[16px]">
            {row ? "Update Retailer" : "Add Retailer"}
          </div>

          <Formik
            initialValues={initialValues}
            validateOnMount
            onSubmit={(values: any) => {
              const data = {
                ...values,
                customer_type: values.customer_type.value,
                is_active: values.is_active.value,
              };
              mutate(data);
            }}
            validationSchema={validationSchema}
            enableReinitialize
          >
            {({ errors, values }) => (
              <Form>
                <div className="flex flex-col gap-6 py-20 px-[20px] mb-16">
                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput
                      name="business_name"
                      label="Business Name"
                      required
                      className="w-full"
                    />
                    <CustomInput
                      name="owner_name"
                      label="Owner Name"
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput
                      name="email"
                      label="Email"
                      required
                      className="w-full"
                    />
                    <CustomSelect
                      name="customer_type"
                      label="Customer Type"
                      options={customerTypes}
                      getOptionLabel={(option) => option.label}
                      getOptionValue={(option) => option.value}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput
                      name="whatsapp_number"
                      label="WhatsApp Number"
                      required
                      className="w-full"
                    />
                    <CustomInput
                      name="contact_number"
                      label="Contact Number"
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput
                      name="fssai_number"
                      label="FSSAI Number"
                      className="w-full"
                    />
                    <CustomDatePicker
                      name="fssai_expiry"
                      label="FSSAI Expiry"
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput
                      name="gst_number"
                      label="GST Number"
                      className="w-full"
                    />
                    <CustomDatePicker
                      name="gst_expiry"
                      label="GST Expiry"
                      className="w-full"
                    />
                  </div>

                  <CustomInput
                    name="business_address"
                    label="Business Address"
                    required
                    className="w-full"
                  />

                  <CustomSelect
                    name="is_active"
                    label="Status"
                    options={activeOptions}
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.value}
                    required
                    className="w-full"
                  />
                </div>

                <div className="bg-white absolute bottom-0 right-0 border-t w-full flex justify-end items-center px-[28px] py-[16px] gap-5 z-50">
                  <CustomButton variant="outline" onClick={() => handleClose()}>
                    Cancel
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    isPending={isPending}
                    disabled={isPending}
                  >
                    {id ? "Update" : "Add"}
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

export default RetailerConfigDrawer;
