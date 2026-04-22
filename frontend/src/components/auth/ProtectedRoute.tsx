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
        if (user.role === "sales_person" && user.firm_slug) {
            return (
                <Navigate
                    to={`/dashboard/${user.firm_slug}/retailer-orders`}
                    replace
                />
            );
        }
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};
