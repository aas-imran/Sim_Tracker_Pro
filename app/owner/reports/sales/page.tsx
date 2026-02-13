"use client";

import React, { useState, useEffect } from "react";
import { Search, Download, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import { AppLayout } from "../../../../components/AppLayout";
import { ProtectedPage } from "../../../../components/ProtectedPage";
import { getSales, downloadCSV } from "../../../../lib/storage";
import type { Sale, ProductType, Network } from "../../../../types";

const OwnerReportsSalesView: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductType | "All">("All");
  const [networkFilter, setNetworkFilter] = useState<Network | "All">("All");
  const [staffFilter, setStaffFilter] = useState<string>("All");

  useEffect(() => {
    const data = getSales();
    setSales(data);
    setFilteredSales(data);
  }, []);

  useEffect(() => {
    let result = sales;

    if (search) {
      result = result.filter(
        (s) =>
          s.id.toLowerCase().includes(search.toLowerCase()) ||
          s.staff.toLowerCase().includes(search.toLowerCase()) ||
          s.simBarcode?.includes(search)
      );
    }

    if (typeFilter !== "All") {
      result = result.filter((s) => s.productType === typeFilter);
    }

    if (networkFilter !== "All") {
      result = result.filter((s) => s.network === networkFilter);
    }

    if (staffFilter !== "All") {
      result = result.filter((s) => s.staff === staffFilter);
    }

    setFilteredSales(result);
  }, [search, typeFilter, networkFilter, staffFilter, sales]);

  const handleExport = () => {
    const exportData = filteredSales.map((s) => ({
      Invoice: s.id,
      Date: s.date,
      Time: s.time,
      Staff: s.staff,
      Type: s.productType,
      Network: s.network,
      Amount: s.amount,
      Method: s.paymentMethod,
      Barcode: s.simBarcode || "N/A",
      Status: s.status,
    }));
    downloadCSV(
      exportData,
      `Sales_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  const staffNames = Array.from(new Set(sales.map((s) => s.staff)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            Sales Intelligence
          </h1>
          <p className="text-slate-500 font-medium">
            Detailed transaction auditing and reporting.
          </p>
        </div>
      </div>

      <Card className="p-4 shadow-sm border-slate-200">
        <div className="flex flex-col lg:flex-row items-end lg:items-center gap-4">
          <div className="w-full lg:w-64">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Invoice, Staff, SIM..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            </div>
          </div>

          <div className="w-full lg:w-48">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Type
            </label>
            <select
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-sm font-medium"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="All">All Services</option>
              <option value="SIM Card">New Activation</option>
              <option value="Recharge">Recharge</option>
              <option value="Old SIM">Replacement</option>
            </select>
          </div>

          <div className="w-full lg:w-48">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Staff
            </label>
            <select
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-sm font-medium"
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
            >
              <option value="All">All Staff</option>
              {staffNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full lg:flex-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Network
            </label>
            <div className="flex flex-wrap gap-2">
              {["All", "Du", "Etisalat", "Virgin Mobile"].map((net) => (
                <button
                  key={net}
                  onClick={() => setNetworkFilter(net as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border uppercase tracking-wider ${
                    networkFilter === net
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-auto pt-4 lg:pt-0">
            <button
              onClick={handleExport}
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden shadow-sm border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Carrier</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {sale.productType}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {sale.date} • {sale.time}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">{sale.staff}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        ID: {sale.staffId}
                      </p>
                    </td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-black text-slate-900">
                        AED {sale.amount}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {sale.paymentMethod}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={sale.status === "Completed" ? "success" : "danger"}>
                        {sale.status === "Completed" ? "SUCCESS" : "CANCELLED"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <Search size={48} />
                      <p className="font-bold text-slate-900">No transactions found</p>
                      <p className="text-xs text-slate-500 font-medium">
                        Try adjusting your horizontal filters
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total: {filteredSales.length} Entries
          </div>
          <div className="flex gap-2">
            <button
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-30"
              disabled
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-30"
              disabled
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const OwnerReportsSalesPage: React.FC = () => {
  return (
    <ProtectedPage role="Owner">
      <AppLayout>
        <OwnerReportsSalesView />
      </AppLayout>
    </ProtectedPage>
  );
};

export default OwnerReportsSalesPage;

