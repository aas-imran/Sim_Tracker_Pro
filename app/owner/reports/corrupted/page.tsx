"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Search,
  Eye,
  Download,
  X,
  Smartphone,
  Calendar,
  User,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import { AppLayout } from "../../../../components/AppLayout";
import { ProtectedPage } from "../../../../components/ProtectedPage";
import { getSIMs, downloadCSV } from "../../../../lib/storage";
import type { SIMCard } from "../../../../types";

const OwnerCorruptedReportsView: React.FC = () => {
  const [corruptedSims, setCorruptedSims] = useState<SIMCard[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSIM, setSelectedSIM] = useState<SIMCard | null>(null);

  useEffect(() => {
    const sims = getSIMs();
    setCorruptedSims(sims.filter((s) => s.status === "Corrupted"));
  }, []);

  const filtered = corruptedSims.filter(
    (s) =>
      s.barcode.includes(search) ||
      s.assignedStaff?.toLowerCase().includes(search.toLowerCase()) ||
      s.reason?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const exportData = filtered.map((s) => ({
      ICCID: s.barcode,
      Network: s.network,
      Status: s.status,
      Staff_Member: s.assignedStaff || "Unknown",
      Fault_Reason: s.reason || "Hardware failure",
      Date_Reported: s.activationDate || "N/A",
    }));
    downloadCSV(
      exportData,
      `Corrupted_SIM_Audit_${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
            <ShieldAlert className="text-rose-600" size={32} />
            Fault Audit Log
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            Investigating {corruptedSims.length} reported hardware failures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
          >
            <Download size={18} />
            Export CSV Report
          </button>
        </div>
      </div>

      <div className="relative group">
        <input
          type="text"
          placeholder="Search by Staff, ICCID, or Reason..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-sm shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
          size={20}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.length > 0 ? (
          filtered.map((sim) => (
            <Card
              key={sim.id}
              className="p-0 overflow-hidden border-rose-100 hover:border-rose-300 transition-all group shadow-sm hover:shadow-xl hover:shadow-rose-100/50"
            >
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/4 bg-rose-50/50 p-8 border-b lg:border-b-0 lg:border-r border-rose-100 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <AlertTriangle size={80} className="text-rose-600" />
                  </div>
                  <p className="text-[10px] font-black text-rose-600 uppercase mb-2 tracking-[0.2em] relative z-10">
                    Hardware Barcode
                  </p>
                  <p className="text-xl font-mono font-black text-slate-900 relative z-10 break-all">
                    {sim.barcode}
                  </p>
                  <Badge variant="danger">CRITICAL FAULT</Badge>
                </div>

                <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                      <User size={12} className="text-blue-500" /> Reporting Staff
                    </label>
                    <p className="text-base font-black text-slate-900">
                      {sim.assignedStaff || "Unknown"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                      <AlertTriangle size={12} className="text-rose-500" /> Fault Reason
                    </label>
                    <p className="text-base font-black text-rose-600 italic">
                      "{sim.reason || "Hardware failure"}"
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                      <Calendar size={12} className="text-emerald-500" /> Incident Date
                    </label>
                    <p className="text-base font-black text-slate-900">
                      {sim.activationDate || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 lg:w-48 flex items-center justify-center border-t lg:border-t-0 border-slate-100">
                  <button
                    onClick={() => setSelectedSIM(sim)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  >
                    <Eye size={18} /> View Audit
                  </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-24 text-center text-slate-400 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <ShieldAlert className="mx-auto mb-4 opacity-10" size={64} />
            <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tight">
              Zero Faults Detected
            </h3>
            <p className="text-slate-500 font-medium">
              All retail terminals are reporting clean hardware logs.
            </p>
          </div>
        )}
      </div>

      {selectedSIM && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl shadow-2xl border-none p-0 overflow-hidden bg-white">
            <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Real-Time SIM Audit
                </h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                  <Clock size={12} /> Live Inventory Trace
                </p>
              </div>
              <button
                onClick={() => setSelectedSIM(null)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Hardware ICCID Barcode
                </label>
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                  <p className="text-xl font-mono font-black text-slate-900 break-all">
                    {selectedSIM.barcode}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">
                    Carrier Network
                  </label>
                  <p className="text-base font-black text-slate-900">{selectedSIM.network}</p>
                </div>
                <div className="p-5 bg-rose-50/50 border border-rose-100 rounded-2xl">
                  <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest block mb-1">
                    Audit Status
                  </label>
                  <Badge variant="danger">CORRUPTED</Badge>
                </div>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-xl">
                    <Smartphone size={20} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Incident History
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      Failure Reported by {selectedSIM.assignedStaff}
                    </p>
                  </div>
                </div>

                <div className="pl-4 border-l-2 border-rose-500 py-2">
                  <p className="text-sm font-black text-rose-600 uppercase tracking-widest mb-1">
                    Reason for Rejection
                  </p>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                    "{selectedSIM.reason || "Hardware failure reported during terminal setup."}"
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Reported: {selectedSIM.activationDate || "Unknown"}</span>
                  <span>Inventory Ref: {selectedSIM.id}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSIM(null)}
                className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                Close Incident Audit
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const OwnerCorruptedReportsPage: React.FC = () => {
  return (
    <ProtectedPage role="Owner">
      <AppLayout>
        <OwnerCorruptedReportsView />
      </AppLayout>
    </ProtectedPage>
  );
};

export default OwnerCorruptedReportsPage;

