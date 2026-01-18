export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  email?: string;
  phone: string;
  joinDate: string;
  status: "active" | "leave" | "resigned";
  salary: {
    base: number;
    allowance: number;
    bankAccount?: string;
    bankName?: string;
  };
  emergencyContact: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

export const DEPARTMENTS = ["設計部", "工務部", "行政部", "會計部", "業務部"];
export const POSITIONS = ["經理", "主任", "設計師", "工程師", "專員", "助理"];
