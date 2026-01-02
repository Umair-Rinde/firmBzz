
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Formik, Form } from "formik";
import { FormikInput } from "@/components/form/FormikInput";
import * as Yup from "yup";

const ProductSchema = Yup.object().shape({
    productName: Yup.string().required("Product Name is required"),
    sku: Yup.string().required("SKU is required"),
    category: Yup.string().required("Category is required"),
    price: Yup.number().positive("Must be positive").required("Price is required"),
});

export default function CreateVendorProduct() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add Vendor Product</CardTitle>
                    <CardDescription>Add new products to the catalog.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Formik
                        initialValues={{ productName: "", sku: "", category: "", price: "" }}
                        validationSchema={ProductSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            setTimeout(() => { alert("Product Added: " + JSON.stringify(values)); setSubmitting(false); }, 500);
                        }}
                    >
                        {({ isSubmitting, setFieldValue, values }) => (
                            <Form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormikInput name="productName" label="Product Name" placeholder="e.g. Premium Honey" />
                                    <FormikInput name="sku" label="SKU" placeholder="HNY-001" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select onValueChange={(val) => setFieldValue("category", val)} value={values.category}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="food">Food & Beverage</SelectItem>
                                            <SelectItem value="electronics">Electronics</SelectItem>
                                            <SelectItem value="clothing">Clothing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <FormikInput name="price" label="Wholesale Price ($)" type="number" step="0.01" />

                                <Button className="w-full" type="submit" disabled={isSubmitting}>Add Product</Button>
                            </Form>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </div>
    );
}
