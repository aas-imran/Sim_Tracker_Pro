"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Smartphone,
  Search,
  Grid,
  List as ListIcon,
  X,
  Download,
  ChevronDown,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { AppLayout } from "../../../components/AppLayout";
import { ProtectedPage } from "../../../components/ProtectedPage";
import { getSIMs, downloadCSV } from "../../../lib/storage";
import type { SIMCard, Network } from "../../../types";

const OwnerSIMsView: React.FC = () => {
  const [sims, setSims] = useState<SIMCard[]>([]);
  const [activeTab, setActiveTab] = useState<"All" | "Activated" | "Corrupted">("All");
  const [activeNetwork, setActiveNetwork] = useState<"All" | Network>("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedSIM, setSelectedSIM] = useState<SIMCard | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSims(getSIMs());

    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSIMs = sims.filter((sim) => {
    if (sim.status === "Available") return false;

    const matchesTab = activeTab === "All" || sim.status === activeTab;
    const matchesNetwork = activeNetwork === "All" || sim.network === activeNetwork;
    const matchesSearch =
      sim.barcode.toLowerCase().includes(search.toLowerCase()) ||
      sim.iccid.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesNetwork && matchesSearch;
  });

  const handleExport = (
    type: "all" | "du" | "etisalat" | "virgin" | "activated" | "corrupted"
  ) => {
    let dataToExport = sims.filter((s) => s.status !== "Available");
    let filename = "SIM_Processed_Inventory_All.csv";

    switch (type) {
      case "du":
        dataToExport = dataToExport.filter((s) => s.network === "Du");
        filename = "SIM_Processed_Du.csv";
        break;
      case "etisalat":
        dataToExport = dataToExport.filter((s) => s.network === "Etisalat");
        filename = "SIM_Processed_Etisalat.csv";
        break;
      case "virgin":
        dataToExport = dataToExport.filter((s) => s.network === "Virgin Mobile");
        filename = "SIM_Processed_Virgin.csv";
        break;
      case "activated":
        dataToExport = dataToExport.filter((s) => s.status === "Activated");
        filename = "SIM_Processed_Activated.csv";
        break;
      case "corrupted":
        dataToExport = dataToExport.filter((s) => s.status === "Corrupted");
        filename = "SIM_Processed_Corrupted.csv";
        break;
    }

    const formattedData = dataToExport.map((s) => ({
      ICCID: s.iccid,
      Barcode: s.barcode,
      Network: s.network,
      Status: s.status,
      Staff_Name: s.assignedStaff || "N/A",
      Date: s.activationDate || s.receivedDate,
      Reason: s.reason || "",
    }));

    downloadCSV(formattedData, filename);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            SIM Activity tracking
          </h1>
          <p className="text-slate-500 font-medium">
            Tracking processed units (Activated & Corrupted) across all terminals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      <Card className="p-4 border-slate-200 shadow-sm relative overflow-visible">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
              Processing Status
            </label>
            <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto w-fit">
              {["All", "Activated", "Corrupted"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
              Network Filter
            </label>
            <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto w-fit">
              {["All", "Du", "Etisalat", "Virgin Mobile"].map((net) => (
                <button
                  key={net}
                  onClick={() => setActiveNetwork(net as any)}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                    activeNetwork === net
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">
              Search Terminal
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search ICCID/Barcode..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          <div className="lg:self-end pb-0.5 relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
            >
              <Download size={18} />
              Export CSV
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showExportMenu ? "rotate-180" : ""}`}
              />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 p-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-2 mb-1">
                  Select Export Scope
                </p>
                <div className="space-y-1">
                  {[
                    { label: "All Processed List", action: "all" },
                    { label: "Only Du Network", action: "du" },
                    { label: "Only Etisalat Network", action: "etisalat" },
                    { label: "Only Virgin Network", action: "virgin" },
                    { label: "Only Activated", action: "activated" },
                    { label: "Only Corrupted", action: "corrupted" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleExport(item.action as any)}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {viewMode === "table" ? (
        <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4">SIM Intelligence</th>
                  <th className="px-6 py-4">Carrier</th>
                  <th className="px-6 py-4 text-center">Current Status</th>
                  <th className="px-6 py-4">Staff Name</th>
                  <th className="px-6 py-4 text-right">Activity Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredSIMs.length > 0 ? (
                  filteredSIMs.slice(0, 50).map((sim) => (
                    <tr key={sim.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors font-mono">
                          {sim.barcode}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
                          Ref: {sim.id}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              sim.network === "Du"
                                ? "bg-blue-500 shadow-blue-200 shadow-lg"
                                : sim.network === "Etisalat"
                                ? "bg-emerald-500 shadow-emerald-200 shadow-lg"
                                : "bg-rose-500 shadow-rose-200 shadow-lg"
                            }`}
                          ></div>
                          <span className="text-sm font-bold text-slate-700">{sim.network}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={sim.status === "Activated" ? "success" : "danger"}>
                          {sim.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-bold">
                        {sim.assignedStaff || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedSIM(sim)}
                          className="text-blue-600 hover:text-blue-800 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg transition-all hover:shadow-md"
                        >
                          Audit Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-30">
                        <Smartphone size={48} />
                        <p className="font-black text-slate-900 uppercase tracking-widest">
                          No Active Records
                        </p>
                        <p className="text-xs text-slate-500 font-medium italic">
                          Adjust filters to see activated or corrupted SIMs
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Processed Units Count: {filteredSIMs.length}
            </span>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSIMs.slice(0, 24).map((sim) => (
            <Card
              key={sim.id}
              onClick={() => setSelectedSIM(sim)}
              className="hover:border-blue-400 transition-all cursor-pointer group hover:shadow-xl hover:shadow-blue-50"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-2.5 rounded-2xl ${
                    sim.status === "Activated"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  <Smartphone size={20} />
                </div>
                <Badge variant={sim.status === "Activated" ? "success" : "danger"}>
                  {sim.status}
                </Badge>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">
                {sim.network}
              </p>
              <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors font-mono truncate">
                {sim.barcode}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <span>{sim.assignedStaff || "N/A"}</span>
                <span>{sim.activationDate || "N/A"}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedSIM && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl border-none p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Audit: SIM Intelligence
              </h2>
              <button
                onClick={() => setSelectedSIM(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">
                  ICCID Barcode Terminal
                </label>
                <p className="text-xl font-black font-mono break-all">{selectedSIM.barcode}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">
                    Carrier Network
                  </label>
                  <p className="text-sm font-black text-slate-900">{selectedSIM.network}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1 tracking-widest">
                    Terminal Status
                  </label>
                  <div className="mt-1">
                    <Badge variant={selectedSIM.status === "Activated" ? "success" : "danger"}>
                      {selectedSIM.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">
                    Transaction Trace
                  </label>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-tighter">
                    Verified
                  </span>
                </div>
                <div className="relative pl-6 space-y-4">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 rounded-full"></div>
                  <div className="relative">
                    <div className="absolute -left-[1.85rem] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white"></div>
                    <p className="text-sm font-black text-slate-900">
                      {selectedSIM.status === "Activated"
                        ? "Successful Activation"
                        : "Hardware Fault Logged"}
                    </p>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                      Processed by {selectedSIM.assignedStaff} on{" "}
                      {selectedSIM.activationDate || "N/A"}
                    </p>
                    {selectedSIM.reason && (
                      <div className="mt-2 p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                        <p className="text-xs font-black uppercase tracking-widest mb-1 text-rose-400">
                          Fault Description
                        </p>
                        <p className="text-xs font-bold italic">"{selectedSIM.reason}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedSIM(null)}
                  className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95"
                >
                  Acknowledge &amp; Close
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const OwnerSIMsPage: React.FC = () => {
  return (
    <ProtectedPage role="Owner">
      <AppLayout>
        <OwnerSIMsView />
      </AppLayout>
    </ProtectedPage>
  );
};

export default OwnerSIMsPage;

