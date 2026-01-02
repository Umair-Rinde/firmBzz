
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Formik, Form } from "formik";
import { FormikInput } from "@/components/form/FormikInput";
import * as Yup from "yup";

const FirmSchema = Yup.object().shape({
    firmName: Yup.string().required("Firm Name is required"),
    registrationNumber: Yup.string().required("Registration Number is required"),
    address: Yup.string().required("Address is required"),
    ownerEmail: Yup.string().email("Invalid email").required("Owner Email is required"),
});

export default function CreateFirm() {
    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Firm</CardTitle>
                    <CardDescription>Register a new firm into the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Formik
                        initialValues={{ firmName: "", registrationNumber: "", address: "", ownerEmail: "" }}
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
                                <FormikInput name="firmName" label="Firm Name" placeholder="Enter firm name" />
                                <FormikInput name="registrationNumber" label="Registration Number" placeholder="TAX/REG ID" />
                                <FormikInput name="address" label="Address" placeholder="Firm address" />
                                <FormikInput name="ownerEmail" label="Owner Email" placeholder="owner@firm.com" type="email" />

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Firm"}
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </div>
    );
}
