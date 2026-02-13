"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/store";
import type { UserRole } from "../types";

interface ProtectedPageProps {
  children: React.ReactNode;
  role?: UserRole;
}

export const ProtectedPage: React.FC<ProtectedPageProps> = ({ children, role }) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (role && user.role !== role) {
      router.replace(user.role === "Owner" ? "/owner/dashboard" : "/staff/dashboard");
    }
  }, [user, role, router]);

  if (!user) return null;
  if (role && user.role !== role) return null;

  return <>{children}</>;
};

