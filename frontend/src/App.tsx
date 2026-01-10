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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
                  <ProtectedRoute allowedRoles={["owner"]}>
                    <OwnerFirmPage />
                  </ProtectedRoute>
                }
              />

              {/* Firm Admin Routes */}
              <Route
                path="create-vendor-product"
                element={
                  <ProtectedRoute allowedRoles={["firm_admin"]}>
                    <FirmProductPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="create-retailer"
                element={
                  <ProtectedRoute allowedRoles={["firm_admin"]}>
                    <RetailerConfigPage />
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
  </QueryClientProvider>
);

export default App;
