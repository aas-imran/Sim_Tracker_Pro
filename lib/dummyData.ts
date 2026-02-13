import { SIMCard, Sale, StaffPerformance, Network, SIMStatus, ProductType, PaymentMethod } from "../types";

const networks: Network[] = ["Du", "Etisalat", "Virgin Mobile"];
const staffNames = ["Ahmed Hassan", "Sarah Khan", "John Doe", "Fatima Al-Sayed", "Zubair Malik"];

export const mockStaff: StaffPerformance[] = [
  {
    id: "STF-001",
    name: "Ahmed Hassan",
    email: "ahmed@shop.com",
    phone: "+971-50-123-4567",
    role: "Sales Executive",
    avatar: "https://picsum.photos/seed/ahmed/200",
    todaySales: 1250,
    monthlySales: 15420,
    totalActivations: 145,
    corruptedSIMs: 3,
    successRate: 98,
    status: "Active",
  },
  {
    id: "STF-002",
    name: "Sarah Khan",
    email: "sarah@shop.com",
    phone: "+971-52-987-6543",
    role: "Senior Staff",
    avatar: "https://picsum.photos/seed/sarah/200",
    todaySales: 840,
    monthlySales: 12100,
    totalActivations: 112,
    corruptedSIMs: 1,
    successRate: 99.1,
    status: "Active",
  },
  {
    id: "STF-003",
    name: "Zubair Malik",
    email: "zubair@shop.com",
    phone: "+971-55-444-3333",
    role: "Sales Associate",
    avatar: "https://picsum.photos/seed/zubair/200",
    todaySales: 450,
    monthlySales: 8200,
    totalActivations: 88,
    corruptedSIMs: 5,
    successRate: 94.6,
    status: "Active",
  },
];

export const generateSIMs = (count: number): SIMCard[] => {
  return Array.from({ length: count }).map((_, i) => {
    const network = networks[Math.floor(Math.random() * networks.length)];
    const status: SIMStatus =
      Math.random() > 0.8 ? (Math.random() > 0.5 ? "Corrupted" : "Activated") : "Available";
    return {
      id: `SIM-${1000 + i}`,
      barcode: `8971${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`,
      iccid: `8971${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`,
      network,
      status,
      assignedStaff: status !== "Available" ? staffNames[Math.floor(Math.random() * staffNames.length)] : undefined,
      activationDate:
        status === "Activated"
          ? "2024-05-" + Math.floor(1 + Math.random() * 20).toString().padStart(2, "0")
          : undefined,
      receivedDate: "2024-04-15",
      reason:
        status === "Corrupted"
          ? ["SIM Damaged", "Network Issue", "Defective Chip"][Math.floor(Math.random() * 3)]
          : undefined,
      amount: status === "Activated" ? Math.floor(Math.random() * 100) + 25 : undefined,
    };
  });
};

export const generateSales = (count: number): Sale[] => {
  const products: ProductType[] = ["SIM Card", "Recharge", "Old SIM"];
  const methods: PaymentMethod[] = ["Cash", "Card", "Online"];

  return Array.from({ length: count }).map((_, i) => {
    const staff = mockStaff[Math.floor(Math.random() * mockStaff.length)];
    return {
      id: `INV-${5000 + i}`,
      date: `2024-05-${Math.floor(1 + Math.random() * 25)
        .toString()
        .padStart(2, "0")}`,
      time: `${Math.floor(9 + Math.random() * 12)}:${Math.floor(Math.random() * 60)
        .toString()
        .padStart(2, "0")} ${Math.random() > 0.5 ? "AM" : "PM"}`,
      staff: staff.name,
      staffId: staff.id,
      productType: products[Math.floor(Math.random() * products.length)],
      network: networks[Math.floor(Math.random() * networks.length)],
      amount: Math.floor(Math.random() * 500) + 10,
      paymentMethod: methods[Math.floor(Math.random() * methods.length)],
      simBarcode:
        Math.random() > 0.5
          ? `8971${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`
          : undefined,
      status: "Completed",
    };
  });
};

export const mockSIMs = generateSIMs(150);
export const mockSales = generateSales(60);

