export interface Vendor {
  id: string;
  name: string;
  taxId: string;
  phone: string;
  bankAccount: string;
  contactPerson: string;
  createdAt: string;
}

export type VoucherStatus = 'pending' | 'completed' | 'void';

export interface Voucher {
  id: string;
  vendorId: string;
  amount: number;
  date: string;
  description: string;
  status: VoucherStatus;
  createdAt: string;
}

export interface AppData {
  vendors: Vendor[];
  vouchers: Voucher[];
}
