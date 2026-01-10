import CustomButton from "@/components/ui/custom/custom-button";
import { Drawer } from "@/components/ui/custom/custom-drawer";
import CustomInput from "@/components/ui/custom/custom-input";
import CustomSelect from "@/components/ui/custom/custom-select";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
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
  //--------- validation schema -----------//
  const validationSchema = Yup.object().shape({});

  //-------- api call ---------//
  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) =>
      id ? axios.put(``, data) : axios.post("", data),
    onSuccess(data) {
      toast.success(data?.data?.data?.message || "Successful");
      handleClose();
      queryClient.refetchQueries({
        queryKey: [``],
      });
    },
    onError: (resp: any) => {
      toast.error(resp?.response?.data?.message || "Something went wrong!");
    },
  });

  //-------- initial values ---------//
  const initialValues = {};

  return (
    <div>
      <Drawer open={open} onOpenChange={handleClose} width="416px">
        <div className=" h-full  overflow-y-auto ">
          <div className="h-[3.75rem] w-full absolute top-0 z-50 border-b px-[20px] bg-white border-[#D0D0D7] text-[18px] font-bold  py-[16px]">
            {row ? "Update Retailer" : "Add Retailer"}
          </div>

          <Formik
            initialValues={initialValues}
            validateOnMount
            onSubmit={(values: any) => {
              const data = {};
              mutate(data);
            }}
            validationSchema={validationSchema}
            enableReinitialize
          >
            {({ errors }) => (
              <Form>
                <div className="flex flex-col gap-6 py-20  px-[20px] flex-wrap">
                  <CustomInput
                    name="retailerName"
                    label="Retailer / Store Name"
                    required
                    className="w-full"
                  />
                  <CustomInput
                    name="contactPerson"
                    label="Contact Person"
                    required
                    className="w-full"
                  />

                  <CustomInput
                    name="email"
                    label="Email"
                    required
                    className="w-full"
                  />
                  <CustomInput
                    name="phone"
                    label="Phone"
                    type="number"
                    required
                    className="w-full"
                  />
                </div>

                <div className=" mx-[28px] bg-white  w-full  flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                  <div className="flex absolute bg-white  bottom-0 right-0 border-t w-full justify-end items-center px-[28px] py-[16px] gap-5">
                    <CustomButton
                      variant="outline"
                      onClick={() => handleClose()}
                    >
                      Cancel
                    </CustomButton>
                    <CustomButton
                      type="submit"
                      isPending={isPending}
                      disabled={isPending}
                    >
                      {id ? "update" : "Add"}
                    </CustomButton>
                  </div>
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
