import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Pages
import Index from "./pages/Hero";
import Products from "./pages/Products";
import Retailers from "./pages/Retailers";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contacts";
import Login from "./pages/Login";

// Dashboard Pages
import DashboardHome from "./pages/admin-panel/dashboard/DashboardHome";

// NOTE: We need to make sure we import index.css to load Tailwind styles
import "./index.css";
import RetailerOrderPage from "./pages/admin-panel/retailer/order/page";
import OwnerFirmPage from "./pages/admin-panel/owner/firm/page";
import DistributionPage from "./pages/admin-panel/distributor/destribution-center.tsx/page";
import FirmProductPage from "./pages/admin-panel/firm-admin/firm-product/page";
import RetailerConfigPage from "./pages/admin-panel/firm-admin/retailer-config/page";
import UserConfig from "./pages/admin-panel/owner/user/page";
import { CookiesProvider } from "react-cookie";
import FirmUserManagementPage from "./pages/admin-panel/firm-admin/firm-users/page";
import VendorListPage from "./pages/admin-panel/firm-admin/vendors/page";
import VendorOrderListPage from "./pages/admin-panel/firm-admin/vendor-orders/page";
import VendorOrderAddPage from "./pages/admin-panel/firm-admin/vendor-orders/create-order";
import InvoicesPage from "./pages/admin-panel/firm-admin/invoices/page";
import InvoiceCreatePage from "./pages/admin-panel/firm-admin/invoices/create-invoice";
import InvoiceEditPage from "./pages/admin-panel/firm-admin/invoices/edit-invoice";
import PrintInvoicePage from "./pages/admin-panel/firm-admin/invoices/print-invoice";
import FirmRetailerOrdersPage from "./pages/admin-panel/firm-admin/retailer-orders/page";
import StockManagerPage from "./pages/admin-panel/firm-admin/stock-manager/page";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CookiesProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/retailers" element={<Retailers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />

              {/* Print pages - outside DashboardLayout for clean print */}
              <Route
                path="/dashboard/:firmId/invoices/:id/print"
                element={
                  <ProtectedRoute>
                    <PrintInvoicePage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />

                {/* Owner Routes */}
                <Route
                  path="create-firm"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <OwnerFirmPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="user-management"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <UserConfig />
                    </ProtectedRoute>
                  }
                />

                {/* Firm Admin Routes */}
                {/* <Route
                  path="create-vendor-product"
                  element={
                    <ProtectedRoute allowedRoles={["firm_admin", "admin"]}>
                      <FirmProductPage />
                    </ProtectedRoute>
                  }
                /> */}
                <Route
                  path=":firmId/create-vendor-product"
                  element={
                    <ProtectedRoute allowedRoles={["firm_admin", "admin"]}>
                      <FirmProductPage />
                    </ProtectedRoute>
                  }
                />
                {/* <Route
                  path="create-retailer"
                  element={
                    <ProtectedRoute allowedRoles={["firm_admin", "admin"]}>
                      <RetailerConfigPage />
                    </ProtectedRoute>
                  }
                /> */}
                <Route
                  path=":firmId/create-retailer"
                  element={
                    <ProtectedRoute allowedRoles={["firm_admin", "admin"]}>
                      <RetailerConfigPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":firmId/user-management"
                  element={
                    <ProtectedRoute allowedRoles={["firm_admin", "admin"]}>
                      <FirmUserManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":firmId/vendors"
                  element={
                    <ProtectedRoute allowedRoles={["firm_admin", "admin"]}>
                      <VendorListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":firmId/vendor-orders"
                  element={
                    <ProtectedRoute allowedRoles={["firm_admin", "admin"]}>
                      <VendorOrderListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":firmId/vendor-orders/create"
                  element={
                    <ProtectedRoute allowedRoles={["firm_admin", "admin"]}>
                      <VendorOrderAddPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path=":firmId/retailer-orders"
                  element={
                    <ProtectedRoute allowedRoles={["firm_admin", "admin"]}>
                      <FirmRetailerOrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":firmId/invoices"
                  element={
                    <ProtectedRoute allowedRoles={["firm_admin", "admin"]}>
                      <InvoicesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":firmId/stock-manager"
                  element={
                    <ProtectedRoute allowedRoles={["firm_admin", "admin"]}>
                      <StockManagerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":firmId/invoices/create"
                  element={
                    <ProtectedRoute allowedRoles={["firm_admin", "admin"]}>
                      <InvoiceCreatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path=":firmId/invoices/:id"
                  element={
                    <ProtectedRoute allowedRoles={["firm_admin", "admin"]}>
                      <InvoiceEditPage />
                    </ProtectedRoute>
                  }
                />

                {/* Super Retailer Routes */}
                <Route
                  path="orders"
                  element={
                    <ProtectedRoute allowedRoles={["super_retailer"]}>
                      <RetailerOrderPage />
                    </ProtectedRoute>
                  }
                />

                {/* Distributor Routes */}
                <Route
                  path="distribution"
                  element={
                    <ProtectedRoute allowedRoles={["distributor"]}>
                      <DistributionPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </CookiesProvider>
  </QueryClientProvider>
);

export default App;
