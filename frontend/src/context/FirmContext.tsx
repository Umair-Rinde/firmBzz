import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface Firm {
  id: string;
  name: string;
  code: string;
  slug: string;
  is_active: boolean;
}

interface FirmContextType {
  selectedFirmSlug: string | null;
  firms: Firm[];
  setFirms: (firms: Firm[]) => void;
  switchFirm: (slug: string) => void;
  clearFirm: () => void;
  isLoading: boolean;
}

const FirmContext = createContext<FirmContextType | undefined>(undefined);

export const FirmProvider = ({ children }: { children: ReactNode }) => {
  const [selectedFirmSlug, setSelectedFirmSlug] = useState<string | null>(null);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Initialize from localStorage or user data on mount
  useEffect(() => {
    const storedSlug = localStorage.getItem("selected_firm_slug");
    
    if (storedSlug) {
      setSelectedFirmSlug(storedSlug);
    } else if (user?.firm_id) {
      // For firm admins, we need to fetch their firm's slug
      // This will be handled by the component that fetches firms
      // For now, we'll just mark that we need to fetch it
      setIsLoading(true);
    }
  }, [user]);

  const switchFirm = (slug: string) => {
    setSelectedFirmSlug(slug);
    localStorage.setItem("selected_firm_slug", slug);
  };

  const clearFirm = () => {
    setSelectedFirmSlug(null);
    localStorage.removeItem("selected_firm_slug");
  };

  return (
    <FirmContext.Provider
      value={{
        selectedFirmSlug,
        firms,
        setFirms,
        switchFirm,
        clearFirm,
        isLoading,
      }}
    >
      {children}
    </FirmContext.Provider>
  );
};

export const useFirm = () => {
  const context = useContext(FirmContext);
  if (context === undefined) {
    throw new Error("useFirm must be used within a FirmProvider");
  }
  return context;
};
