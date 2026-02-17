export type UserRole = 'Owner' | 'Staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type Network = 'Du' | 'Etisalat' | 'Virgin Mobile' | 'Other';
export type SIMStatus = 'Available' | 'Activated' | 'Corrupted';
export type ProductType = 'SIM Card' | 'Recharge' | 'Old SIM';
export type PaymentMethod = 'Cash' | 'Card' | 'Online';

export interface SIMCard {
  id: string;
  barcode: string;
  iccid: string;
  network: Network;
  status: SIMStatus;
  assignedStaff?: string;
  activationDate?: string;
  receivedDate: string;
  reason?: string;
  amount?: number;
}

export interface Sale {
  id: string;
  date: string;
  time: string;
  staff: string;
  staffId: string;
  productType: ProductType;
  network: Network;
  amount: number;
  paymentMethod: PaymentMethod;
  simBarcode?: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  basePrice?: number;
  discountAmount?: number;
  sellingPrice?: number;
  vatAmount?: number;
  profit?: number;
  planName?: string;
  planCategory?: string;
  planSummary?: string;
}

export interface StaffPerformance {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  todaySales: number;
  monthlySales: number;
  totalActivations: number;
  corruptedSIMs: number;
  successRate: number;
  status: 'Active' | 'Inactive';
}

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'Staff';
  avatar?: string;
}
