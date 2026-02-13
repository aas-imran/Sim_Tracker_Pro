"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Smartphone,
  Wifi,
  Cpu,
  CreditCard,
  Banknote,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Scan,
  Keyboard,
  AlertTriangle,
  Camera,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { useAuth } from "../../../lib/store";
import { saveSale, updateSIMStatus } from "../../../lib/storage";
import type { Sale, ProductType, Network, PaymentMethod } from "../../../types";
import { AppLayout } from "../../../components/AppLayout";
import { ProtectedPage } from "../../../components/ProtectedPage";

const StaffSaleView: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [step, setStep] = useState(1);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const queryType = searchParams.get("type") as ProductType | null;

  const [formData, setFormData] = useState<{
    type: ProductType | "";
    network: Network | "";
    amount: string;
    method: PaymentMethod;
    barcode: string;
  }>({
    type: (queryType || "") as ProductType | "",
    network: "" as Network | "",
    amount: "",
    method: "Cash",
    barcode: "",
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [isCorrupted, setIsCorrupted] = useState(false);

  useEffect(() => {
    if (queryType && step === 1) {
      setStep(2);
    }
  }, [queryType, step]);

  const nextStep = () => setStep((prev) => prev + 1);

  const prevStep = () => {
    if (step === 1 || (step === 2 && queryType)) {
      router.push("/staff/dashboard");
      return;
    }

    if (step === 5 && formData.type === "Recharge") {
      setStep(2);
    } else if (step === 3 && (formData.type === "SIM Card" || formData.type === "Old SIM")) {
      setStep(2);
    } else {
      setStep((prev) => prev - 1);
    }
  };

  useEffect(() => {
    const isSimPath = formData.type === "SIM Card" || formData.type === "Old SIM";
    if (step === 3 && isSimPath) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step, formData.type]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleSelectType = (type: ProductType) => {
    setFormData((prev) => ({ ...prev, type }));
    nextStep();
  };

  const handleSIMDecision = (decision: "Activate" | "Corrupt") => {
    if (decision === "Corrupt") {
      submitTransaction("Corrupted");
    } else {
      nextStep();
    }
  };

  const submitTransaction = (finalStatus: "Completed" | "Corrupted") => {
    const saleStatus: Sale["status"] = finalStatus === "Corrupted" ? "Cancelled" : "Completed";

    const newSale: Sale = {
      id: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      staff: user?.name || "Staff",
      staffId: user?.id || "STF-001",
      productType: formData.type as ProductType,
      network: (formData.network || "Other") as Network,
      amount: parseFloat(formData.amount) || 0,
      paymentMethod: formData.method,
      simBarcode: formData.barcode || undefined,
      status: saleStatus,
    };

    saveSale(newSale);

    if (formData.type !== "Recharge" && formData.barcode) {
      updateSIMStatus(
        formData.barcode,
        finalStatus === "Corrupted" ? "Corrupted" : "Activated",
        finalStatus === "Corrupted" ? "Hardware Failure during setup" : undefined,
        user?.name
      );
    }

    if (finalStatus === "Corrupted") {
      setIsCorrupted(true);
    } else {
      setIsSuccess(true);
    }

    setTimeout(() => {
      router.push("/staff/dashboard");
    }, 2000);
  };

  if (isSuccess || isCorrupted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center ${
            isCorrupted
              ? "bg-rose-100 text-rose-600 shadow-lg shadow-rose-100"
              : "bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-100"
          }`}
        >
          {isCorrupted ? (
            <AlertTriangle size={64} />
          ) : (
            <CheckCircle2 size={64} className="animate-bounce" />
          )}
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            {isCorrupted ? "Marked Corrupted" : "Success!"}
          </h2>
          <p className="text-slate-500 mt-2">
            {isCorrupted
              ? "SIM has been recorded as damaged and inventory updated."
              : "Action completed and logged to your history."}
          </p>
        </div>
        <Badge variant={isCorrupted ? "danger" : "success"}>
          {isCorrupted ? "Terminal Log: Corrupted" : "Terminal Log: Completed"}
        </Badge>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between px-4">
        <button
          onClick={prevStep}
          className="p-2 text-slate-500 hover:bg-white rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 w-8 rounded-full transition-all ${
                step >= s ? "bg-blue-600" : "bg-slate-200"
              }`}
            ></div>
          ))}
        </div>

        <div className="w-10" />
      </div>

      {step === 1 && (
        <div className="space-y-6 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">Choose Action</h2>
            <p className="text-slate-500">
              Select the service category for this terminal session
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[
              {
                id: "SIM Card",
                icon: Smartphone,
                label: "Activate New SIM",
                desc: "Process a fresh SIM activation",
              },
              {
                id: "Recharge",
                icon: Wifi,
                label: "Mobile Recharge",
                desc: "Add credit to an existing account",
              },
              {
                id: "Old SIM",
                icon: Cpu,
                label: "Replace SIM Card",
                desc: "SIM swap or replacement service",
              },
            ].map((item) => (
              <Card
                key={item.id}
                onClick={() => handleSelectType(item.id as ProductType)}
                className="hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer flex items-center gap-6 p-8 group"
              >
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <item.icon size={32} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-slate-900">{item.label}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
                <ChevronRight className="ml-auto text-slate-300" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">Select Carrier</h2>
            <p className="text-slate-500">Provider for {formData.type}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: "Du", color: "bg-blue-600" },
              { id: "Etisalat", color: "bg-emerald-600" },
              { id: "Virgin Mobile", color: "bg-rose-600" },
            ].map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, network: n.id as Network }));
                  if (formData.type === "Recharge") {
                    setStep(5);
                  } else {
                    nextStep();
                  }
                }}
                className={`${n.color} text-white p-10 rounded-2xl font-bold text-xl shadow-lg transition-all active:scale-95 hover:brightness-110`}
              >
                {n.id}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (formData.type === "SIM Card" || formData.type === "Old SIM") && (
        <div className="space-y-6 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">SIM Scanner</h2>
            <p className="text-slate-500">Position the ICCID barcode clearly</p>
          </div>

          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center border-4 border-emerald-500/30 rounded-[2rem] m-6 pointer-events-none">
              <div className="w-full h-1 bg-emerald-500 absolute animate-[scan_2s_infinite]" />
            </div>
            {!stream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4 bg-slate-900/90">
                <Camera size={48} className="animate-pulse text-blue-400" />
                <p className="font-bold">Opening Lens...</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, barcode: e.target.value }))
                }
                placeholder="ICCID Barcode"
                className="flex-1 px-4 py-4 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 outline-none font-mono text-lg font-bold"
              />
              <button
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    barcode:
                      "8971" +
                      Math.floor(100000000000000 + Math.random() * 900000000000000),
                  }))
                }
                className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg hover:bg-emerald-600 transition-colors"
              >
                <Keyboard size={24} />
              </button>
            </div>
          </div>

          <button
            disabled={!formData.barcode}
            onClick={nextStep}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 disabled:bg-slate-200"
          >
            Confirm Barcode
          </button>

          <style>{`@keyframes scan { 0% { top: 10%; } 50% { top: 90%; } 100% { top: 10%; } }`}</style>
        </div>
      )}

      {step === 4 && (formData.type === "SIM Card" || formData.type === "Old SIM") && (
        <div className="space-y-6 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">SIM Quality Check</h2>
            <p className="text-slate-500">Is the SIM functioning correctly?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleSIMDecision("Activate")}
              className="p-8 bg-emerald-50 border-2 border-emerald-500 rounded-3xl flex flex-col items-center gap-3 transition-all hover:bg-emerald-100 active:scale-95"
            >
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <span className="font-bold text-emerald-700 text-lg">Activate Successfully</span>
            </button>

            <button
              onClick={() => handleSIMDecision("Corrupt")}
              className="p-8 bg-rose-50 border-2 border-rose-500 rounded-3xl flex flex-col items-center gap-3 transition-all hover:bg-rose-100 active:scale-95"
            >
              <div className="w-16 h-16 bg-rose-500 text-white rounded-full flex items-center justify-center">
                <AlertTriangle size={32} />
              </div>
              <span className="font-bold text-rose-700 text-lg">Mark as Corrupted</span>
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">Sale Processing</h2>
            <p className="text-slate-500">Enter payment details for {formData.type}</p>
          </div>
          <Card className="space-y-6 p-8 border-slate-200">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">
                Amount (AED)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                className="w-full text-4xl font-black text-slate-900 px-4 py-6 bg-slate-50 border-transparent border focus:bg-white focus:border-blue-500 rounded-3xl outline-none"
                placeholder="0.00"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">
                Payment Source
              </label>
              <div className="flex gap-2">
                {["Cash", "Card", "Online"].map((m) => (
                  <button
                    key={m}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, method: m as PaymentMethod }))
                    }
                    className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 transition-all ${
                      formData.method === m
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                    }`}
                  >
                    {m === "Cash" ? <Banknote size={18} /> : <CreditCard size={18} />}
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!formData.amount}
              onClick={() => submitTransaction("Completed")}
              className="w-full py-5 bg-blue-600 text-white rounded-3xl font-bold text-xl shadow-2xl shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:bg-slate-200 disabled:shadow-none"
            >
              Complete Sale
            </button>
          </Card>
        </div>
      )}
    </div>
  );
};

const StaffSalePage: React.FC = () => {
  return (
    <ProtectedPage role="Staff">
      <AppLayout>
        <StaffSaleView />
      </AppLayout>
    </ProtectedPage>
  );
};

export default StaffSalePage;

