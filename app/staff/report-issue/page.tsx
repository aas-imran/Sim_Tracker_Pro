"use client";

import React, { useState, useRef, useEffect } from "react";
import { Smartphone, Keyboard, ArrowLeft, CheckCircle2, Package, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { useAuth } from "../../../lib/store";
import { updateSIMStatus, saveSale } from "../../../lib/storage";
import { createInvoiceId, createSaleTimestamp, generateRandomBarcode } from "../../../lib/sales";
import { AppLayout } from "../../../components/AppLayout";
import { ProtectedPage } from "../../../components/ProtectedPage";

type ReportCategory = "SIM" | "Technical" | "Inventory" | "";

const StaffReportIssueView: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [step, setStep] = useState(1);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const [report, setReport] = useState<{
    category: ReportCategory;
    reason: string;
    barcode: string;
    notes: string;
  }>({
    category: "",
    reason: "",
    barcode: "",
    notes: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleSubmit = () => {
    if (report.category === "SIM" && report.barcode) {
      updateSIMStatus(
        report.barcode,
        "Corrupted",
        report.reason + (report.notes ? `: ${report.notes}` : ""),
        user?.name
      );

      const { date, time } = createSaleTimestamp();

      saveSale({
        id: createInvoiceId("ERR"),
        date,
        time,
        staff: user?.name || "Staff",
        staffId: user?.id || "STF-001",
        productType: "SIM Card",
        network: "Other",
        amount: 0,
        paymentMethod: "Cash",
        simBarcode: report.barcode,
        status: "Cancelled",
      });
    }

    setIsSubmitted(true);
    setTimeout(() => router.push("/staff/dashboard"), 2500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-rose-100">
          <CheckCircle2 size={64} className="animate-bounce" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Report Submitted</h2>
          <p className="text-slate-500 mt-2">
            The owner has been notified of this issue.
          </p>
        </div>
        <Badge variant="danger">URGENCY: LOGGED</Badge>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4">
      <div className="flex items-center justify-between">
        {step > 1 ? (
          <button
            onClick={() => {
              if (step === 2 && report.category === "SIM") {
                stopCamera();
              }
              setStep(step - 1);
            }}
            className="p-2 text-slate-500 hover:bg-white rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
          Report Issue
        </h1>
        <div className="w-10" />
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-slate-500 font-medium">
              What type of problem are you facing?
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[
              {
                id: "SIM",
                icon: Smartphone,
                label: "SIM Card Fault",
                desc: "Hardware damage, activation failure, or unreadable code",
              },
              {
                id: "Technical",
                icon: Cpu,
                label: "Terminal Error",
                desc: "System glitch, slow performance, or UI bug",
              },
              {
                id: "Inventory",
                icon: Package,
                label: "Stock Issue",
                desc: "Missing SIM batches or low recharge stock",
              },
            ].map((cat) => (
              <Card
                key={cat.id}
                onClick={() => {
                  setReport((prev) => ({ ...prev, category: cat.id as ReportCategory }));
                  setStep(2);
                  if (cat.id === "SIM") {
                    startCamera();
                  } else {
                    stopCamera();
                  }
                }}
                className="hover:ring-2 hover:ring-rose-500 transition-all p-6 group"
              >
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <cat.icon size={32} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-slate-900">{cat.label}</h3>
                    <p className="text-sm text-slate-500">{cat.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {step === 2 && report.category === "SIM" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">Scan Problem SIM</h2>
          </div>
          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border-4 border-rose-500/20">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-4 border-rose-500/30 rounded-[2rem] m-6 pointer-events-none">
              <div className="w-full h-1 bg-rose-500 absolute animate-[scan_2s_infinite]" />
            </div>
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold bg-slate-900">
                Camera Off
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter ICCID manually"
              className="flex-1 px-4 py-4 rounded-2xl border border-slate-200 focus:border-rose-500 font-mono font-bold"
              value={report.barcode}
              onChange={(e) =>
                setReport((prev) => ({ ...prev, barcode: e.target.value }))
              }
            />
            <button
              onClick={() =>
                setReport((prev) => ({
                  ...prev,
                  barcode: generateRandomBarcode(),
                }))
              }
              className="p-4 bg-slate-900 text-white rounded-2xl"
            >
              <Keyboard size={24} />
            </button>
          </div>
          <button
            disabled={!report.barcode}
            onClick={() => {
              if (report.category === "SIM") {
                stopCamera();
              }
              setStep(3);
            }}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold disabled:bg-slate-200"
          >
            Continue to Details
          </button>
          <style>{`@keyframes scan { 0% { top: 10%; } 50% { top: 90%; } 100% { top: 10%; } }`}</style>
        </div>
      )}

      {step === 2 && report.category !== "SIM" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">Describe the Issue</h2>
            <p className="text-slate-500">How can the owner help fix this?</p>
          </div>
          <textarea
            className="w-full h-40 p-6 rounded-3xl border border-slate-200 focus:border-blue-500 outline-none font-medium"
            placeholder="Explain what happened..."
            value={report.notes}
            onChange={(e) =>
              setReport((prev) => ({ ...prev, notes: e.target.value }))
            }
          />
          <button
            onClick={handleSubmit}
            className="w-full py-5 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-100"
          >
            Submit Report
          </button>
        </div>
      )}

      {step === 3 && report.category === "SIM" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">SIM Details</h2>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="bg-rose-50 p-6 border-b border-rose-100">
              <p className="text-[10px] font-black text-rose-600 uppercase mb-1 tracking-widest">
                Reporting SIM
              </p>
              <p className="text-xl font-mono font-bold text-slate-900">
                {report.barcode}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                  Select Reason
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Physical Damage",
                    "Activation Failed",
                    "Already Activated",
                    "Wrong Package",
                    "Customer Returned",
                  ].map((r) => (
                    <button
                      key={r}
                      onClick={() =>
                        setReport((prev) => ({ ...prev, reason: r }))
                      }
                      className={`w-full py-3 px-4 rounded-xl text-left font-bold text-sm transition-all border-2 ${
                        report.reason === r
                          ? "bg-rose-50 border-rose-500 text-rose-600"
                          : "bg-white border-slate-50 text-slate-500"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                  Additional Notes
                </label>
                <textarea
                  className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none min-h-[100px]"
                  placeholder="Anything else owner should know?"
                  value={report.notes}
                  onChange={(e) =>
                    setReport((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
            </div>
          </Card>
          <button
            disabled={!report.reason}
            onClick={handleSubmit}
            className="w-full py-5 bg-rose-600 text-white rounded-2xl font-bold shadow-xl shadow-rose-200 disabled:bg-slate-200"
          >
            Confirm &amp; Report SIM
          </button>
        </div>
      )}
    </div>
  );
};

const StaffReportIssuePage: React.FC = () => {
  return (
    <ProtectedPage role="Staff">
      <AppLayout>
        <StaffReportIssueView />
      </AppLayout>
    </ProtectedPage>
  );
};

export default StaffReportIssuePage;
