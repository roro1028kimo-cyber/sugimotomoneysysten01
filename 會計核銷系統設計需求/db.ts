import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  vendors, 
  vouchers, 
  employees, 
  payrollRecords,
  InsertVendor,
  InsertVoucher,
  InsertEmployee,
  InsertPayrollRecord,
  Vendor,
  Voucher,
  Employee,
  PayrollRecord
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== User Operations ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== Vendor Operations ====================

export async function getVendors(): Promise<Vendor[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(vendors).orderBy(desc(vendors.createdAt));
}

export async function getVendorById(id: number): Promise<Vendor | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
  return result[0];
}

export async function createVendor(vendor: Omit<InsertVendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vendor> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(vendors).values(vendor);
  const insertId = result[0].insertId;
  
  const created = await getVendorById(insertId);
  if (!created) throw new Error("Failed to create vendor");
  return created;
}

export async function updateVendor(id: number, vendor: Partial<Omit<InsertVendor, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Vendor | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(vendors).set(vendor).where(eq(vendors.id, id));
  return await getVendorById(id);
}

export async function deleteVendor(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.delete(vendors).where(eq(vendors.id, id));
  return result[0].affectedRows > 0;
}

// ==================== Voucher Operations ====================

export async function getVouchers(): Promise<Voucher[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(vouchers).orderBy(desc(vouchers.createdAt));
}

export async function getVoucherById(id: number): Promise<Voucher | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(vouchers).where(eq(vouchers.id, id)).limit(1);
  return result[0];
}

export async function createVoucher(voucher: Omit<InsertVoucher, 'id' | 'createdAt' | 'updatedAt'>): Promise<Voucher> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(vouchers).values(voucher);
  const insertId = result[0].insertId;
  
  const created = await getVoucherById(insertId);
  if (!created) throw new Error("Failed to create voucher");
  return created;
}

export async function updateVoucher(id: number, voucher: Partial<Omit<InsertVoucher, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Voucher | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(vouchers).set(voucher).where(eq(vouchers.id, id));
  return await getVoucherById(id);
}

export async function deleteVoucher(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.delete(vouchers).where(eq(vouchers.id, id));
  return result[0].affectedRows > 0;
}

export async function getVouchersByVendorId(vendorId: number): Promise<Voucher[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(vouchers).where(eq(vouchers.vendorId, vendorId)).orderBy(desc(vouchers.createdAt));
}

// ==================== Employee Operations ====================

export async function getEmployees(): Promise<Employee[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(employees).orderBy(desc(employees.createdAt));
}

export async function getEmployeeById(id: number): Promise<Employee | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  return result[0];
}

export async function getActiveEmployees(): Promise<Employee[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(employees).where(eq(employees.status, "active")).orderBy(employees.name);
}

export async function createEmployee(employee: Omit<InsertEmployee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(employees).values(employee);
  const insertId = result[0].insertId;
  
  const created = await getEmployeeById(insertId);
  if (!created) throw new Error("Failed to create employee");
  return created;
}

export async function updateEmployee(id: number, employee: Partial<Omit<InsertEmployee, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Employee | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(employees).set(employee).where(eq(employees.id, id));
  return await getEmployeeById(id);
}

export async function deleteEmployee(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.delete(employees).where(eq(employees.id, id));
  return result[0].affectedRows > 0;
}

// ==================== Payroll Operations ====================

export async function getPayrollRecords(): Promise<PayrollRecord[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(payrollRecords).orderBy(desc(payrollRecords.period), desc(payrollRecords.createdAt));
}

export async function getPayrollRecordById(id: number): Promise<PayrollRecord | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(payrollRecords).where(eq(payrollRecords.id, id)).limit(1);
  return result[0];
}

export async function getPayrollByPeriod(period: string): Promise<PayrollRecord[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(payrollRecords).where(eq(payrollRecords.period, period)).orderBy(payrollRecords.employeeName);
}

export async function createPayrollRecord(record: Omit<InsertPayrollRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayrollRecord> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(payrollRecords).values(record);
  const insertId = result[0].insertId;
  
  const created = await getPayrollRecordById(insertId);
  if (!created) throw new Error("Failed to create payroll record");
  return created;
}

export async function updatePayrollRecord(id: number, record: Partial<Omit<InsertPayrollRecord, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PayrollRecord | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(payrollRecords).set(record).where(eq(payrollRecords.id, id));
  return await getPayrollRecordById(id);
}

export async function deletePayrollRecord(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.delete(payrollRecords).where(eq(payrollRecords.id, id));
  return result[0].affectedRows > 0;
}

export async function upsertPayrollBatch(records: Omit<InsertPayrollRecord, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<PayrollRecord[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const results: PayrollRecord[] = [];
  
  for (const record of records) {
    // Check if record exists for this employee and period
    const existing = await db.select().from(payrollRecords)
      .where(and(
        eq(payrollRecords.employeeId, record.employeeId),
        eq(payrollRecords.period, record.period)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing record
      await db.update(payrollRecords)
        .set(record)
        .where(eq(payrollRecords.id, existing[0].id));
      const updated = await getPayrollRecordById(existing[0].id);
      if (updated) results.push(updated);
    } else {
      // Create new record
      const created = await createPayrollRecord(record);
      results.push(created);
    }
  }
  
  return results;
}

export async function updatePayrollStatusByPeriod(period: string, status: "draft" | "finalized"): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.update(payrollRecords)
    .set({ status })
    .where(eq(payrollRecords.period, period));
  
  return result[0].affectedRows;
}
