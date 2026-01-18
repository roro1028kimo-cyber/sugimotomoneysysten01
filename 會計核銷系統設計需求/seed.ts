import { addVendor, addVoucher } from "./storage";
import { format, subDays } from "date-fns";

export const seedData = () => {
  // Clear existing data (optional, but good for reset)
  localStorage.clear();

  // Add Vendors
  const v1 = addVendor({
    name: "台灣積體電路製造股份有限公司",
    taxId: "22099131",
    phone: "03-563-6688",
    bankAccount: "000-12345678901234",
    contactPerson: "張忠謀",
  });

  const v2 = addVendor({
    name: "中華電信股份有限公司",
    taxId: "96979933",
    phone: "0800-080-123",
    bankAccount: "004-98765432109876",
    contactPerson: "郭水義",
  });

  const v3 = addVendor({
    name: "PChome 網路家庭",
    taxId: "16606102",
    phone: "02-2700-0898",
    bankAccount: "822-11223344556677",
    contactPerson: "詹宏志",
  });

  // Add Vouchers
  addVoucher({
    vendorId: v1.id,
    amount: 150000,
    date: format(subDays(new Date(), 2), "yyyy-MM-dd"),
    description: "Q4 晶圓測試設備維護費",
  });

  addVoucher({
    vendorId: v2.id,
    amount: 3500,
    date: format(subDays(new Date(), 5), "yyyy-MM-dd"),
    description: "12月份公司網路費用",
  });

  addVoucher({
    vendorId: v3.id,
    amount: 12800,
    date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
    description: "辦公室文具與耗材採購",
  });
  
  // Reload page to reflect changes
  window.location.reload();
};
