"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { User, UserRole } from "../types";
import { findStaffAccountByEmail } from "./storage";

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole, password?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = (email: string, role: UserRole, password?: string) => {
    setIsLoading(true);
    setTimeout(() => {
      if (role === "Owner") {
        const name = "Zayed Khan";
        setUser({
          id: "OWN-001",
          name,
          email,
          role,
          avatar: `https://picsum.photos/seed/${name}/200`,
        });
      } else {
        // Staff login: first try real account, then fall back to demo logic
        const account = findStaffAccountByEmail(email);
        if (account && password && account.password === password) {
          setUser({
            id: account.id,
            name: account.name,
            email: account.email,
            role: "Staff",
            avatar: account.avatar || `https://picsum.photos/seed/${account.name}/200`,
          });
        } else {
          const name = email.includes("staff1") ? "Ahmed Hassan" : "Sarah Khan";
          setUser({
            id: "STF-001",
            name,
            email,
            role: "Staff",
            avatar: `https://picsum.photos/seed/${name}/200`,
          });
        }
      }
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

