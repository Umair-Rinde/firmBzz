import { useAuth } from "@/context/AuthContext";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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
      roles: ["owner", "firm_admin", "super_retailer", "distributor"],
    },
    {
      title: "Create Firm",
      icon: Building2,
      href: "/dashboard/create-firm",
      roles: ["owner"],
    },
    {
      title: "Firm Products",
      icon: Package,
      href: "/dashboard/create-vendor-product",
      roles: ["firm_admin"],
    },
    {
      title: "Retailers",
      icon: Users,
      href: "/dashboard/create-retailer",
      roles: ["firm_admin"],
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

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white border-r border-slate-500">
      <div className="p-6 border-b border-slate-500 ">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          FirmBzz
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
          {user?.role.replace("_", " ")} Portal
        </p>
      </div>

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

      <div className="p-4 border-t border-slate-500">
        <Button
          variant="destructive"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
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
