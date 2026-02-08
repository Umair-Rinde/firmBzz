import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type UserRole = "admin" | "firm_admin" | "super_retailer" | "distributor";

interface BackendUser {
  id: string;
  username: string;
  email: string;
  user_type: string;
  role?: string;
  firm_id?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  username: string;
  firm_id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: BackendUser, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map backend roles to frontend roles
const mapBackendRoleToFrontend = (userType: string, role?: string): UserRole => {
  if (userType === "Admin") {
    return "admin";
  }
  
  if (userType === "FIRM_USER") {
    switch (role) {
      case "FIRM_MANAGER":
        return "firm_admin";
      case "SUPER_SELL_MANAGER":
        return "super_retailer";
      case "DISTRIBUTION_MANAGER":
      case "SALESMAN":
        return "distributor";
      default:
        return "firm_admin"; // Default fallback
    }
  }
  
  return "firm_admin"; // Default fallback
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("users_obj");
    
    if (token && userStr) {
      try {
        const backendUser: BackendUser = JSON.parse(userStr);
        const mappedUser: User = {
          id: backendUser.id,
          name: backendUser.username,
          email: backendUser.email,
          username: backendUser.username,
          role: mapBackendRoleToFrontend(backendUser.user_type, backendUser.role),
          firm_id: backendUser.firm_id,
        };
        setUser(mappedUser);
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("users_obj");
      }
    }
  }, []);

  const login = (userData: BackendUser, token: string) => {
    // Save to localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("users_obj", JSON.stringify(userData));
    
    // Map backend user to frontend user
    const mappedUser: User = {
      id: userData.id,
      name: userData.username,
      email: userData.email,
      username: userData.username,
      role: mapBackendRoleToFrontend(userData.user_type, userData.role),
      firm_id: userData.firm_id,
    };
    
    setUser(mappedUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("users_obj");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
