import CustomButton from "@/components/ui/custom/custom-button";
import { Drawer } from "@/components/ui/custom/custom-drawer";
import CustomInput from "@/components/ui/custom/custom-input";
import CustomSelect from "@/components/ui/custom/custom-select";
import { DatePickerComponent } from "@/components/ui/custom/date-picker";
import { getApiErrorMessage } from "@/config/api-error";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useQuery } from "@/hooks/useQuerry";
import { UserInterface, FirmMembership } from "@/interfaces/user";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";

const ROLE_COLORS: Record<string, string> = {
  FIRM_ADMIN: "bg-blue-100 text-blue-800",
  FIRM_USER: "bg-gray-100 text-gray-800",
  SUPERSELLER_USER: "bg-purple-100 text-purple-800",
  DISTRIBUTOR_USER: "bg-amber-100 text-amber-800",
  SALES_PERSON: "bg-teal-100 text-teal-800",
};

const ROLE_LABELS: Record<string, string> = {
  FIRM_ADMIN: "Firm Admin",
  FIRM_USER: "Firm User",
  SUPERSELLER_USER: "Super Seller",
  DISTRIBUTOR_USER: "Distributor",
  SALES_PERSON: "Sales Person",
};

const UserDrawer = ({
  handleClose,
  row,
  open,
}: {
  handleClose: () => void;
  id?: string;
  row?: UserInterface | null;
  open: boolean;
}) => {
  const isEdit = !!row?.id;

  const validationSchema = Yup.object().shape({
    full_name: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    password: isEdit
      ? Yup.string().min(6, "Min 6 characters")
      : Yup.string().required("Password is required").min(6, "Min 6 characters"),
  });

  const { data: singleUserData } = useQuery<UserInterface>({
    queryKey: [`/accounts/${row?.id}/get/`],
    select: (data: any) => data?.data?.data,
    enabled: isEdit,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) =>
      isEdit
        ? axios.put(`/accounts/${row?.id}/update/`, data)
        : axios.post("/accounts/create/", data),
    onSuccess() {
      toast.success(isEdit ? "User updated successfully" : "User created successfully");
      handleClose();
      queryClient.refetchQueries({ queryKey: ["/accounts/list/get/"] });
    },
    onError: (resp: unknown) => {
      toast.error(getApiErrorMessage(resp, "Something went wrong!"));
    },
  });

  const userData = isEdit ? singleUserData : null;
  const firms: FirmMembership[] = userData?.firms || row?.firms || [];

  const genderOptions = [
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
    { label: "Other", value: "OTHER" },
  ];

  const userTypeOptions = [
    { label: "Admin", value: "ADMIN" },
    { label: "Firm User", value: "FIRM_USER" },
  ];

  const [initialValues, setInitialValues] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    gender: genderOptions[0],
    user_type: userTypeOptions[1],
    date_of_birth: null as Date | null,
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  useEffect(() => {
    if (userData) {
      setInitialValues({
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        password: "",
        gender:
          genderOptions.find((g) => g.value === userData.gender) ||
          genderOptions[0],
        user_type:
          userTypeOptions.find((t) => t.value === userData.user_type) ||
          userTypeOptions[1],
        date_of_birth: userData.date_of_birth
          ? new Date(userData.date_of_birth)
          : null,
        address: userData.address || "",
        city: userData.city || "",
        state: userData.state || "",
        country: userData.country || "",
        pincode: userData.pincode || "",
      });
    }
  }, [userData]);

  return (
    <Drawer open={open} onOpenChange={handleClose} width="616px">
      <div className="h-full flex flex-col pt-14">
        <div className="h-[3.75rem] w-full absolute top-0 z-50 border-b px-5 bg-white border-[#D0D0D7] text-[18px] font-bold py-4">
          {isEdit ? "Update User" : "Add User"}
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={(values: any) => {
            const payload: any = {
              full_name: values.full_name,
              email: values.email,
              phone: values.phone,
              gender: values.gender?.value || values.gender,
              user_type: values.user_type?.value || values.user_type,
              address: values.address,
              city: values.city,
              state: values.state,
              country: values.country,
              pincode: values.pincode,
            };
            if (values.date_of_birth) {
              payload.date_of_birth =
                values.date_of_birth instanceof Date
                  ? values.date_of_birth.toISOString()
                  : values.date_of_birth;
            }
            if (values.password) {
              payload.password = values.password;
            }
            mutate(payload);
          }}
        >
          {() => (
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
                    disabled={isEdit}
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
                    label={isEdit ? "New Password (optional)" : "Password"}
                    type="password"
                    required={!isEdit}
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
                  />
                  <CustomSelect
                    name="user_type"
                    label="User Type"
                    options={userTypeOptions}
                    getOptionLabel={(o) => o.label}
                    getOptionValue={(o) => o.value}
                  />
                </div>

                <DatePickerComponent
                  name="date_of_birth"
                  label="Date of Birth"
                />

                <CustomInput
                  name="address"
                  label="Address"
                  placeholder="Enter address"
                />

                <div className="grid grid-cols-2 gap-4">
                  <CustomInput
                    name="city"
                    label="City"
                    placeholder="Enter city"
                  />
                  <CustomInput
                    name="state"
                    label="State"
                    placeholder="Enter state"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <CustomInput
                    name="country"
                    label="Country"
                    placeholder="Enter country"
                  />
                  <CustomInput
                    name="pincode"
                    label="Pincode"
                    placeholder="Enter pincode"
                  />
                </div>

                {isEdit && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Firm Memberships
                    </h3>
                    {firms.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">
                        This user is not assigned to any firm. Add them from a
                        firm's User Management page.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {firms.map((f) => (
                          <div
                            key={f.id}
                            className="flex items-center justify-between bg-white border rounded-md px-3 py-2"
                          >
                            <span className="text-sm font-medium text-gray-800">
                              {f.name}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                ROLE_COLORS[f.role] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {ROLE_LABELS[f.role] || f.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      To change firm roles, go to the firm's User Management page.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white absolute bottom-0 right-0 border-t w-full flex justify-end items-center px-7 py-4 gap-4 z-50">
                <CustomButton variant="outline" onClick={() => handleClose()}>
                  Cancel
                </CustomButton>
                <CustomButton
                  type="submit"
                  isPending={isPending}
                  disabled={isPending}
                >
                  {isEdit ? "Update User" : "Add User"}
                </CustomButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Drawer>
  );
};

export default UserDrawer;
