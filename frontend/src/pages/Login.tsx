import { useAuth, UserRole, mapBackendRoleToFrontend } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LockKeyhole } from "lucide-react";
import { Formik, Form } from "formik";
import { FormikInput } from "@/components/form/FormikInput";
import * as Yup from "yup";
import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/config/api-error";
import { axios } from "@/config/axios";
import { toast } from "sonner";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

/** Top-level /dashboard/:id segments that are routes, not firm slugs. */
const DASHBOARD_NON_FIRM_SEGMENTS = new Set([
  "create-firm",
  "user-management",
  "orders",
  "distribution",
]);

/**
 * Only reuse `from` after login if it still matches this session's firm.
 * Otherwise we send users to the old firm's URL from ProtectedRoute state.
 */
function isSafeDashboardReturnPath(
  fromPath: string | undefined,
  sessionFirmSlug: string | undefined,
): boolean {
  if (!fromPath || !fromPath.startsWith("/dashboard")) return false;
  const trimmed = fromPath.replace(/\/+$/, "");
  if (trimmed === "/dashboard") return true;
  const withoutPrefix = trimmed.slice("/dashboard".length).replace(/^\//, "");
  if (!withoutPrefix) return true;
  const firstSegment = withoutPrefix.split("/")[0];
  if (DASHBOARD_NON_FIRM_SEGMENTS.has(firstSegment)) return true;
  if (!sessionFirmSlug) return true;
  return firstSegment === sessionFirmSlug;
}

export default function Login() {
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [pendingCreds, setPendingCreds] = useState<{ email: string; password: string } | null>(null);
  const lastSubmittedCreds = useRef<{ email: string; password: string } | null>(null);
  const [selectedFirmId, setSelectedFirmId] = useState<string>("");
  const [availableFirms, setAvailableFirms] = useState<Array<{ id: string; name: string; slug: string; role: string }>>([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const navigateToRoute = async () => {
        const from = (location.state as any)?.from?.pathname;
        if (from && isSafeDashboardReturnPath(from, user.firm_slug ?? undefined)) {
          navigate(from, { replace: true });
        } else {
          const route = await getRoleBasedRoute(user.role, user.firm_slug);
          navigate(route, { replace: true });
        }
      };
      navigateToRoute();
    }
  }, [isAuthenticated, user, navigate, location]);

  // Get route based on user role
  const getRoleBasedRoute = async (
    role: UserRole,
    firmSlug?: string,
  ): Promise<string> => {
    switch (role) {
      case "admin":
        return "/dashboard/create-firm";
      case "firm_admin":
        if (firmSlug) {
          return `/dashboard/${firmSlug}`;
        }
        return "/dashboard";
      case "super_retailer":
        if (firmSlug) {
          return `/dashboard/${firmSlug}`;
        }
        return "/dashboard/orders";
      case "distributor":
        if (firmSlug) {
          return `/dashboard/${firmSlug}`;
        }
        return "/dashboard/distribution";
      case "sales_person":
        if (firmSlug) {
          return `/dashboard/${firmSlug}/retailer-orders`;
        }
        return "/dashboard";
      default:
        return "/dashboard";
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => axios.post(`/accounts/login/`, data),
    onSuccess: (resp: any) => {
      const data = resp?.data?.data;
      const token = resp?.data?.token;
      const userData = resp?.data?.data;

      if (!data || !userData) {
        toast.error("Invalid response from server");
        return;
      }

      if (userData?.requires_firm_selection) {
        setAvailableFirms(userData?.firms || []);
        const c = lastSubmittedCreds.current;
        setPendingCreds({
          email: userData?.email || c?.email || "",
          password: c?.password || "",
        });
        toast.info("Select a firm to continue");
        return;
      }

      if (!token) {
        toast.error("Login token missing");
        return;
      }

      login(userData, token);

      toast.success(resp?.data?.message || "Login Successful");

      const from = (location.state as any)?.from?.pathname;
      const userRole = mapBackendRoleToFrontend(
        userData.user_type,
        userData.firm?.role,
      );
      const firmSlug = userData.firm?.slug;

      if (from && isSafeDashboardReturnPath(from, firmSlug)) {
        navigate(from, { replace: true });
      } else {
        getRoleBasedRoute(userRole, firmSlug).then((route) => {
          navigate(route, { replace: true });
        });
      }
    },
    onError: (resp: unknown) => {
      const message = getApiErrorMessage(resp, "Something went wrong!");
      console.error("[Login] request failed", resp);
      toast.error(message);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
              <LockKeyhole className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center">
            Login to your FirmBzz account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingCreds ? (
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={(values) => {
                lastSubmittedCreds.current = values;
                mutate(values);
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
                  <FormikInput
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isPending || isSubmitting}
                  >
                    {isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </Form>
              )}
            </Formik>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Firm</Label>
                <Select value={selectedFirmId} onValueChange={(val) => setSelectedFirmId(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a firm" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFirms.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  className="w-full"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    setPendingCreds(null);
                    lastSubmittedCreds.current = null;
                    setSelectedFirmId("");
                    setAvailableFirms([]);
                  }}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="w-full"
                  disabled={isPending || !selectedFirmId}
                  onClick={() => {
                    if (!pendingCreds) return;
                    mutate({ ...pendingCreds, firm_id: selectedFirmId });
                  }}
                >
                  {isPending ? "Logging in..." : "Continue"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <p>
            Dont have an account?{" "}
            <span className="text-primary cursor-pointer hover:underline">
              Sign up
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
