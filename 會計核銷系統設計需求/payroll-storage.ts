import { PayrollRecord } from "./payroll-types";

const PAYROLL_KEY = "accounting_payroll";

export const getPayrollRecords = (): PayrollRecord[] => {
  const data = localStorage.getItem(PAYROLL_KEY);
  return data ? JSON.parse(data) : [];
};

export const savePayrollRecords = (records: PayrollRecord[]) => {
  localStorage.setItem(PAYROLL_KEY, JSON.stringify(records));
};

export const getPayrollByPeriod = (period: string): PayrollRecord[] => {
  const records = getPayrollRecords();
  return records.filter((r) => r.period === period);
};

export const savePayrollBatch = (newRecords: PayrollRecord[]) => {
  const records = getPayrollRecords();
  // Remove existing records for the same employees in the same period to avoid duplicates
  const filtered = records.filter(
    (r) => !newRecords.some((nr) => nr.employeeId === r.employeeId && nr.period === r.period)
  );
  const updated = [...newRecords, ...filtered];
  savePayrollRecords(updated);
  return updated;
};

export const updatePayrollStatus = (period: string, status: "draft" | "finalized") => {
  const records = getPayrollRecords();
  const updated = records.map((r) => 
    r.period === period ? { ...r, status, updatedAt: new Date().toISOString() } : r
  );
  savePayrollRecords(updated);
  return updated;
};
