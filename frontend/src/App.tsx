
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
import DashboardHome from "./pages/dashboard/DashboardHome";
import CreateFirm from "./pages/dashboard/CreateFirm";
import CreateVendorProduct from "./pages/dashboard/CreateVendorProduct";
import CreateRetailer from "./pages/dashboard/CreateRetailer";
import SuperRetailerOrders from "./pages/dashboard/SuperRetailerOrders";
import DistributorView from "./pages/dashboard/DistributorView";

// NOTE: We need to make sure we import index.css to load Tailwind styles
import "./index.css";

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
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />

              {/* Owner Routes */}
              <Route path="create-firm" element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <CreateFirm />
                </ProtectedRoute>
              } />

              {/* Firm Admin Routes */}
              <Route path="create-vendor-product" element={
                <ProtectedRoute allowedRoles={['firm_admin']}>
                  <CreateVendorProduct />
                </ProtectedRoute>
              } />
              <Route path="create-retailer" element={
                <ProtectedRoute allowedRoles={['firm_admin']}>
                  <CreateRetailer />
                </ProtectedRoute>
              } />

              {/* Super Retailer Routes */}
              <Route path="orders" element={
                <ProtectedRoute allowedRoles={['super_retailer']}>
                  <SuperRetailerOrders />
                </ProtectedRoute>
              } />

              {/* Distributor Routes */}
              <Route path="distribution" element={
                <ProtectedRoute allowedRoles={['distributor']}>
                  <DistributorView />
                </ProtectedRoute>
              } />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
