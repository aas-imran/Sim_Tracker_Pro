"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Shield, User as UserIcon, Loader2 } from "lucide-react";
import { useAuth } from "../../lib/store";
import type { UserRole } from "../../types";

const LoginPage: React.FC = () => {
  const { user, login, isLoading } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("Owner");
  const [email, setEmail] = useState(role === "Owner" ? "owner@shop.com" : "staff1@shop.com");
  const [password, setPassword] = useState(role === "Owner" ? "owner123" : "staff123");

  useEffect(() => {
    if (user) {
      router.replace(user.role === "Owner" ? "/owner/dashboard" : "/staff/dashboard");
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role, password);
  };

  const handleRoleToggle = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === "Owner") {
      setEmail("owner@shop.com");
      setPassword("owner123");
    } else {
      setEmail("staff1@shop.com");
      setPassword("staff123");
    }
  };

  // While redirecting away, render nothing
  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 pb-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SIM Tracker Pro</h1>
            <p className="text-slate-500 mt-2">Manage your retail shop activations</p>
          </div>

          <div className="px-8 pb-2">
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
              <button
                onClick={() => handleRoleToggle("Owner")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
                  role === "Owner"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Shield size={16} />
                Owner
              </button>
              <button
                onClick={() => handleRoleToggle("Staff")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
                  role === "Staff"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <UserIcon size={16} />
                Staff
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email / Username
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-sm text-slate-600 font-medium">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 font-semibold hover:underline underline-offset-4"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">Retail Demo Mode Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

