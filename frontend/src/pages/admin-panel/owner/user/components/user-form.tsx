import CustomButton from "@/components/ui/custom/custom-button";
import { Drawer } from "@/components/ui/custom/custom-drawer";
import CustomInput from "@/components/ui/custom/custom-input";
import CustomSelect from "@/components/ui/custom/custom-select";
import { DatePickerComponent } from "@/components/ui/custom/date-picker";
import { getApiErrorMessage } from "@/config/api-error";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useQuery } from "@/hooks/useQuerry";
import { FirmInterface } from "@/interfaces/firm";
import { UserInterface, FirmMembership } from "@/interfaces/user";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik, FieldArray, useFormikContext } from "formik";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";

const FIRM_ROLE_OPTIONS = [
  { label: "Firm Admin", value: "FIRM_ADMIN" },
  { label: "Firm User", value: "FIRM_USER" },
  { label: "Super Seller", value: "SUPERSELLER_USER" },
  { label: "Distributor", value: "DISTRIBUTOR_USER" },
  { label: "Sales Person", value: "SALES_PERSON" },
];

function firmStubFromMembership(f: FirmMembership): FirmInterface {
  return {
    id: f.id,
    name: f.name,
    slug: f.slug,
    code: "",
    is_active: true,
    address: "",
    phone: "",
  };
}

function FirmAssignmentsFields({ allFirms }: { allFirms: FirmInterface[] }) {
  const { values } = useFormikContext<{
    user_type: { label: string; value: string };
    firm_assignments: { firm: FirmInterface | null; role: (typeof FIRM_ROLE_OPTIONS)[0] }[];
  }>();

  if (values.user_type?.value !== "FIRM_USER") return null;

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Firm access</h3>
      </div>
      <p className="text-xs text-gray-500">
        This user can log in and switch only between these firms.
      </p>
      <FieldArray name="firm_assignments">
        {({ push, remove }) => (
          <div className="space-y-3">
            {values.firm_assignments?.map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end bg-white border rounded-md p-3"
              >
                <CustomSelect
                  name={`firm_assignments.${index}.firm`}
                  label="Firm"
                  placeholder="Select firm"
                  options={allFirms.filter(
                    (f) =>
                      String(values.firm_assignments[index]?.firm?.id) ===
                        String(f.id) ||
                      !values.firm_assignments.some(
                        (row, j) =>
                          j !== index &&
                          row.firm &&
                          String(row.firm.id) === String(f.id),
                      ),
                  )}
                  getOptionLabel={(o) => o.name}
                  getOptionValue={(o) => String(o.id)}
                />
                <CustomSelect
                  name={`firm_assignments.${index}.role`}
                  label="Role in firm"
                  options={FIRM_ROLE_OPTIONS}
                  getOptionLabel={(o) => o.label}
                  getOptionValue={(o) => o.value}
                />
                <CustomButton
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => remove(index)}
                  disabled={(values.firm_assignments?.length || 0) <= 1}
                >
                  Remove
                </CustomButton>
              </div>
            ))}
            <CustomButton
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() =>
                push({ firm: null, role: FIRM_ROLE_OPTIONS[1] })
              }
            >
              Add firm
            </CustomButton>
          </div>
        )}
      </FieldArray>
    </div>
  );
}

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

  const { data: allFirms = [] } = useQuery<FirmInterface[]>({
    queryKey: [`/firm/all/`],
    select: (data: any) => data?.data?.data?.rows ?? [],
    enabled: open,
  });

  const genderOptions = [
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
    { label: "Other", value: "OTHER" },
  ];

  const userTypeOptions = [
    { label: "Admin", value: "ADMIN" },
    { label: "Firm User", value: "FIRM_USER" },
  ];

  const defaultFirmRows = useMemo(
    () => [{ firm: null as FirmInterface | null, role: FIRM_ROLE_OPTIONS[1] }],
    [],
  );

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
    firm_assignments: defaultFirmRows,
  });

  useEffect(() => {
    if (!userData) return;
    const list = allFirms || [];
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
      firm_assignments:
        (userData.firms || []).length > 0
          ? (userData.firms || []).map((fm: FirmMembership) => {
              const match = list.find((x) => String(x.id) === String(fm.id));
              return {
                firm: match || firmStubFromMembership(fm),
                role:
                  FIRM_ROLE_OPTIONS.find((r) => r.value === fm.role) ||
                  FIRM_ROLE_OPTIONS[1],
              };
            })
          : defaultFirmRows,
    });
  }, [userData, allFirms, defaultFirmRows]);

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
            const ut = values.user_type?.value || values.user_type;
            const payload: any = {
              full_name: values.full_name,
              email: values.email,
              phone: values.phone,
              gender: values.gender?.value || values.gender,
              user_type: ut,
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
            if (ut === "FIRM_USER") {
              const rows = (values.firm_assignments || []).filter(
                (r: { firm: FirmInterface | null }) => r.firm,
              );
              if (rows.length === 0) {
                toast.error("Add at least one firm for a firm user.");
                return;
              }
              payload.firm_assignments = rows.map(
                (r: { firm: FirmInterface; role: { value: string } | string }) => ({
                  firm_id: r.firm.id,
                  role: typeof r.role === "object" ? r.role.value : r.role,
                }),
              );
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

                <FirmAssignmentsFields allFirms={allFirms} />

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
