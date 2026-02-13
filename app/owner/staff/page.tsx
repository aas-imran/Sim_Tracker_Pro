"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Smartphone,
  Zap,
  AlertTriangle,
  Wifi,
  Cpu,
  Download,
  Search,
  History,
  Eye,
  X,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { AppLayout } from "../../../components/AppLayout";
import { ProtectedPage } from "../../../components/ProtectedPage";
import {
  getSales,
  getStaffPerformance,
  downloadCSV,
  saveStaffAccount,
  saveSale,
} from "../../../lib/storage";
import type { StaffPerformance, Sale, Network } from "../../../types";

const OwnerStaffManagementView: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffPerformance[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<"Day" | "Month" | "All">("All");
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<StaffPerformance | null>(null);
  const [blockedStaffIds, setBlockedStaffIds] = useState<string[]>([]);
  const [blockConfirmStaff, setBlockConfirmStaff] = useState<StaffPerformance | null>(null);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [addStep, setAddStep] = useState<1 | 2>(1);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<{
    email: string;
    otp: string;
    fullName: string;
    password: string;
    avatarDataUrl: string | null;
  }>({
    email: "",
    otp: "",
    fullName: "",
    password: "",
    avatarDataUrl: null,
  });

  useEffect(() => {
    setStaffList(getStaffPerformance());
    setSales(getSales());
  }, []);

  const getFilteredSales = (staffId: string) => {
    let filtered = sales.filter((s) => s.staffId === staffId);
    const today = new Date().toISOString().split("T")[0];
    const currentMonth = today.substring(0, 7);

    if (timeFilter === "Day") {
      filtered = filtered.filter((s) => s.date === today);
    } else if (timeFilter === "Month") {
      filtered = filtered.filter((s) => s.date.startsWith(currentMonth));
    }
    return filtered;
  };

  const getStaffStats = (staffId: string) => {
    const staffSales = getFilteredSales(staffId);
    const completed = staffSales.filter((s) => s.status === "Completed");

    const activations = completed.filter((s) => s.productType === "SIM Card");
    const recharges = completed.filter((s) => s.productType === "Recharge");
    const replacements = completed.filter((s) => s.productType === "Old SIM");
    const corrupted = staffSales.filter((s) => s.status === "Cancelled");

    const networks: Network[] = ["Du", "Etisalat", "Virgin Mobile"];

    const networkStats = networks.reduce((acc, net) => {
      acc[net] = {
        activations: activations.filter((a) => a.network === net).length,
        recharges: recharges.filter((r) => r.network === net).length,
        rechargeValue: recharges
          .filter((r) => r.network === net)
          .reduce((sum, r) => sum + r.amount, 0),
        replacements: replacements.filter((rp) => rp.network === net).length,
        corrupted: corrupted.filter((c) => c.network === net).length,
      };
      return acc;
    }, {} as Record<string, any>);

    return {
      revenue: completed.reduce((a, b) => a + b.amount, 0),
      activationsCount: activations.length,
      rechargesCount: recharges.length,
      replacementsCount: replacements.length,
      corruptedCount: corrupted.length,
      totalCount: staffSales.length,
      logs: staffSales,
      faults: corrupted,
      networkStats,
    };
  };

  const handleExportStaff = (staff: StaffPerformance) => {
    const staffSales = getFilteredSales(staff.id);
    const exportData = staffSales.map((s) => ({
      Staff: s.staff,
      Staff_ID: s.staffId,
      Date: s.date,
      Time: s.time,
      Type: s.productType,
      Carrier: s.network,
      Amount: s.amount,
      Status: s.status,
      Barcode: s.simBarcode || "N/A",
    }));
    downloadCSV(
      exportData,
      `${staff.name.replace(/\s+/g, "_")}_${timeFilter}_Audit.csv`
    );
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={32} />
            Staff Terminal Audit
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Activity size={18} className="text-blue-400" />
            Auditing {staffList.length} retail terminals.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {["Day", "Month", "All"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t as any)}
                className={`px-5 py-2 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest ${
                  timeFilter === t
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative group flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search Terminal ID..."
                className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-sm w-full sm:w-56"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddStaff(true);
                setAddStep(1);
                setGeneratedOtp(null);
                setAddForm({
                  email: "",
                  otp: "",
                  fullName: "",
                  password: "",
                  avatarDataUrl: null,
                });
              }}
              className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-sm hover:bg-blue-700"
            >
              Add Staff
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStaff.map((staff) => {
          const stats = getStaffStats(staff.id);
          const isBlocked =
            blockedStaffIds.includes(staff.id) || staff.status === "Inactive";

          return (
            <Card
              key={staff.id}
              className="p-0 border-slate-200 hover:shadow-2xl transition-all duration-300 group flex flex-col min-h-[440px] relative overflow-hidden bg-white"
            >
              {isBlocked && (
                <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-rose-500 via-amber-500 to-rose-500" />
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="relative">
                    <img
                      src={staff.avatar}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-50 shadow-sm"
                      alt={staff.name}
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        isBlocked ? "bg-slate-300" : "bg-emerald-500"
                      }`}
                    ></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedStaffDetail(staff)}
                      className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      type="button"
                      disabled={isBlocked}
                      onClick={() => setBlockConfirmStaff(staff)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        isBlocked
                          ? "bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed"
                          : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white"
                      }`}
                    >
                      {isBlocked ? "Blocked" : "Block"}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors line-clamp-1">
                    {staff.name}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {staff.id}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5 truncate">
                      Activation
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Smartphone size={12} className="text-blue-500 shrink-0" />
                      <span className="text-sm font-black text-slate-900">
                        {stats.activationsCount}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5 truncate">
                      Recharge
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Wifi size={12} className="text-emerald-500 shrink-0" />
                      <span className="text-sm font-black text-slate-900">
                        {stats.rechargesCount}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5 truncate">
                      Replacement
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Cpu size={12} className="text-purple-500 shrink-0" />
                      <span className="text-sm font-black text-slate-900">
                        {stats.replacementsCount}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5 truncate">
                      Audit Score
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Zap size={12} className="text-amber-500 shrink-0" />
                      <span className="text-sm font-black text-slate-900">
                        {staff.successRate}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      Revenue
                    </p>
                    <p className="text-lg font-black text-slate-900 leading-tight">
                      AED {stats.revenue}
                    </p>
                  </div>
                  <Badge variant={stats.corruptedCount > 0 ? "danger" : "success"}>
                    {stats.corruptedCount > 0 ? `${stats.corruptedCount} Issues` : "Verified"}
                  </Badge>
                </div>
              </div>

              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  {isBlocked ? "Blocked" : staff.status} Status
                </span>
                <div className="flex -space-x-1.5">
                  <div className="w-4 h-4 rounded-full border border-white bg-blue-600"></div>
                  <div className="w-4 h-4 rounded-full border border-white bg-emerald-600"></div>
                  <div className="w-4 h-4 rounded-full border border-white bg-rose-600"></div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedStaffDetail && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-5xl max-h-[90vh] shadow-2xl border-none p-0 overflow-hidden flex flex-col bg-white">
            <div className="px-8 py-6 bg-slate-900 text-white flex flex-col md:flex-row items-center gap-6 border-b border-white/5">
              <img
                src={selectedStaffDetail.avatar}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white/10 shadow-lg shrink-0"
                alt={selectedStaffDetail.name}
              />
              <div className="text-center md:text-left flex-1 min-w-0">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h2 className="text-2xl font-black uppercase tracking-tight truncate">
                    {selectedStaffDetail.name}
                  </h2>
                  {(
                    blockedStaffIds.includes(selectedStaffDetail.id) ||
                    selectedStaffDetail.status === "Inactive"
                  ) ? (
                    <Badge variant="danger">Blocked</Badge>
                  ) : (
                    <Badge variant="success">Online</Badge>
                  )}
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-0.5 truncate">
                  {selectedStaffDetail.id} • {selectedStaffDetail.role}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportStaff(selectedStaffDetail)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  <Download size={16} />
                  Export CSV
                </button>
                <button
                  onClick={() => setSelectedStaffDetail(null)}
                  className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
              <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mb-32 -mr-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Terminal Target Progress</span>
                      <span className="text-blue-400">
                        {getStaffStats(selectedStaffDetail.id).activationsCount} / 50 Units
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-1000"
                        style={{
                          width: `${Math.min(
                            (getStaffStats(selectedStaffDetail.id).activationsCount / 50) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center md:text-right shrink-0">
                    <p className="text-3xl font-black text-white">
                      {selectedStaffDetail.successRate}%
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Efficiency Audit
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-slate-200 p-5 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">
                        {getStaffStats(selectedStaffDetail.id).activationsCount}
                      </p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Activations
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    {["Du", "Etisalat", "Virgin Mobile"].map((net) => (
                      <div key={net} className="flex justify-between text-[10px]">
                        <span className="font-black text-slate-400 uppercase">{net}</span>
                        <span className="font-black text-slate-900">
                          {getStaffStats(selectedStaffDetail.id).networkStats[net].activations} Unit
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-white border-slate-200 p-5 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Wifi size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">
                        {getStaffStats(selectedStaffDetail.id).rechargesCount}
                      </p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Recharges
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    {["Du", "Etisalat", "Virgin Mobile"].map((net) => (
                      <div key={net} className="flex justify-between text-[10px]">
                        <span className="font-black text-slate-400 uppercase">{net}</span>
                        <span className="font-black text-emerald-600">
                          AED{" "}
                          {
                            getStaffStats(selectedStaffDetail.id).networkStats[net]
                              .rechargeValue
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-white border-slate-200 p-5 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                      <Cpu size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">
                        {getStaffStats(selectedStaffDetail.id).replacementsCount}
                      </p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Replacements
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    {["Du", "Etisalat", "Virgin Mobile"].map((net) => (
                      <div key={net} className="flex justify-between text-[10px]">
                        <span className="font-black text-slate-400 uppercase">{net}</span>
                        <span className="font-black text-slate-900">
                          {
                            getStaffStats(selectedStaffDetail.id).networkStats[net]
                              .replacements
                          }{" "}
                          Swaps
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col min-h-0">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1 flex items-center gap-2">
                    <History size={14} className="text-blue-500" /> Recent Terminal Log
                  </h4>
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[320px]">
                    <div className="overflow-y-auto divide-y divide-slate-100">
                      {getStaffStats(selectedStaffDetail.id).logs.length > 0 ? (
                        getStaffStats(selectedStaffDetail.id).logs.map((log, i) => (
                          <div
                            key={i}
                            className="px-5 py-4 flex items-center justify-between hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  log.status === "Completed"
                                    ? "bg-slate-100 text-slate-500"
                                    : "bg-rose-50 text-rose-500"
                                }`}
                              >
                                <Activity size={14} />
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-800 leading-none">
                                  {log.productType}
                                </p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                                  {log.time} • {log.network}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-slate-900">
                                AED {log.amount}
                              </p>
                              <span
                                className={`text-[8px] font-black uppercase ${
                                  log.status === "Completed"
                                    ? "text-emerald-500"
                                    : "text-rose-500"
                                }`}
                              >
                                {log.status === "Completed" ? "Verified" : "Corrupt"}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 text-center text-[10px] font-black text-slate-300 uppercase italic">
                          Empty Log
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col min-h-0">
                  <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-3 px-1 flex items-center gap-2">
                    <AlertTriangle size={14} /> Comprehensive Fault Audit
                  </h4>
                  <div className="bg-white rounded-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[320px]">
                    <div className="overflow-y-auto divide-y divide-rose-50">
                      {getStaffStats(selectedStaffDetail.id).faults.length > 0 ? (
                        getStaffStats(selectedStaffDetail.id).faults.map((fault, i) => (
                          <div key={i} className="px-5 py-5 bg-rose-50/10">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                                {fault.network} Rejection
                              </p>
                              <span className="text-[9px] font-bold text-slate-400">
                                {fault.date}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-700 italic">
                              "Ref: {fault.simBarcode || "N/A"}"
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-20 flex flex-col items-center justify-center text-emerald-500 opacity-60">
                          <ShieldCheck size={40} />
                          <p className="text-[10px] font-black uppercase mt-2 tracking-widest">
                            Clean Status
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex justify-center">
              <button
                onClick={() => setSelectedStaffDetail(null)}
                className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
              >
                Close Terminal Audit
              </button>
            </div>
          </Card>
        </div>
      )}

      {filteredStaff.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center space-y-4 opacity-30">
          <Users size={64} className="text-slate-300" />
          <h3 className="text-xl font-black text-slate-900 uppercase">Terminal Index Empty</h3>
        </div>
      )}

      {showAddStaff && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">
                  Add New Staff Terminal
                </p>
                <h2 className="text-lg font-black text-slate-900">
                  {addStep === 1 ? "Verify Staff Email" : "Create Profile & Access"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStaff(false)}
                className="p-2 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {addStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Staff Email
                  </label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                    placeholder="staff@shop.com"
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      OTP Code
                    </label>
                    <input
                      type="text"
                      value={addForm.otp}
                      onChange={(e) =>
                        setAddForm((prev) => ({ ...prev, otp: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm tracking-[0.4em] font-mono text-center"
                      placeholder="------"
                    />
                  </div>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                    onClick={() => {
                      if (!addForm.email) return;
                      const code = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedOtp(code);
                      // Demo: surface OTP inline since no real email
                      alert(`Demo OTP for ${addForm.email}: ${code}`);
                    }}
                  >
                    Send OTP
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  For this demo, an OTP is generated locally and shown in an alert. In a real
                  system it would be emailed to the staff member.
                </p>
                <button
                  type="button"
                  disabled={!generatedOtp || addForm.otp !== generatedOtp}
                  onClick={() => setAddStep(2)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 disabled:bg-slate-300"
                >
                  Verify & Continue
                </button>
              </div>
            )}

            {addStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={addForm.fullName}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                    placeholder="Staff full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Set Password
                  </label>
                  <input
                    type="password"
                    value={addForm.password}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                    placeholder="Create password"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setAddForm((prev) => ({
                          ...prev,
                          avatarDataUrl: reader.result as string,
                        }));
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                  />
                  {addForm.avatarDataUrl && (
                    <img
                      src={addForm.avatarDataUrl}
                      alt="Preview"
                      className="mt-2 w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Role: Staff (fixed)</span>
                </div>
                <button
                  type="button"
                  disabled={!addForm.fullName || !addForm.password}
                  onClick={() => {
                    const id = `STF-${Math.floor(100 + Math.random() * 900)}`;
                    const avatar =
                      addForm.avatarDataUrl ||
                      `https://picsum.photos/seed/${encodeURIComponent(
                        addForm.fullName || "staff"
                      )}/200`;

                    // Save account for login
                    saveStaffAccount({
                      id,
                      name: addForm.fullName || addForm.email,
                      email: addForm.email,
                      password: addForm.password,
                      role: "Staff",
                      avatar,
                    });

                    // Add base performance record so they appear in staff list
                    setStaffList((prev) => [
                      ...prev,
                      {
                        id,
                        name: addForm.fullName || addForm.email,
                        email: addForm.email,
                        phone: "",
                        role: "Staff",
                        avatar,
                        todaySales: 0,
                        monthlySales: 0,
                        totalActivations: 0,
                        corruptedSIMs: 0,
                        successRate: 100,
                        status: "Active",
                      },
                    ]);

                    // Optionally log a zero-amount "account created" sale for auditing demo
                    saveSale({
                      id: `SYS-${Date.now()}`,
                      date: new Date().toISOString().split("T")[0],
                      time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      staff: addForm.fullName || addForm.email,
                      staffId: id,
                      productType: "SIM Card",
                      network: "Other",
                      amount: 0,
                      paymentMethod: "Cash",
                      simBarcode: undefined,
                      status: "Completed",
                    });

                    setShowAddStaff(false);
                  }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 disabled:bg-slate-300"
                >
                  Create Staff & Save
                </button>
                <p className="text-[11px] text-slate-400">
                  The staff member will be able to log in using their email and the password
                  you set, with the role fixed as Staff.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {blockConfirmStaff && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Block {blockConfirmStaff.name}'s Terminal?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  This will mark the staff as inactive and highlight their card as blocked.
                  You can still view their history, but they should not use this terminal.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                onClick={() => setBlockConfirmStaff(null)}
              >
                No, Keep Active
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                onClick={() => {
                  setStaffList((prev) =>
                    prev.map((s) =>
                      s.id === blockConfirmStaff.id ? { ...s, status: "Inactive" } : s
                    )
                  );
                  setBlockedStaffIds((prev) =>
                    prev.includes(blockConfirmStaff.id)
                      ? prev
                      : [...prev, blockConfirmStaff.id]
                  );
                  setBlockConfirmStaff(null);
                }}
              >
                Yes, Block Staff
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const OwnerStaffPage: React.FC = () => {
  return (
    <ProtectedPage role="Owner">
      <AppLayout>
        <OwnerStaffManagementView />
      </AppLayout>
    </ProtectedPage>
  );
};

export default OwnerStaffPage;

