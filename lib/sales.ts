import type { Sale, ProductType, Network, PaymentMethod } from "../types";

export const createInvoiceId = (prefix: string) =>
  `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;

export const createSaleTimestamp = () => {
  const now = new Date();
  return {
    date: now.toISOString().split("T")[0],
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
};

export const generateRandomBarcode = () =>
  "8971" + Math.floor(100000000000000 + Math.random() * 900000000000000);


export const buildSaleRecord = (params: {
  idPrefix: string;
  staffName: string;
  staffId: string;
  productType: ProductType;
  network: Network;
  amount: number;
  paymentMethod: PaymentMethod;
  status: Sale["status"];
  simBarcode?: string;
  basePrice?: number;
  discountAmount?: number;
  sellingPrice?: number;
  vatAmount?: number;
  profit?: number;
  planName?: string;
  planCategory?: string;
  planSummary?: string;
}): Sale => {
  const { date, time } = createSaleTimestamp();
  const id = createInvoiceId(params.idPrefix);

  return {
    id,
    date,
    time,
    staff: params.staffName,
    staffId: params.staffId,
    productType: params.productType,
    network: params.network,
    amount: params.amount,
    paymentMethod: params.paymentMethod,
    simBarcode: params.simBarcode,
    status: params.status,
    basePrice: params.basePrice,
    discountAmount: params.discountAmount,
    sellingPrice: params.sellingPrice,
    vatAmount: params.vatAmount,
    profit: params.profit,
    planName: params.planName,
    planCategory: params.planCategory,
    planSummary: params.planSummary,
  };
};
