"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Smartphone,
  AlertCircle,
  DollarSign,
  ChevronRight,
  Users,
  Zap,
  Wifi,
  Cpu,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { AppLayout } from "../../../components/AppLayout";
import { ProtectedPage } from "../../../components/ProtectedPage";
import { getSales, getStats, getStaffPerformance } from "../../../lib/storage";
import type { Sale, StaffPerformance } from "../../../types";

const OwnerDashboardView: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [metrics, setMetrics] = useState({ todaySales: 0, activeSims: 0, corruptedSims: 0 });
  const [staffPerf, setStaffPerf] = useState<StaffPerformance[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setSales(getSales());
    setMetrics(getStats());
    setStaffPerf(getStaffPerformance());
  };

  const stats = [
    {
      label: "Gross Revenue (Total)",
      value: `AED ${sales
        .filter((s) => s.status === "Completed")
        .reduce((a, b) => a + b.amount, 0)}`,
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Today's Target",
      value: `AED ${metrics.todaySales} / 5000`,
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Active Network Units",
      value: metrics.activeSims.toString(),
      icon: Smartphone,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Corrupt Logs",
      value: metrics.corruptedSims.toString(),
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  const networkData = [
    { name: "Du", value: sales.filter((s) => s.network === "Du").length, color: "#3b82f6" },
    {
      name: "Etisalat",
      value: sales.filter((s) => s.network === "Etisalat").length,
      color: "#10b981",
    },
    {
      name: "Virgin",
      value: sales.filter((s) => s.network === "Virgin Mobile").length,
      color: "#ef4444",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            Main Terminal Hub
          </h1>
          <p className="text-slate-500 font-medium">
            Global store performance and staff auditing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/owner/reports/sales"
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            Detailed Reports <ChevronRight size={16} />
          </Link>
          <button
            onClick={refreshData}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            Sync Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="relative overflow-hidden border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            {stat.label.includes("Target") && (
              <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min((metrics.todaySales / 5000) * 100, 100)}%` }}
                ></div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Sales Volume Analysis" className="lg:col-span-2 border-slate-100">
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: "Week 1", value: 1200 },
                  { name: "Week 2", value: 3400 },
                  { name: "Week 3", value: 2100 },
                  {
                    name: "Week 4",
                    value: metrics.todaySales > 0 ? metrics.todaySales * 7 : 4500,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Revenue Share by Network" className="border-slate-100">
          <div className="h-[200px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={networkData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {networkData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {networkData.map((n, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: n.color }}
                  ></div>
                  <span className="font-bold text-slate-600">{n.name}</span>
                </div>
                <span className="font-black text-slate-900">{n.value} TXs</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Staff Performance Leaderboard" className="border-slate-100">
          <div className="space-y-4">
            {staffPerf.map((staff, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100 cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={staff.avatar}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                    alt={staff.name}
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{staff.name}</p>
                    <div className="flex gap-2 mt-0.5">
                      <Badge variant="info">{staff.totalActivations} Acts</Badge>
                      <Badge variant="danger">{staff.corruptedSIMs} Errors</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    AED {staff.todaySales}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {staff.successRate}% Success
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Global Activity Feed" className="p-0 overflow-hidden border-slate-100 shadow-sm">
          <div className="max-h-[400px] overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {sales.slice(0, 15).map((sale, i) => (
                <div
                  key={i}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2.5 rounded-xl ${
                        sale.productType === "SIM Card"
                          ? "bg-blue-100 text-blue-600"
                          : sale.productType === "Recharge"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {sale.productType === "SIM Card" ? (
                        <Smartphone size={18} />
                      ) : sale.productType === "Recharge" ? (
                        <Wifi size={18} />
                      ) : (
                        <Cpu size={18} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {sale.productType}{" "}
                        <span className="text-slate-400 font-medium">
                          via {sale.staff.split(" ")[0]}
                        </span>
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {sale.date} • {sale.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-black ${
                        sale.status === "Completed" ? "text-slate-900" : "text-rose-500"
                      }`}
                    >
                      {sale.status === "Completed" ? `AED ${sale.amount}` : "REPORTED"}
                    </p>
                    <Badge variant={sale.status === "Completed" ? "success" : "danger"}>
                      {sale.status === "Completed"
                        ? sale.productType === "Recharge"
                          ? "RECHARGED"
                          : "ACTIVE"
                        : "CORRUPT"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
            <Link
              href="/owner/reports/sales"
              className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline"
            >
              Auditing Hub
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

const OwnerDashboardPage: React.FC = () => {
  return (
    <ProtectedPage role="Owner">
      <AppLayout>
        <OwnerDashboardView />
      </AppLayout>
    </ProtectedPage>
  );
};

export default OwnerDashboardPage;

