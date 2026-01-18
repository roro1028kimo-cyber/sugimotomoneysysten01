import { Employee } from "./hr-types";

const EMPLOYEES_KEY = "accounting_employees";

export const getEmployees = (): Employee[] => {
  const data = localStorage.getItem(EMPLOYEES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEmployees = (employees: Employee[]) => {
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
};

export const addEmployee = (employee: Employee) => {
  const employees = getEmployees();
  const updated = [employee, ...employees];
  saveEmployees(updated);
  return updated;
};

export const updateEmployee = (id: string, updates: Partial<Employee>) => {
  const employees = getEmployees();
  const updated = employees.map((emp) =>
    emp.id === id ? { ...emp, ...updates } : emp
  );
  saveEmployees(updated);
  return updated;
};

export const deleteEmployee = (id: string) => {
  const employees = getEmployees();
  const updated = employees.filter((emp) => emp.id !== id);
  saveEmployees(updated);
  return updated;
};
