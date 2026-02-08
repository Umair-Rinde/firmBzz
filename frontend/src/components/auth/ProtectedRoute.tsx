import { useAuth, UserRole } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    // Check authentication - either from context or localStorage
    const token = localStorage.getItem("token");
    const isUserAuthenticated = isAuthenticated || !!token;

    if (!isUserAuthenticated) {
        // Redirect to login page with the return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Role not authorized, redirect to dashboard home or unauthorized page
        // For now, sending to home, but could be a 403 page
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
