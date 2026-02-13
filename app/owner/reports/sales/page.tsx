// "use client";

// import React, { useState, useEffect } from "react";
// import { Search, Download, FileText, ChevronLeft, ChevronRight } from "lucide-react";
// import { Card } from "../../../../components/ui/Card";
// import { Badge } from "../../../../components/ui/Badge";
// import { AppLayout } from "../../../../components/AppLayout";
// import { ProtectedPage } from "../../../../components/ProtectedPage";
// import { getSales, downloadCSV } from "../../../../lib/storage";
// import type { Sale, ProductType, Network } from "../../../../types";

// const OwnerReportsSalesView: React.FC = () => {
//   const [sales, setSales] = useState<Sale[]>([]);
//   const [filteredSales, setFilteredSales] = useState<Sale[]>([]);

//   const [search, setSearch] = useState("");
//   const [typeFilter, setTypeFilter] = useState<ProductType | "All">("All");
//   const [networkFilter, setNetworkFilter] = useState<Network | "All">("All");
//   const [staffFilter, setStaffFilter] = useState<string>("All");

//   useEffect(() => {
//     const data = getSales();
//     setSales(data);
//     setFilteredSales(data);
//   }, []);

//   useEffect(() => {
//     let result = sales;

//     if (search) {
//       result = result.filter(
//         (s) =>
//           s.id.toLowerCase().includes(search.toLowerCase()) ||
//           s.staff.toLowerCase().includes(search.toLowerCase()) ||
//           s.simBarcode?.includes(search)
//       );
//     }

//     if (typeFilter !== "All") {
//       result = result.filter((s) => s.productType === typeFilter);
//     }

//     if (networkFilter !== "All") {
//       result = result.filter((s) => s.network === networkFilter);
//     }

//     if (staffFilter !== "All") {
//       result = result.filter((s) => s.staff === staffFilter);
//     }

//     setFilteredSales(result);
//   }, [search, typeFilter, networkFilter, staffFilter, sales]);

//   const handleExport = () => {
//     const exportData = filteredSales.map((s) => ({
//       Invoice: s.id,
//       Date: s.date,
//       Time: s.time,
//       Staff: s.staff,
//       Type: s.productType,
//       Network: s.network,
//       Amount: s.amount,
//       Method: s.paymentMethod,
//       Barcode: s.simBarcode || "N/A",
//       Status: s.status,
//     }));
//     downloadCSV(
//       exportData,
//       `Sales_Report_${new Date().toISOString().split("T")[0]}.csv`
//     );
//   };

//   const staffNames = Array.from(new Set(sales.map((s) => s.staff)));

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
//             Sales Intelligence
//           </h1>
//           <p className="text-slate-500 font-medium">
//             Detailed transaction auditing and reporting.
//           </p>
//         </div>
//       </div>

//       <Card className="p-4 shadow-sm border-slate-200">
//         <div className="flex flex-col lg:flex-row items-end lg:items-center gap-4">
//           <div className="w-full lg:w-64">
//             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
//               Search
//             </label>
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Invoice, Staff, SIM..."
//                 className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//               />
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
//             </div>
//           </div>

//           <div className="w-full lg:w-48">
//             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
//               Type
//             </label>
//             <select
//               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-sm font-medium"
//               value={typeFilter}
//               onChange={(e) => setTypeFilter(e.target.value as any)}
//             >
//               <option value="All">All Services</option>
//               <option value="SIM Card">New Activation</option>
//               <option value="Recharge">Recharge</option>
//               <option value="Old SIM">Replacement</option>
//             </select>
//           </div>

