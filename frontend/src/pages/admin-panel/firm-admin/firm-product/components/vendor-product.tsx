import CustomButton from "@/components/ui/custom/custom-button";
import { Drawer } from "@/components/ui/custom/custom-drawer";
import CustomInput from "@/components/ui/custom/custom-input";
import CustomSelect from "@/components/ui/custom/custom-select";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useQuery } from "@/hooks/useQuerry";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import * as Yup from "yup";

const VendorProductDrawer = ({
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
  // const validationSchema = Yup.object().shape({});
  const [cookies] = useCookies(["current_role", "firm"]);
  //-------- api call ---------//

  const { data: SingleProductData } = useQuery<any>({
    queryKey: [`/firm/${cookies.firm}/products/${id}/`],
    select: (data: any) => data?.data?.data,
    enabled: !!id,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) =>
      id
        ? axios.put(`firm/${cookies.firm}/products/${id}/`, data)
        : axios.post(`firm/${cookies.firm}/products/`, data),
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

  const [initialValues, setInitialValues] = useState({
    name: "",
    description: "",
    hsn_code: "",
    category: "",
  });

  useEffect(() => {
    if (SingleProductData) {
      setInitialValues({
        name: SingleProductData?.name || "",
        description: SingleProductData?.description || "",
        hsn_code: SingleProductData?.hsn_code || "",
        category: SingleProductData?.category || "",
      });
    }
  }, [SingleProductData]);

  //-------- initial values ---------//

  return (
    <div>
      <Drawer open={open} onOpenChange={handleClose} width="416px">
        <div className=" h-full  overflow-y-auto ">
          <div className="h-[3.75rem] w-full absolute top-0 z-50 border-b px-[20px] bg-white border-[#D0D0D7] text-[18px] font-bold  py-[16px]">
            {row ? "Update Product" : "Add Product"}
          </div>

          <Formik
            initialValues={initialValues}
            validateOnMount
            onSubmit={(values: any) => {
              mutate(values);
            }}
            // validationSchema={validationSchema}
            enableReinitialize
          >
            {({ errors }) => (
              <Form>
                <div className="flex flex-col gap-6 py-20  px-[20px] flex-wrap">
                  <CustomInput
                    name="name"
                    label="Product Name"
                    required
                    className="w-full"
                  />
                  <CustomInput
                    name="description"
                    label="description"
                    required
                    className="w-full"
                  />
                  <CustomInput
                    name="category"
                    label="category"
                    required
                    className="w-full"
                  />

                  {/* <CustomSelect
                    options={[
                      { name: "Food & Beverage", id: "1" },
                      { name: "Electronics", id: "2" },
                      { name: "Clothing", id: "4" },
                    ]}
                    getOptionLabel={(item: any) => item?.name}
                    getOptionValue={(item: any) => item?.id}
                    name="category"
                    label="Category"
                    className="w-full"
                    required
                  /> */}

                  <CustomInput
                    name="hsn_code"
                    label="HSN code"
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

export default VendorProductDrawer;
