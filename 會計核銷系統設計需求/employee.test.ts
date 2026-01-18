import { describe, expect, it, afterEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { db } from "./db";
import { employees } from "../drizzle/schema";
import { eq } from "drizzle-orm";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("employee API", () => {
  let createdEmployeeId: number | null = null;

  afterEach(async () => {
    // Clean up created employee
    if (createdEmployeeId) {
      try {
        await db.delete(employees).where(eq(employees.id, createdEmployeeId));
      } catch (e) {
        // Ignore cleanup errors
      }
      createdEmployeeId = null;
    }
  });

  it("should create a new employee", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const newEmployee = {
      name: "測試員工",
      department: "研發部",
      position: "工程師",
      email: "test@company.com",
      phone: "0912345678",
      joinDate: "2024-01-01",
      status: "active" as const,
      baseSalary: "50000",
      allowance: "5000",
      bankAccount: "123456789",
      bankName: "台灣銀行",
    };

    const result = await caller.employee.create(newEmployee);

    expect(result).toBeDefined();
    expect(result.name).toBe(newEmployee.name);
    expect(result.department).toBe(newEmployee.department);
    expect(result.position).toBe(newEmployee.position);
    expect(result.email).toBe(newEmployee.email);
    expect(result.phone).toBe(newEmployee.phone);
    expect(result.status).toBe("active");
    expect(parseFloat(result.baseSalary)).toBe(50000);
    expect(parseFloat(result.allowance)).toBe(5000);
    expect(result.id).toBeDefined();

    createdEmployeeId = result.id;
  });

  it("should list all employees", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an employee first
    const newEmployee = await caller.employee.create({
      name: "列表測試員工",
      department: "行政部",
      position: "助理",
      phone: "0987654321",
      joinDate: "2024-02-01",
      status: "active",
      baseSalary: "35000",
      allowance: "2000",
    });
    createdEmployeeId = newEmployee.id;

    const result = await caller.employee.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    const found = result.find(e => e.id === newEmployee.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe("列表測試員工");
  });

  it("should list only active employees", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an active employee
    const activeEmployee = await caller.employee.create({
      name: "在職員工",
      department: "業務部",
      position: "業務",
      phone: "0911111111",
      joinDate: "2024-03-01",
      status: "active",
      baseSalary: "40000",
      allowance: "3000",
    });
    createdEmployeeId = activeEmployee.id;

    const result = await caller.employee.listActive();

    expect(Array.isArray(result)).toBe(true);
    
    // All returned employees should be active
    result.forEach(e => {
      expect(e.status).toBe("active");
    });
  });

  it("should get employee by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an employee first
    const newEmployee = await caller.employee.create({
      name: "ID查詢測試員工",
      department: "財務部",
      position: "會計",
      phone: "0922222222",
      joinDate: "2024-04-01",
      status: "active",
      baseSalary: "45000",
      allowance: "4000",
    });
    createdEmployeeId = newEmployee.id;

    const result = await caller.employee.getById({ id: newEmployee.id });

    expect(result).toBeDefined();
    expect(result?.name).toBe("ID查詢測試員工");
    expect(result?.department).toBe("財務部");
  });

  it("should update an employee", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an employee first
    const newEmployee = await caller.employee.create({
      name: "更新前員工",
      department: "人資部",
      position: "專員",
      phone: "0933333333",
      joinDate: "2024-05-01",
      status: "active",
      baseSalary: "38000",
      allowance: "2500",
    });
    createdEmployeeId = newEmployee.id;

    const result = await caller.employee.update({
      id: newEmployee.id,
      name: "更新後員工",
      position: "主管",
      baseSalary: "55000",
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("更新後員工");
    expect(result.position).toBe("主管");
    expect(parseFloat(result.baseSalary)).toBe(55000);
    expect(result.department).toBe("人資部"); // Should remain unchanged
  });

  it("should update employee status to resigned", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an employee first
    const newEmployee = await caller.employee.create({
      name: "即將離職員工",
      department: "行銷部",
      position: "行銷專員",
      phone: "0944444444",
      joinDate: "2024-06-01",
      status: "active",
      baseSalary: "42000",
      allowance: "3500",
    });
    createdEmployeeId = newEmployee.id;

    const result = await caller.employee.update({
      id: newEmployee.id,
      status: "resigned",
    });

    expect(result).toBeDefined();
    expect(result.status).toBe("resigned");
  });

  it("should delete an employee", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an employee first
    const newEmployee = await caller.employee.create({
      name: "待刪除員工",
      department: "客服部",
      position: "客服",
      phone: "0955555555",
      joinDate: "2024-07-01",
      status: "active",
      baseSalary: "32000",
      allowance: "1500",
    });

    const result = await caller.employee.delete({ id: newEmployee.id });

    expect(result).toBe(true);

    // Verify deletion
    const deleted = await caller.employee.getById({ id: newEmployee.id });
    expect(deleted).toBeUndefined();

    // No need to clean up since it's already deleted
    createdEmployeeId = null;
  });
});