//           <div className="w-full lg:w-48">
//             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
//               Staff
//             </label>
//             <select
//               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-sm font-medium"
//               value={staffFilter}
//               onChange={(e) => setStaffFilter(e.target.value)}
//             >
//               <option value="All">All Staff</option>
//               {staffNames.map((name) => (
//                 <option key={name} value={name}>
//                   {name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="w-full lg:flex-1">
//             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
//               Network
//             </label>
//             <div className="flex flex-wrap gap-2">
//               {["All", "Du", "Etisalat", "Virgin Mobile"].map((net) => (
//                 <button
//                   key={net}
//                   onClick={() => setNetworkFilter(net as any)}
//                   className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border uppercase tracking-wider ${
//                     networkFilter === net
//                       ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
//                       : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
//                   }`}
//                 >
//                   {net}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="w-full lg:w-auto pt-4 lg:pt-0">
//             <button
//               onClick={handleExport}
//               className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
//             >
//               <Download size={16} />
//               Export CSV
//             </button>
//           </div>
//         </div>
//       </Card>

//       <Card className="p-0 overflow-hidden shadow-sm border-slate-200">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
//                 <th className="px-6 py-4">Transaction Details</th>
//                 <th className="px-6 py-4">Staff Member</th>
//                 <th className="px-6 py-4">Carrier</th>
//                 <th className="px-6 py-4 text-right">Amount</th>
//                 <th className="px-6 py-4 text-center">Status</th>
//                 <th className="px-6 py-4 text-right">Invoice</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-50">
//               {filteredSales.length > 0 ? (
//                 filteredSales.map((sale) => (
//                   <tr
//                     key={sale.id}
//                     className="hover:bg-slate-50/50 transition-colors group"
//                   >
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
//                           <FileText size={16} />
//                         </div>
//                         <div>
//                           <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
//                             {sale.productType}
//                           </p>
//                           <p className="text-[10px] font-bold text-slate-400 uppercase">
//                             {sale.date} • {sale.time}
//                           </p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className="text-sm font-medium text-slate-700">{sale.staff}</p>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase">
//                         ID: {sale.staffId}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4">
//                       <Badge
//                         variant={
//                           sale.network === "Du"
//                             ? "info"
//                             : sale.network === "Etisalat"
//                             ? "success"
//                             : "danger"
//                         }
//                       >
//                         {sale.network}
//                       </Badge>
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <p className="text-sm font-black text-slate-900">
//                         AED {sale.amount}
//                       </p>
//                       <p className="text-[10px] font-bold text-slate-400 uppercase">
//                         {sale.paymentMethod}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4 text-center">
//                       <Badge variant={sale.status === "Completed" ? "success" : "danger"}>
//                         {sale.status === "Completed" ? "SUCCESS" : "CANCELLED"}
//                       </Badge>
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
//                         <Download size={16} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={6} className="px-6 py-20 text-center">
//                     <div className="flex flex-col items-center gap-2 opacity-30">
//                       <Search size={48} />
//                       <p className="font-bold text-slate-900">No transactions found</p>
//                       <p className="text-xs text-slate-500 font-medium">
//                         Try adjusting your horizontal filters
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
//           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
//             Total: {filteredSales.length} Entries
//           </div>
//           <div className="flex gap-2">
//             <button
//               className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-30"
//               disabled
//             >
//               <ChevronLeft size={16} />
//             </button>
//             <button
//               className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-30"
//               disabled
//             >
//               <ChevronRight size={16} />
//             </button>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// const OwnerReportsSalesPage: React.FC = () => {
//   return (
//     <ProtectedPage role="Owner">
//       <AppLayout>
//         <OwnerReportsSalesView />
//       </AppLayout>
//     </ProtectedPage>
//   );
// };

// export default OwnerReportsSalesPage;









































"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Printer,
  ShieldCheck,
  Smartphone,
  CreditCard,
  FileDown,
  Hash,
  Files,
  ClipboardList,
  Loader2,
} from "lucide-react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { Card } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import { AppLayout } from "../../../../components/AppLayout";
import { ProtectedPage } from "../../../../components/ProtectedPage";

import { getSales, downloadCSV } from "../../../../lib/storage";
import type { Sale, ProductType, Network } from "../../../../types";

/* -------------------------------------------------------------------------- */
/*                                PAGE VIEW                                   */
/* -------------------------------------------------------------------------- */

