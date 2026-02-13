"use client";

import React, { useEffect } from "react";
import { AuthProvider } from "../lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => {
        console.error("Service worker registration failed:", err);
      });
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}


