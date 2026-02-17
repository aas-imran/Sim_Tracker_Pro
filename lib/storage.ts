"use client";

import { Sale, SIMCard, StaffPerformance, StaffAccount } from "../types";
import { mockSales, mockSIMs, mockStaff } from "./dummyData";

const SALES_KEY = "sim_tracker_sales";
const SIMS_KEY = "sim_tracker_sims";
const STAFF_KEY = "sim_tracker_staff";
const STAFF_ACCOUNTS_KEY = "sim_tracker_staff_accounts";

const isBrowser = typeof window !== "undefined";

export const initializeStorage = () => {
  if (!isBrowser) return;

  if (!localStorage.getItem(SALES_KEY)) {
    localStorage.setItem(SALES_KEY, JSON.stringify(mockSales));
  }
  if (!localStorage.getItem(SIMS_KEY)) {
    localStorage.setItem(SIMS_KEY, JSON.stringify(mockSIMs));
  }
  if (!localStorage.getItem(STAFF_KEY)) {
    localStorage.setItem(STAFF_KEY, JSON.stringify(mockStaff));
  }
  if (!localStorage.getItem(STAFF_ACCOUNTS_KEY)) {
    // Seed demo accounts for existing mock staff with default password
    const seedAccounts: StaffAccount[] = mockStaff.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      password: "staff123",
      role: "Staff",
      avatar: s.avatar,
    }));
    localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(seedAccounts));
  }
};

export const getSales = (): Sale[] => {
  if (!isBrowser) return [];
  initializeStorage();
  return JSON.parse(localStorage.getItem(SALES_KEY) || "[]");
};

export const getSIMs = (): SIMCard[] => {
  if (!isBrowser) return [];
  initializeStorage();
  return JSON.parse(localStorage.getItem(SIMS_KEY) || "[]");
};

export const saveSale = (sale: Sale) => {
  if (!isBrowser) return;
  const sales = getSales();
  localStorage.setItem(SALES_KEY, JSON.stringify([sale, ...sales]));
};

export const updateSIMStatus = (
  barcode: string,
  status: SIMCard["status"],
  reason?: string,
  staffName?: string
) => {
  if (!isBrowser) return;
  const sims = getSIMs();
  const updatedSims = sims.map((sim) => {
    if (sim.barcode === barcode || sim.iccid === barcode) {
      return {
        ...sim,
        status,
        reason,
        assignedStaff: staffName,
        activationDate:
          status === "Activated"
            ? new Date().toISOString().split("T")[0]
            : sim.activationDate,
      };
    }
    return sim;
  });
  localStorage.setItem(SIMS_KEY, JSON.stringify(updatedSims));
};

export const getStats = () => {
  const sales = getSales();
  const sims = getSIMs();

  const today = new Date().toISOString().split("T")[0];
  const todaySales = sales
    .filter((s) => s.date === today && s.status === "Completed")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const activeSims = sims.filter((s) => s.status === "Activated").length;
  const corruptedSims = sims.filter((s) => s.status === "Corrupted").length;

  return { todaySales, activeSims, corruptedSims, totalSales: sales.length };
};

export const getStaffPerformance = () => {
  if (!isBrowser) return [] as StaffPerformance[];
  const sales = getSales();
  const staff = JSON.parse(localStorage.getItem(STAFF_KEY) || "[]") as StaffPerformance[];

  return staff.map((s) => {
    const staffSales = sales.filter((sale) => sale.staffId === s.id);
    const activations = staffSales.filter(
      (sale) => sale.productType !== "Recharge" && sale.status === "Completed"
    ).length;
    const revenue = staffSales
      .filter((sale) => sale.status === "Completed")
      .reduce((acc, curr) => acc + curr.amount, 0);
    const corrupted = staffSales.filter((sale) => sale.status === "Cancelled").length;

    return {
      ...s,
      todaySales: revenue,
      totalActivations: activations,
      corruptedSIMs: corrupted,
      successRate:
        activations + corrupted > 0
          ? Math.round((activations / (activations + corrupted)) * 100)
          : 100,
    };
  });
};

export const getStaffAccounts = (): StaffAccount[] => {
  if (!isBrowser) return [];
  initializeStorage();
  return JSON.parse(localStorage.getItem(STAFF_ACCOUNTS_KEY) || "[]") as StaffAccount[];
};

export const saveStaffAccount = (account: StaffAccount) => {
  if (!isBrowser) return;
  const accounts = getStaffAccounts();
  const next = [...accounts.filter((a) => a.id !== account.id), account];
  localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(next));
};

export const findStaffAccountByEmail = (email: string): StaffAccount | undefined => {
  if (!isBrowser) return undefined;
  const accounts = getStaffAccounts();
  return accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
};


export const downloadCSV = <T extends Record<string, unknown>>(data: T[], filename: string) => {
  if (!isBrowser || data.length === 0) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((obj) => Object.values(obj).join(",")).join("\n");
  const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
