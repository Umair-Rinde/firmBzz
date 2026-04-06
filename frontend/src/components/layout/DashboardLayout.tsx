import { useAuth, mapBackendRoleToFrontend } from "@/context/AuthContext";
import { axios } from "@/config/axios";
import { getApiErrorMessage } from "@/config/api-error";
import { toast } from "sonner";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  ShoppingCart,
  Truck,
  LogOut,
  Menu,
  CloudCog,
  ClipboardList,
  Warehouse,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFirmSlug } from "@/hooks/useFirmSlug";
import { BreadcrumbBar } from "../ui/custom/breadcrum-bar";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdSwitch } from "react-icons/io";
import { Separator } from "../ui/separator";
import { TbLogout } from "react-icons/tb";
import { CustomDialog } from "../ui/custom/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import CustomButton from "../ui/custom/custom-button";
import { FirmInterface } from "@/interfaces/firm";
import { useQuery } from "@/hooks/useQuerry";
import CustomSelect from "../ui/custom/custom-select";
import { Form, Formik } from "formik";

export default function DashboardLayout() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies([
    "current_role",
    "firm",
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openFirmSwitchDialog, setOpenFirmSwitchDialog] = useState(false);
  const [switchFirmId, setSwitchFirmId] = useState("");
  const [firmSwitchPending, setFirmSwitchPending] = useState(false);
  const activeFirm = useFirmSlug();
  const [selectedRole, setSelectedRole] = useState(
    cookies.current_role || user?.role || "admin",
  );

  useEffect(() => {
    setSelectedRole(cookies.current_role);
  }, []);

  // Keep the firm cookie in sync: if a non-admin user has a firm slug
  // from auth context but the cookie is missing, set it so every page
  // that reads cookies.firm picks it up.
  useEffect(() => {
    if (activeFirm && !cookies.firm) {
      setCookie("firm", activeFirm, { path: "/" });
    }
  }, [activeFirm, cookies.firm, setCookie]);

  const handleLogout = () => {
    removeCookie("firm");
    removeCookie("current_role");
    logout();
    navigate("/");
  };

  const menuItems = [
    {
      title: "Overview",
      icon: LayoutDashboard,
      href: "/dashboard",
      roles: ["admin", "firm_admin", "super_retailer", "distributor"],
    },
    {
      title: "Create Firm",
      icon: Building2,
      href: "/dashboard/create-firm",
      roles: ["admin"],
    },
    {
      title: "User Management",
      icon: Building2,
      href: "/dashboard/user-management",
      roles: ["admin"],
    },
    {
      title: "Firm Products",
      icon: Package,
      href: `/dashboard/${activeFirm}/create-vendor-product`,
      roles: ["firm_admin"],
      requiresFirm: true,
    },
    {
      title: "Retailers",
      icon: Users,
      href: `/dashboard/${activeFirm}/create-retailer`,
      roles: ["firm_admin"],
      requiresFirm: true,
    },
    {
      title: "Vendors",
      icon: Users,
      href: `/dashboard/${activeFirm}/vendors`,
      roles: ["firm_admin"],
      requiresFirm: true,
    },
    {
      title: "Vendor Orders",
      icon: Users,
      href: `/dashboard/${activeFirm}/vendor-orders`,
      roles: ["firm_admin"],
      requiresFirm: true,
    },
    {
      title: "Retailer orders",
      icon: ClipboardList,
      href: `/dashboard/${activeFirm}/retailer-orders`,
      roles: ["firm_admin"],
      requiresFirm: true,
    },
    {
      title: "Invoices",
      icon: ShoppingCart,
      href: `/dashboard/${activeFirm}/invoices`,
      roles: ["firm_admin"],
      requiresFirm: true,
    },
    {
      title: "Stock manager",
      icon: Warehouse,
      href: `/dashboard/${activeFirm}/stock-manager`,
      roles: ["firm_admin"],
      requiresFirm: true,
    },
    {
      title: "User Management",
      icon: Users,
      href: `/dashboard/${activeFirm}/user-management`,
      roles: ["firm_admin"],
      requiresFirm: true,
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      href: "/dashboard/orders",
      roles: ["super_retailer"],
    },
    {
      title: "Distributions",
      icon: Truck,
      href: "/dashboard/distribution",
      roles: ["distributor"],
    },
  ];

  const activeRole = cookies.current_role || user?.role;

  const filteredMenu = menuItems.filter(
    (item) =>
      item.roles.includes(activeRole || "") &&
      (!item.requiresFirm || !!activeFirm)
  );
  const { data: FirmData } = useQuery<FirmInterface[]>({
    queryKey: [`/firm/all/`],
    select: (data: any) => data?.data?.data?.rows,
    enabled: true,
  });

  const handleSwitchRole = ({ role, firm }) => {
    setCookie("current_role", role, { path: "/" });
    setCookie("firm", firm);
    if (selectedRole === "admin") navigate("/dashboard");
    else navigate(location.pathname);
    setOpenRoleDialog(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white border-r border-slate-500">
      <div className="flex items-center justify-between  p-6 border-b border-slate-500">
        <div className="flex items-center gap-3 ">
          <Avatar className="!h-[3rem] !w-[3rem]">
            <AvatarFallback className="bg-[#2B952B] text-white !text-[0.875rem] font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-start flex-col">
            <p className="text-[1rem] text-white font-semibold">
              {user?.name}
            </p>
            <p className="text-[0.75rem] text-white font-normal capitalize">
              {user?.role}
            </p>
          </div>
        </div>

        <div className="text-white">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger className="flex items-center gap-3">
              <BsThreeDotsVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-5">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-2 items-center">
                  {user?.role === "admin" && (
                    <>
                      <div
                        className="flex items-center justify-between cursor-pointer gap-3 hover:text-[#2B952B] !w-full"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setOpenRoleDialog(true);
                        }}
                      >
                        <span>Switch Role</span>
                        <IoMdSwitch className="size-5" />
                      </div>
                      <Separator />
                    </>
                  )}
                  {user?.role !== "admin" &&
                    user?.firms &&
                    user.firms.length > 1 && (
                    <>
                      <div
                        className="flex items-center justify-between cursor-pointer gap-3 hover:text-[#2B952B] !w-full"
                        onClick={() => {
                          setSwitchFirmId(
                            String(
                              user.firm_id ||
                                user.firms[0]?.id ||
                                "",
                            ),
                          );
                          setIsDropdownOpen(false);
                          setOpenFirmSwitchDialog(true);
                        }}
                      >
                        <span>Switch firm</span>
                        <IoMdSwitch className="size-5" />
                      </div>
                      <Separator />
                    </>
                  )}
                  <div
                    className="flex items-center justify-between cursor-pointer gap-3 hover:text-red-500 !w-full"
                    onClick={handleLogout}
                  >
                    <span>Log Out</span>
                    <TbLogout className="size-5" />
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {openRoleDialog && (
        <CustomDialog
          open={openRoleDialog}
          onOpenChange={setOpenRoleDialog}
          title="Switch Profile"
        >
          <Formik
            initialValues={{
              role: cookies.current_role ? cookies.current_role : "admin",
              firm: activeFirm ? activeFirm : null,
            }}
            // validationSchema={validationSchema}
            onSubmit={(values) => {
              console.log(values, "<----- values");
              handleSwitchRole(values);
            }}
          >
            {({ values, setFieldValue, errors, touched }) => (
              <Form>
                <div className="flex flex-col gap-4">
                  {user?.role === "admin" ? (
                    <>
                      <Label className="text-[14px] text-[#2B952B] mb-2 font-medium">
                        Switch Profile Type
                      </Label>

                      <div className="flex pb-4 gap-6">
                        {["admin", "firm_admin"].map((role) => (
                          <label
                            key={role}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="role"
                              value={role}
                              checked={values.role === role}
                              onChange={() => {
                                setFieldValue("role", role);
                                if (role !== "firm_admin") {
                                  setFieldValue("firm", null);
                                }
                              }}
                            />
                            <span className="capitalize">{role}</span>
                          </label>
                        ))}
                      </div>

                      {values.role === "firm_admin" && (
                        <div className="flex flex-col gap-2 pb-4">
                          <CustomSelect
                            label="Select Firm"
                            options={FirmData || []}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.slug}
                            value={
                              FirmData?.find((f) => f.slug === values.firm) ||
                              null
                            }
                            onChange={(firm) =>
                              setFieldValue("firm", firm?.slug)
                            }
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="pb-4 px-4">
                      Are you sure you want to log out?
                    </div>
                  )}

                  <div className="flex border-t-2 py-3 gap-4 justify-end">
                    <CustomButton
                      type="button"
                      onClick={() => setOpenRoleDialog(false)}
                      variant="outline"
                      className="border-gray-300"
                    >
                      Cancel
                    </CustomButton>

                    {user?.role === "admin" && (
                      <CustomButton
                        type="submit"
                        variant="default"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={values.role === "firm_admin" && !values.firm}
                      >
                        Switch Role
                      </CustomButton>
                    )}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </CustomDialog>
      )}

      {openFirmSwitchDialog && user?.firms && user.firms.length > 1 && (
        <CustomDialog
          open={openFirmSwitchDialog}
          onOpenChange={setOpenFirmSwitchDialog}
          title="Switch firm"
        >
          <div className="flex flex-col gap-4 text-left">
            <Label className="text-sm font-medium">Active firm</Label>
            <Select value={switchFirmId} onValueChange={setSwitchFirmId}>
              <SelectTrigger>
                <SelectValue placeholder="Select firm" />
              </SelectTrigger>
              <SelectContent>
                {user.firms.map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex border-t pt-3 gap-2 justify-end">
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => setOpenFirmSwitchDialog(false)}
              >
                Cancel
              </CustomButton>
              <CustomButton
                type="button"
                disabled={!switchFirmId || firmSwitchPending}
                onClick={async () => {
                  setFirmSwitchPending(true);
                  try {
                    const resp = await axios.post(`/accounts/switch-firm/`, {
                      firm_id: switchFirmId,
                    });
                    const d = resp?.data?.data;
                    const token = resp?.data?.token;
                    if (!d || !token) {
                      toast.error("Invalid response from server");
                      return;
                    }
                    login(d, token);
                    const slug = d.firm?.slug;
                    const role = mapBackendRoleToFrontend(
                      d.user_type,
                      d.firm?.role,
                    );
                    setCookie("current_role", role, { path: "/" });
                    if (slug) setCookie("firm", slug, { path: "/" });
                    toast.success(resp?.data?.message || "Firm switched");
                    setOpenFirmSwitchDialog(false);
                    if (role === "distributor" && !slug) {
                      navigate("/dashboard/distribution");
                    } else if (role === "super_retailer" && !slug) {
                      navigate("/dashboard/orders");
                    } else if (slug) {
                      navigate(`/dashboard/${slug}`);
                    } else {
                      navigate("/dashboard");
                    }
                  } catch (e) {
                    toast.error(getApiErrorMessage(e, "Could not switch firm"));
                  } finally {
                    setFirmSwitchPending(false);
                  }
                }}
              >
                {firmSwitchPending ? "Switching…" : "Switch"}
              </CustomButton>
            </div>
          </div>
        </CustomDialog>
      )}

      <nav className="flex-1 px-4 space-y-2  mt-5 ">
        {filteredMenu.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? "bg-primary text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {!isMobile && (
        <div className="w-80 fixed inset-y-0 z-30">
          <SidebarContent />
        </div>
      )}

      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-slate-900 z-40 flex items-center px-4 justify-between">
          <h1 className="text-xl font-bold text-white">FirmBzz</h1>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-slate-900">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      )}

      <div
        className={`
          flex-1 min-w-0 transition-all
          ${isMobile ? "ml-0 mt-16" : "ml-80"}
        `}
      >
        <BreadcrumbBar className={`${isMobile ? "hidden" : "ml-80"}`} />

        <div
          className={`
          min-w-0 flex-1
          ${isMobile ? "pt-4" : "pt-[3.75rem]"}
          px-4 py-4 sm:px-5 sm:py-5 md:px-7 md:py-6
        `}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
