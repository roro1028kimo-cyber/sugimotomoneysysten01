export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  period: string; // YYYY-MM
  baseSalary: number;
  allowance: number;
  bonus: number; // 獎金
  deduction: number; // 扣款 (請假/勞健保自付額等)
  note: string;
  status: "draft" | "finalized";
  createdAt: string;
  updatedAt: string;
}

export interface PayrollSummary {
  period: string;
  totalAmount: number;
  employeeCount: number;
  status: "draft" | "finalized";
}
