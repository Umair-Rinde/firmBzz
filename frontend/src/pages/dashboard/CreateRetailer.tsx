
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Formik, Form } from "formik";
import { FormikInput } from "@/components/form/FormikInput";
import * as Yup from "yup";

const RetailerSchema = Yup.object().shape({
    retailerName: Yup.string().required("Retailer Name is required"),
    contactPerson: Yup.string().required("Contact Person is required"),
    email: Yup.string().email().required("Email is required"),
    phone: Yup.string().required("Phone is required"),
});

export default function CreateRetailer() {
    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Onboard Retailer</CardTitle>
                    <CardDescription>Create an account for a new retailer.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Formik
                        initialValues={{ retailerName: "", contactPerson: "", email: "", phone: "" }}
                        validationSchema={RetailerSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            setTimeout(() => { alert("Retailer Created: " + JSON.stringify(values)); setSubmitting(false); }, 500);
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-4">
                                <FormikInput name="retailerName" label="Retailer / Store Name" />
                                <FormikInput name="contactPerson" label="Contact Person" />
                                <FormikInput name="email" label="Email" type="email" />
                                <FormikInput name="phone" label="Phone" type="tel" />
                                <Button className="w-full" type="submit" disabled={isSubmitting}>Create Retailer Account</Button>
                            </Form>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </div>
    );
}
