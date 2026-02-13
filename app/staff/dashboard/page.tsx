"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone,
  AlertTriangle,
  TrendingUp,
  Target,
  Zap,
  Trophy,
  Wifi,
  Cpu,
  X,
  ArrowRight,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { useAuth } from "../../../lib/store";
import { getSales, getStats } from "../../../lib/storage";
import type { Sale } from "../../../types";
import { AppLayout } from "../../../components/AppLayout";
import { ProtectedPage } from "../../../components/ProtectedPage";

const StaffDashboardView: React.FC = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [metrics, setMetrics] = useState({ todaySales: 0, activeSims: 0, corruptedSims: 0 });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<"Today" | "All Time">("Today");

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const refreshData = () => {
    const data = getSales();
    const stats = getStats();
    const staffSales = data.filter((s) => s.staffId === user?.id);
    setSales(staffSales);

    const todayStr = new Date().toISOString().split("T")[0];
    const staffToday = staffSales.filter((s) => s.date === todayStr);

    setMetrics({
      todaySales: staffToday
        .filter((s) => s.status === "Completed")
        .reduce((a, b) => a + b.amount, 0),
      activeSims: staffSales.filter(
        (s) =>
          (s.productType === "SIM Card" || s.productType === "Old SIM") &&
          s.status === "Completed"
      ).length,
      corruptedSims: staffSales.filter((s) => s.status === "Cancelled").length,
    });
  };

  const getFilteredHistory = () => {
    if (filterPeriod === "Today") {
      const todayStr = new Date().toISOString().split("T")[0];
      return sales.filter((s) => s.date === todayStr);
    }
    return sales;
  };

  const statsCards = [
    {
      label: "My Today's Sales",
      value: `AED ${metrics.todaySales}`,
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "My Activations",
      value: `${metrics.activeSims}`,
      icon: Target,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Success Rate",
      value:
        metrics.activeSims + metrics.corruptedSims > 0
          ? `${Math.round(
              (metrics.activeSims / (metrics.activeSims + metrics.corruptedSims)) * 100
            )}%`
          : "100%",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Reported Issues",
      value: `${metrics.corruptedSims}`,
      icon: AlertTriangle,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
  ];

  const quickActions = [
    { label: "Activate New SIM", icon: Smartphone, href: "/staff/sale?type=SIM Card", color: "bg-blue-600" },
    { label: "Recharge", icon: Wifi, href: "/staff/sale?type=Recharge", color: "bg-emerald-600" },
    { label: "Replace SIM", icon: Cpu, href: "/staff/sale?type=Old SIM", color: "bg-purple-600" },
    { label: "Report Issue", icon: AlertTriangle, href: "/staff/report-issue", color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Terminal: {user?.name}
          </h1>
          <p className="text-slate-500 font-medium">
            Real-time performance monitoring and retail actions.
          </p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-700">
          <Trophy size={18} />
          <span className="text-sm font-bold">Shift Performance: Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <Card key={i} className="hover:scale-105 transition-transform">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Retail Terminal Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className={`${action.color} text-white p-6 rounded-3xl flex flex-col items-center gap-3 transition-all active:scale-95 shadow-lg shadow-slate-900/5 hover:brightness-110 group`}
                >
                  <action.icon size={32} className="group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs text-center leading-tight">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Live Activity Log</h2>
              <button
                onClick={() => setShowHistoryModal(true)}
                className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
              >
                Full Tabular View <ArrowRight size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {sales.length > 0 ? (
                sales.slice(0, 6).map((sale, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-2xl ${
                          sale.productType === "SIM Card"
                            ? "bg-blue-50 text-blue-600"
                            : sale.productType === "Recharge"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-purple-50 text-purple-600"
                        }`}
                      >
                        {sale.productType === "SIM Card" ? (
                          <Smartphone size={20} />
                        ) : sale.productType === "Recharge" ? (
                          <Wifi size={20} />
                        ) : (
                          <Cpu size={20} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {sale.productType} ({sale.network})
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                          {sale.time} • INV: {sale.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">AED {sale.amount}</p>
                      <Badge variant={sale.status === "Completed" ? "success" : "danger"}>
                        {sale.status === "Completed" ? "ACTIVE" : "CORRUPT"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  Waiting for transactions...
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <Card title="Shift Target" className="border-slate-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  Activations
                </span>
                <span className="text-sm font-black text-blue-600">
                  {metrics.activeSims} / 30
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((metrics.activeSims / 30) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                "Keep going! Your commission bonus starts after 30 activations."
              </p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="success">SHIFT STATUS: OPEN</Badge>
            </div>
            <div className="space-y-6">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-1">
                  Shift Revenue
                </span>
                <span className="text-3xl font-black">
                  AED{" "}
                  {sales.reduce(
                    (a, b) => a + (b.status === "Completed" ? b.amount : 0),
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-white/10 pt-4">
                <span className="text-slate-400">Total Activities</span>
                <span className="font-bold">{sales.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 lg:p-10">
          <Card className="w-full h-full max-h-[85vh] shadow-2xl animate-in fade-in zoom-in duration-200 border-none p-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Transaction History
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  Detailed log of all actions from this terminal
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex p-1 bg-white border border-slate-200 rounded-xl">
                {["Today", "All Time"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPeriod(p as "Today" | "All Time")}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all uppercase tracking-widest ${
                      filterPeriod === p
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Showing {getFilteredHistory().length} Records
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Product / Carrier</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {getFilteredHistory().map((sale) => (
                    <tr key={sale.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-slate-900">{sale.time}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                          {sale.date}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-500 group-hover:text-blue-600 transition-colors">
                        {sale.id}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">
                          {sale.productType}
                        </p>
                        <Badge
                          variant={
                            sale.network === "Du"
                              ? "info"
                              : sale.network === "Etisalat"
                              ? "success"
                              : "danger"
                          }
                        >
                          {sale.network}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        {sale.paymentMethod}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-slate-900 tracking-tight">
                          AED {sale.amount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={sale.status === "Completed" ? "success" : "danger"}>
                          {sale.status === "Completed" ? "ACTIVE" : "CORRUPT"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const StaffDashboardPage: React.FC = () => {
  return (
    <ProtectedPage role="Staff">
      <AppLayout>
        <StaffDashboardView />
      </AppLayout>
    </ProtectedPage>
  );
};

export default StaffDashboardPage;

