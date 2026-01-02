import React, { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export type UserRole = "owner" | "firm_admin" | "super_retailer" | "distributor";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  // In a real app, we'd check localStorage here for persisted sessions

  const login = (email: string, role: UserRole) => {
    // DUMMY LOGIC
    const dummyUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split("@")[0] || "User",
      email,
      role,
    };
    setUser(dummyUser);
    // Persist to local storage if needed, skipping for simple demo
  };

  const logout = () => {
    setUser(null);
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
