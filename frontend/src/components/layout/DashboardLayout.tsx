import { useAuth } from "@/context/AuthContext";
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
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
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
import CustomButton from "../ui/custom/custom-button";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
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
      href: "/dashboard/create-vendor-product",
      roles: ["firm_admin", "admin"],
    },
    {
      title: "Retailers",
      icon: Users,
      href: "/dashboard/create-retailer",
      roles: ["firm_admin", "admin"],
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

  const filteredMenu = menuItems;
  // const filteredMenu = menuItems.filter((item) =>
  //   item.roles.includes(user?.role || ""),
  // );
  const [cookies, setCookie, removeCookie] = useCookies(["current_role"]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [selectedFirm, setSelectedFirm] = useState<string>("");

  const [selectedRole, setSelectedRole] = useState(
    cookies.current_role || user?.role || "admin",
  );
  const handleSwitchRole = () => {
    setCookie("current_role", selectedRole, { path: "/" });
    if (selectedRole === "admin") navigate("/client-configuration");
    else if (selectedRole === "assessor") navigate("/assessments");
    else navigate(location.pathname);
    setOpenRoleDialog(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white border-r border-slate-500">
      {/* <div className="p-6 border-b border-slate-500 ">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          FirmBzz
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
          {user?.role.replace("_", " ")} Portal
        </p>
      </div> */}
      <div className="flex items-center justify-between  p-6 border-b border-slate-500">
        <div className="flex items-center gap-3 ">
          <Avatar className="!h-[3rem] !w-[3rem]">
            <AvatarFallback className="bg-[#2B952B] text-white !text-[0.875rem] font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {open && (
            <div>
              <p className="text-[1rem] text-white font-semibold">
                {user?.name}
              </p>
              <p className="text-[0.75rem] text-white font-normal capitalize">
                {user?.role}
              </p>
            </div>
          )}
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
                          // setTimeout(() => setOpenRoleDialog(true), 100);
                        }}
                      >
                        <span>Switch Role</span>
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
          <div className="flex flex-col gap-4">
            {user?.role === "admin" ? (
              <>
                <Label className="text-[14px] text-[#2B952B] mb-2 font-medium">
                  Switch Profile Type
                </Label>

                <div className="flex pb-4 gap-6">
                  {["admin", "firm admin"].map((role) => (
                    <label
                      key={role}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="switch-role"
                        value={role}
                        checked={selectedRole === role}
                        onChange={() => {
                          setSelectedRole(role);
                          if (role !== "firm admin") {
                            setSelectedFirm("");
                          }
                        }}
                      />
                      <span className="capitalize">{role}</span>
                    </label>
                  ))}
                </div>

                {selectedRole === "firm admin" && (
                  <div className="flex flex-col gap-2 pb-4">
                    <Label className="text-sm font-medium">Select Firm</Label>

                    <select
                      value={selectedFirm}
                      onChange={(e) => setSelectedFirm(e.target.value)}
                      className="border rounded px-3 py-2 text-sm"
                    >
                      <option value="">Select a firm</option>
                      <option value="firm-1">Firm 1</option>
                      <option value="firm-2">Firm 2</option>
                      <option value="firm-3">Firm 3</option>
                    </select>
                  </div>
                )}
              </>
            ) : (
              <div className="pb-4 px-4">Are you sure you want to log out?</div>
            )}

            <div className="flex border-t-2 py-3 gap-4 justify-end">
              <CustomButton
                onClick={() => setOpenRoleDialog(false)}
                variant="outline"
                className="border-gray-300"
              >
                Cancel
              </CustomButton>

              {user?.role === "admin" && (
                <CustomButton
                  onClick={handleSwitchRole}
                  variant="default"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={selectedRole === "firm admin" && !selectedFirm}
                >
                  Switch Role
                </CustomButton>
              )}
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
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
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

      {/* <div className="p-4 border-t border-slate-500">
        <Button
          variant="destructive"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div> */}
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
          flex-1 transition-all
          ${isMobile ? "ml-0 mt-16" : "ml-80"}
        `}
      >
        <BreadcrumbBar className={`${isMobile ? "hidden" : "ml-80"}`} />

        <div className="pt-[3.75rem] px-7 py-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
