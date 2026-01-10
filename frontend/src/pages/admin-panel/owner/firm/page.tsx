import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Formik, Form } from "formik";
import { FormikInput } from "@/components/form/FormikInput";
import * as Yup from "yup";
import { Datagrid } from "@/components/ui/custom/datgrid";
import { ColumnDef } from "@tanstack/react-table";
import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import FirmDrawer from "./components/firm-form";

export default function OwnerFirmPage() {
  const columns: ColumnDef<any>[] = [
    {
      header: "Action",
      accessorKey: "Action",
      cell({ row }) {
        return "";
      },
    },
  ];

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div className="mt-[150px]">
      <AppBar title="Firm" subTitle={`Create , Update and Delete Firms`} />
      <Datagrid
        columns={columns}
        title="Firms"
        extraButtons={
          <CustomButton onClick={() => setOpen(true)}>
            Add Firm <FaPlus />
          </CustomButton>
        }
      />
      {open && <FirmDrawer handleClose={handleClose} open={open} />}
      {/* <Card>
        <CardHeader>
          <CardTitle>Create New Firm</CardTitle>
          <CardDescription>
            Register a new firm into the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              firmName: "",
              registrationNumber: "",
              address: "",
              ownerEmail: "",
            }}
            validationSchema={FirmSchema}
            onSubmit={(values, { setSubmitting }) => {
              // Simulate API call
              setTimeout(() => {
                alert(JSON.stringify(values, null, 2));
                setSubmitting(false);
              }, 1000);
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <FormikInput
                  name="firmName"
                  label="Firm Name"
                  placeholder="Enter firm name"
                />
                <FormikInput
                  name="registrationNumber"
                  label="Registration Number"
                  placeholder="TAX/REG ID"
                />
                <FormikInput
                  name="address"
                  label="Address"
                  placeholder="Firm address"
                />
                <FormikInput
                  name="ownerEmail"
                  label="Owner Email"
                  placeholder="owner@firm.com"
                  type="email"
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Firm"}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card> */}
    </div>
  );
}
