"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { User, UserRole } from "../types";

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = (email: string, role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      const name =
        role === "Owner"
          ? "Zayed Khan"
          : email.includes("staff1")
          ? "Ahmed Hassan"
          : "Sarah Khan";
      setUser({
        id: role === "Owner" ? "OWN-001" : "STF-001",
        name,
        email,
        role,
        avatar: `https://picsum.photos/seed/${name}/200`,
      });
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

