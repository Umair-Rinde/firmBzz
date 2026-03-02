import { Autocomplete } from "@/components/ui/custom/auto-complete";
import CustomButton from "@/components/ui/custom/custom-button";
import { Drawer } from "@/components/ui/custom/custom-drawer";
import CustomInput from "@/components/ui/custom/custom-input";
import { DatePickerComponent } from "@/components/ui/custom/date-picker";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useQuery } from "@/hooks/useQuerry";
import { UserInterface } from "@/interfaces/user";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";

const UserDrawer = ({
  handleClose,
  id,
  row,
  open,
}: {
  handleClose: () => void;
  id?: string;
  row?: UserInterface;
  open: boolean;
}) => {
  //--------- validation schema -----------//
  const validationSchema = Yup.object().shape({});

  //-------- api call ---------//

  const { data: SingleUserData } = useQuery<UserInterface>({
    queryKey: [`/accounts/${row?.id}/get/`],
    select: (data: any) => data?.data?.data,
    enabled: !!row?.id,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) =>
      row
        ? axios.put(`/accounts/${row?.id}/update/`, data)
        : axios.post("/accounts/create/", data),
    onSuccess(data) {
      toast.success(data?.data?.data?.message || "Successful");
      handleClose();
      queryClient.refetchQueries({
        queryKey: [`/accounts/list/get/`],
      });
    },
    onError: (resp: any) => {
      toast.error(resp?.response?.data?.message || "Something went wrong!");
    },
  });

  //-------- initial values ---------//
  const [initialValues, setInitialValues] = useState<UserInterface>({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    gender: "MALE",
    user_type: "ADMIN",
    date_of_birth: new Date(),
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  useEffect(() => {
    if (SingleUserData) {
      setInitialValues({
        email: SingleUserData?.email || "",
        // password: SingleUserData?.,
        full_name: SingleUserData?.full_name || "",
        phone: SingleUserData?.phone || "",
        gender: SingleUserData?.gender || "MALE",
        user_type: SingleUserData?.user_type || "ADMIN",
        date_of_birth: new Date(SingleUserData?.date_of_birth || new Date()),
        address: SingleUserData?.address || "",
        city: SingleUserData?.city || "",
        state: SingleUserData?.state || "",
        country: SingleUserData?.country || "",
        pincode: SingleUserData?.pincode || "",
      });
    }
  }, [SingleUserData]);

  return (
    <div>
      <Drawer open={open} onOpenChange={handleClose} width="616px">
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
                <div className=" gap-6 py-20 grid grid-cols-2  px-[20px] ">
                  <CustomInput
                    name="full_name"
                    label="Full Name"
                    className="w-full"
                  />
                  <CustomInput name="email" label="email" />
                  {SingleUserData ? null : (
                    <CustomInput name="password" label="password" />
                  )}
                  <CustomInput
                    name="phone"
                    type="number"
                    label="Phone number"
                  />
                  {/* <CustomInput
                    name="date_of_birth"
                    type="date"
                    label="Date of birth"
                  /> */}
                  <DatePickerComponent
                    name="date_of_birth"
                    label="Date of birth"
                  />

                  <CustomInput name="address" label="Address" />
                  <CustomInput name="country" label="country" />
                  <CustomInput name="state" label="state" />
                  <CustomInput name="city" label="city" />
                  <CustomInput name="pincode" label="pincode" />

                  <Autocomplete
                    label="Gender"
                    // value={SingleUserData ? SingleUserData?.gender : "MALE"}
                    className="w-full"
                    getOptionLabel={(option) => option}
                    getOptionValue={(option) => option}
                    options={["MALE", "FEMALE"]}
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

export default UserDrawer;
