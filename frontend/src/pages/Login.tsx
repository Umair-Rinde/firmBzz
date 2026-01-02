
import { useAuth, UserRole } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LockKeyhole } from "lucide-react";
import { Formik, Form } from "formik";
import { FormikInput } from "@/components/form/FormikInput";
import * as Yup from "yup";
import { useState } from "react";

const LoginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function Login() {
    const [role, setRole] = useState<UserRole>("firm_admin");
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/dashboard";

    const quickLogin = (role: UserRole) => {
        login(`${role}@firmbzz.com`, role);
        navigate(from, { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
                            <LockKeyhole className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
                    <CardDescription className="text-center">
                        Login to your FirmBzz account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Formik
                        initialValues={{ email: "" }}
                        validationSchema={LoginSchema}
                        onSubmit={(values) => {
                            login(values.email, role);
                            navigate(from, { replace: true });
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-4">
                                <FormikInput
                                    name="email"
                                    label="Email"
                                    placeholder="name@example.com"
                                    type="email"
                                />

                                <div className="space-y-2">
                                    <Label htmlFor="role">Select Role (Simulated)</Label>
                                    <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="owner">Owner</SelectItem>
                                            <SelectItem value="firm_admin">Firm Admin</SelectItem>
                                            <SelectItem value="super_retailer">Super Retailer</SelectItem>
                                            <SelectItem value="distributor">Distributor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    Sign In
                                </Button>
                            </Form>
                        )}
                    </Formik>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Quick Demo Login
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => quickLogin("owner")}>Owner</Button>
                            <Button variant="outline" size="sm" onClick={() => quickLogin("firm_admin")}>Admin</Button>
                            <Button variant="outline" size="sm" onClick={() => quickLogin("super_retailer")}>Retailer</Button>
                            <Button variant="outline" size="sm" onClick={() => quickLogin("distributor")}>Distributor</Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
                    <p>Dont have an account? <span className="text-primary cursor-pointer hover:underline">Sign up</span></p>
                </CardFooter>
            </Card>
        </div>
    );
}
