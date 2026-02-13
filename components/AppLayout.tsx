"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/store";
import {
  LayoutDashboard,
  FileText,
  Smartphone,
  AlertTriangle,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

interface SidebarLinkProps {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon: Icon, label, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
        isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export const AppLayout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (!user) return <>{children}</>;

  const ownerLinks = [
    { href: "/owner/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/owner/reports/sales", icon: FileText, label: "Sales Reports" },
    { href: "/owner/sims", icon: Smartphone, label: "SIM Tracking" },
    { href: "/owner/reports/corrupted", icon: AlertTriangle, label: "Corrupted Reports" },
    { href: "/owner/staff", icon: Users, label: "Staff Management" },
  ];

  const staffLinks = [
    { href: "/staff/dashboard", icon: LayoutDashboard, label: "My Dashboard" },
  ];

  const navLinks = user.role === "Owner" ? ownerLinks : staffLinks;

  const currentPathLabel = pathname
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, " ");

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-4 fixed h-full z-20">
        <div className="flex items-center gap-2 px-4 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            SIM Tracker <span className="text-blue-600">Pro</span>
          </span>
        </div>

        <nav className="flex-1">
          {navLinks.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
            />
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <SidebarLink href="/settings" icon={Settings} label="Settings" />
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors w-full text-left font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white z-40 lg:hidden transition-transform duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">SIM Tracker</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1">
            {navLinks.map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-auto border-t border-slate-100 pt-4">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors w-full text-left font-medium"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:ml-64 transition-all pb-20 lg:pb-0">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-16 flex items-center justify-between">
          <button
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>{user.role} Dashboard</span>
            <span className="mx-1">/</span>
            <span className="text-slate-900 capitalize">{currentPathLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 rounded-full text-sm outline-none transition-all w-48 md:w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
              <img
                src={user.avatar}
                alt="Profile"
                className="w-9 h-9 rounded-full border border-slate-200 object-cover"
              />
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
};

