import CustomButton from "@/components/ui/custom/custom-button";
import { Drawer } from "@/components/ui/custom/custom-drawer";
import CustomInput from "@/components/ui/custom/custom-input";
import { getApiErrorMessage } from "@/config/api-error";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useQuery } from "@/hooks/useQuerry";
import { FirmInterface } from "@/interfaces/firm";
import { UserInterface } from "@/interfaces/user";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";

const FirmDrawer = ({
  handleClose,
  id,
  row,
  open,
}: {
  handleClose: () => void;
  id?: string;
  row?: FirmInterface;
  open: boolean;
}) => {
  //--------- validation schema -----------//
  const validationSchema = Yup.object().shape({});

  //-------- api call ---------//

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) =>
      row
        ? axios.put(`/firm/${row?.slug}/`, data)
        : axios.post("/firm/setup/", data),
    onSuccess(data) {
      toast.success(data?.data?.data?.message || "Successful");
      handleClose();
      queryClient.invalidateQueries({ queryKey: ["/firm/all/"] });
    },
    onError: (resp: unknown) => {
      toast.error(getApiErrorMessage(resp, "Something went wrong!"));
    },
  });

  //-------- initial values ---------//
  const initialValues = {
    name: row?.name || "",
    legal_name: row?.legal_name || "",
    slug: row?.slug || "",
    address: row?.address || "",
    code: row?.code || "",
    phone: row?.phone || "",
    email: row?.email || "",
    gstin: row?.gstin || "",
    fssai_number: row?.fssai_number || "",
    state: row?.state || "",
    state_code: row?.state_code || "",
  };

  return (
    <div>
      <Drawer open={open} onOpenChange={handleClose} width="416px">
        <div className=" h-full  overflow-y-auto ">
          <div className="h-[3.75rem] w-full absolute top-0 z-50 border-b px-[20px] bg-white border-[#D0D0D7] text-[18px] font-bold  py-[16px]">
            {row ? "Update Firm" : "Add Firm"}
          </div>

          <Formik
            initialValues={initialValues}
            validateOnMount
            onSubmit={(values: any) => {
              mutate(values);
            }}
            validationSchema={validationSchema}
            enableReinitialize
          >
            {({ errors }) => (
              <Form>
                <div className=" gap-6 py-20 grid grid-cols-1  px-[20px] ">
                  <CustomInput name="name" label="Name" className="w-full" />
                  <CustomInput name="legal_name" label="Legal Name (for invoice)" />
                  <CustomInput name="slug" label="Slug" />
                  <CustomInput name="address" label="Address" />
                  <CustomInput name="code" label="Code" />
                  <CustomInput
                    name="phone"
                    type="text"
                    label="Phone number"
                  />
                  <CustomInput name="email" type="email" label="Email" />
                  <CustomInput name="gstin" label="GSTIN" />
                  <CustomInput name="fssai_number" label="FSSAI Number" />
                  <CustomInput name="state" label="State" />
                  <CustomInput name="state_code" label="State Code" />
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
                      {row ? "update" : "Add"}
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

export default FirmDrawer;