const OwnerReportsSalesView: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);

  const [activeInvoice, setActiveInvoice] = useState<Sale | null>(null);
  const [showBulkInvoice, setShowBulkInvoice] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductType | "All">("All");
  const [networkFilter, setNetworkFilter] = useState<Network | "All">("All");
  const [staffFilter, setStaffFilter] = useState<string>("All");

  /* ------------------------------- DATA LOAD ------------------------------- */
  useEffect(() => {
    const data = getSales();
    setSales(data);
    setFilteredSales(data);
  }, []);

  /* ------------------------------- FILTERING ------------------------------- */
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

  /* ------------------------------- CSV EXPORT ------------------------------ */
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

  /* ------------------------------- PDF EXPORT ------------------------------ */
  const handleDownloadPDF = async () => {
    const element = document.getElementById("printable-invoice");
    if (!element) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save(
        activeInvoice
          ? `Invoice_${activeInvoice.id}.pdf`
          : `Bulk_Report_${Date.now()}.pdf`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const staffNames = Array.from(new Set(sales.map((s) => s.staff)));
  const totalBulkAmount = filteredSales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sales Intelligence</h1>
          <p className="text-slate-500 font-medium">Retail transaction auditing and document generation.</p>
        </div>
      </div>

      {/* Horizontal Filter Bar */}
      <Card className="p-4 shadow-sm border-slate-200">
        <div className="flex flex-col lg:flex-row items-end lg:items-center gap-4">
          <div className="w-full lg:w-64">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 px-1">Global Search</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search Invoice/Staff/SIM..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-black text-slate-900 placeholder:text-slate-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            </div>
          </div>

          <div className="w-full lg:w-48">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 px-1">Service Type</label>
            <select 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-sm font-black text-slate-900"
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 px-1">Filter Staff</label>
            <select 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-sm font-black text-slate-900"
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
            >
              <option value="All">All Staff Terminals</option>
              {staffNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          <div className="w-full lg:flex-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 px-1">Network</label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Du', 'Etisalat', 'Virgin Mobile'].map(net => (
                <button 
                  key={net}
                  onClick={() => setNetworkFilter(net as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border uppercase tracking-wider ${networkFilter === net ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-auto flex flex-col gap-2 pt-4 lg:pt-0">
            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 whitespace-nowrap"
            >
              <Download size={14} />
              Export CSV
            </button>
            <button 
              onClick={() => setShowBulkInvoice(true)}
              disabled={filteredSales.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Files size={14} />
              Bulk Invoice
            </button>
          </div>
        </div>
      </Card>

      {/* Table Section */}
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
              {filteredSales.length > 0 ? filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${sale.productType === 'SIM Card' ? 'bg-blue-50 text-blue-600' : (sale.productType === 'Recharge' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600')}`}>
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{sale.productType}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{sale.date} • {sale.time}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-700">{sale.staff}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">ID: {sale.staffId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={sale.network === 'Du' ? 'info' : sale.network === 'Etisalat' ? 'success' : 'danger'}>
                      {sale.network}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-black text-slate-900">AED {sale.amount}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{sale.paymentMethod}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={sale.status === 'Completed' ? 'success' : 'danger'}>
                      {sale.status === 'Completed' ? 'SUCCESS' : 'CANCELLED'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button 
                       onClick={() => setActiveInvoice(sale)}
                       className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
                     >
                        <FileDown size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Generate</span>
                     </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                     <div className="flex flex-col items-center gap-2 opacity-30">
                        <Search size={48} />
                        <p className="font-bold text-slate-900 uppercase">No records found</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Universal Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-invoice, #printable-invoice * { visibility: visible; }
          #printable-invoice { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 210mm; 
            margin: 0; 
            padding: 10mm !important;
            background: white;
            box-shadow: none;
            overflow: visible !important;
          }
          .no-print { display: none !important; }
          @page { size: A4; margin: 0; }
          table { width: 100% !important; page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
      `}</style>

      {/* Single & Bulk Invoice Modal Overlay */}
      {(activeInvoice || showBulkInvoice) && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 print:p-0">
          <div className="w-full max-w-[210mm] bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[95vh] no-print">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
               <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${showBulkInvoice ? 'bg-slate-900' : 'bg-blue-600'}`}>
                    {showBulkInvoice ? <ClipboardList size={18} /> : <ShieldCheck size={18} />}
                  </div>
                  <span className="font-black text-slate-900 uppercase tracking-tight text-sm">
                    {showBulkInvoice ? 'Bulk Transaction Report' : 'Invoice Terminal Hub'}
                  </span>
               </div>
               <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/10 active:scale-95 transition-all disabled:opacity-50"
                  >
                     {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                     Download PDF
                  </button>
                  <button 
                    onClick={() => { window.print(); }}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-all"
                  >
                     <Printer size={18} />
                  </button>
                  <button 
                    onClick={() => { setActiveInvoice(null); setShowBulkInvoice(false); }}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-all"
                  >
                     <X size={18} />
                  </button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-100 p-8 flex justify-center no-print">
              <div id="printable-invoice" className="bg-white p-12 w-[210mm] min-h-[297mm] shadow-lg flex flex-col h-fit">
                 
                 {/* Compact Header */}
                 <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                    <div className="space-y-4">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-lg">S</div>
                          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">SIM TRACKER <span className="text-blue-600">PRO</span></h1>
                       </div>
                       <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                          <p>DUBAI RETAIL DISTRICT, UAE</p>
                          <p>CONTACT: +971 4 000 0000</p>
                          <p>TRN: 100349283400003</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">
                          {showBulkInvoice ? 'BULK REPORT' : 'INVOICE'}
                       </h2>
                       <p className="text-sm font-black text-blue-600 font-mono">
                          {showBulkInvoice ? `BATCH-${new Date().getTime().toString().slice(-6)}` : activeInvoice?.id}
                       </p>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                          Generated: {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
                       </p>
                    </div>
                 </div>

                 {/* Minimal Metadata Grid (Only for single invoice) */}
                 {!showBulkInvoice && activeInvoice && (
                   <div className="grid grid-cols-3 gap-6 mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Terminal Staff</p>
                         <p className="text-xs font-black text-slate-900 uppercase">{activeInvoice.staff}</p>
                         <p className="text-[9px] font-bold text-slate-500 uppercase leading-none mt-1">ID: {activeInvoice.staffId}</p>
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Type</p>
                         <div className="flex items-center gap-1.5">
                            <CreditCard size={10} className="text-slate-400" />
                            <p className="text-xs font-black text-slate-900 uppercase">{activeInvoice.paymentMethod}</p>
                         </div>
                         <p className="text-[9px] font-bold text-slate-500 uppercase leading-none mt-1">Processed: Success</p>
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Carrier Network</p>
                         <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${activeInvoice.network === 'Du' ? 'bg-blue-600' : activeInvoice.network === 'Etisalat' ? 'bg-emerald-600' : 'bg-rose-600'}`}></div>
                            <p className="text-xs font-black text-slate-900 uppercase">{activeInvoice.network}</p>
                         </div>
                         <p className="text-[9px] font-bold text-slate-500 uppercase leading-none mt-1">Status: Active</p>
                      </div>
                   </div>
                 )}

                 {/* Table Content */}
                 <div className="flex-1">
                    <table className="w-full">
                       <thead>
                          <tr className="border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                             <th className="py-4 text-left">{showBulkInvoice ? 'Transaction Details' : 'Service/Item Description'}</th>
                             <th className="py-4 text-center">{showBulkInvoice ? 'Staff' : 'Qty'}</th>
                             <th className="py-4 text-right">{showBulkInvoice ? 'Carrier' : 'Rate'}</th>
                             <th className="py-4 text-right">{showBulkInvoice ? 'Status' : 'Total'}</th>
                             {showBulkInvoice && <th className="py-4 text-right px-2">Amount</th>}
                       </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {showBulkInvoice ? (
                            filteredSales.map((sale) => (
                              <tr key={sale.id}>
                                <td className="py-4">
                                  <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{sale.productType}</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{sale.id} • {sale.date}</p>
                                </td>
                                <td className="py-4 text-center text-[10px] font-black text-slate-700 uppercase">{sale.staff.split(' ')[0]}</td>
                                <td className="py-4 text-right text-[10px] font-black text-slate-700 uppercase">{sale.network}</td>
                                <td className="py-4 text-right">
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${sale.status === 'Completed' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-rose-200 text-rose-600 bg-rose-50'}`}>
                                    {sale.status === 'Completed' ? 'SUCCESS' : 'CANCELLED'}
                                  </span>
                                </td>
                                <td className="py-4 text-right text-[10px] font-black text-slate-900">AED {sale.amount.toFixed(2)}</td>
                              </tr>
                            ))
                          ) : activeInvoice && (
                            <tr>
                               <td className="py-6">
                                  <p className="text-xs font-black text-slate-900 uppercase">{activeInvoice.productType}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                     <Hash size={10} className="text-slate-400" />
                                     <p className="text-[9px] font-bold text-slate-500 font-mono">
                                        {activeInvoice.simBarcode || 'DIGITAL-TX-VOUCHER'}
                                     </p>
                                  </div>
                               </td>
                               <td className="py-6 text-center text-xs font-black">1.00</td>
                               <td className="py-6 text-right text-xs font-black">AED {(activeInvoice.amount * 0.952).toFixed(2)}</td>
                               <td className="py-6 text-right text-xs font-black text-slate-900">AED {(activeInvoice.amount * 0.952).toFixed(2)}</td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>

                 {/* Compact Totals */}
                 <div className="border-t-2 border-slate-100 pt-8 mt-10">
                    <div className="flex justify-end">
                       <div className="w-56 space-y-2">
                          {showBulkInvoice && (
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                               <span>Entries Count</span>
                               <span className="text-slate-900 font-black">{filteredSales.length} TXs</span>
                            </div>
                          )}
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                             <span>Subtotal (Net)</span>
                             <span className="text-slate-900 font-black">
                                AED {(showBulkInvoice ? totalBulkAmount * 0.9523 : activeInvoice ? activeInvoice.amount * 0.9523 : 0).toFixed(2)}
                             </span>
                          </div>
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                             <span>VAT (5%)</span>
                             <span className="text-slate-900 font-black">
                                AED {(showBulkInvoice ? totalBulkAmount * 0.0477 : activeInvoice ? activeInvoice.amount * 0.0477 : 0).toFixed(2)}
                             </span>
                          </div>
                          <div className="pt-4 border-t border-slate-900 flex justify-between items-center">
                             <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">Total Amount</span>
                             <span className="text-xl font-black text-blue-600 tracking-tighter">
                                AED {(showBulkInvoice ? totalBulkAmount : activeInvoice?.amount || 0).toFixed(2)}
                             </span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Minimal Footer */}
                 <div className="pt-12 mt-auto flex justify-between items-end border-t border-slate-50">
                    <div className="max-w-[300px] space-y-4">
                       <div className="flex items-center gap-3">
                          <Smartphone size={24} className="text-slate-100" />
                          <p className="text-[8px] font-bold text-slate-400 uppercase leading-relaxed italic">
                             {showBulkInvoice 
                               ? 'This is a bulk transaction summary generated for retail audit. TRN: 100349283400003' 
                               : 'This document is electronically verified via SIM Tracker Pro. No physical signature is required. TRN 100349283400003'
                             }
                          </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="w-40 border-b border-slate-300 mb-2 ml-auto"></div>
                       <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Store Manager Auth</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




export default function OwnerReportsSalesPage() {
  return (
    <ProtectedPage role="Owner">
      <AppLayout>
        <OwnerReportsSalesView />
      </AppLayout>
    </ProtectedPage>
  );
}