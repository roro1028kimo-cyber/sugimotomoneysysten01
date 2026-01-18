import { AppData, Vendor, Voucher } from "./types";
import { nanoid } from "nanoid";

const STORAGE_KEY = "accounting_system_data";

const defaultData: AppData = {
  vendors: [],
  vouchers: [],
};

export const getAppData = (): AppData => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : defaultData;
};

export const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Vendor Operations
export const getVendors = (): Vendor[] => {
  return getAppData().vendors;
};

export const addVendor = (vendor: Omit<Vendor, "id" | "createdAt">): Vendor => {
  const data = getAppData();
  const newVendor: Vendor = {
    ...vendor,
    id: nanoid(),
    createdAt: new Date().toISOString(),
  };
  data.vendors.push(newVendor);
  saveAppData(data);
  return newVendor;
};

export const updateVendor = (id: string, updates: Partial<Omit<Vendor, "id" | "createdAt">>): Vendor | null => {
  const data = getAppData();
  const index = data.vendors.findIndex((v) => v.id === id);
  if (index === -1) return null;
  
  const updatedVendor = { ...data.vendors[index], ...updates };
  data.vendors[index] = updatedVendor;
  saveAppData(data);
  return updatedVendor;
};

export const deleteVendor = (id: string): boolean => {
  const data = getAppData();
  // Check if vendor has vouchers
  const hasVouchers = data.vouchers.some(v => v.vendorId === id);
  if (hasVouchers) {
    throw new Error("無法刪除：該廠商尚有相關聯的憑證");
  }
  
  const initialLength = data.vendors.length;
  data.vendors = data.vendors.filter((v) => v.id !== id);
  saveAppData(data);
  return data.vendors.length < initialLength;
};

// Voucher Operations
export const getVouchers = (): Voucher[] => {
  return getAppData().vouchers;
};

export const addVoucher = (voucher: Omit<Voucher, "id" | "createdAt" | "status">): Voucher => {
  const data = getAppData();
  const newVoucher: Voucher = {
    ...voucher,
    id: nanoid(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  data.vouchers.push(newVoucher);
  saveAppData(data);
  return newVoucher;
};

export const updateVoucher = (id: string, updates: Partial<Omit<Voucher, "id" | "createdAt">>): Voucher | null => {
  const data = getAppData();
  const index = data.vouchers.findIndex((v) => v.id === id);
  if (index === -1) return null;

  const updatedVoucher = { ...data.vouchers[index], ...updates };
  data.vouchers[index] = updatedVoucher;
  saveAppData(data);
  return updatedVoucher;
};

export const deleteVoucher = (id: string): boolean => {
  const data = getAppData();
  const initialLength = data.vouchers.length;
  data.vouchers = data.vouchers.filter((v) => v.id !== id);
  saveAppData(data);
  return data.vouchers.length < initialLength;
};
