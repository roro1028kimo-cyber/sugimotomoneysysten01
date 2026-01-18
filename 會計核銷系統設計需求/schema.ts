import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Vendors table - 廠商資料表
 * Stores information about business partners/vendors
 */
export const vendors = mysqlTable("vendors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  taxId: varchar("taxId", { length: 20 }).notNull(), // 統一編號
  phone: varchar("phone", { length: 50 }),
  bankAccount: varchar("bankAccount", { length: 50 }),
  contactPerson: varchar("contactPerson", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

/**
 * Vouchers table - 會計憑證資料表
 * Stores accounting vouchers/receipts for expense tracking
 */
export const vouchers = mysqlTable("vouchers", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD format
  description: text("description"),
  status: mysqlEnum("status", ["pending", "completed", "void"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Voucher = typeof vouchers.$inferSelect;
export type InsertVoucher = typeof vouchers.$inferInsert;

/**
 * Employees table - 員工資料表
 * Stores employee information including salary structure
 */
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  department: varchar("department", { length: 50 }).notNull(),
  position: varchar("position", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }).notNull(),
  joinDate: varchar("joinDate", { length: 10 }).notNull(), // YYYY-MM-DD format
  status: mysqlEnum("status", ["active", "leave", "resigned"]).default("active").notNull(),
  // Salary information
  baseSalary: decimal("baseSalary", { precision: 12, scale: 2 }).default("0").notNull(),
  allowance: decimal("allowance", { precision: 12, scale: 2 }).default("0").notNull(),
  bankAccount: varchar("bankAccount", { length: 50 }),
  bankName: varchar("bankName", { length: 100 }),
  // Emergency contact
  emergencyContactName: varchar("emergencyContactName", { length: 100 }),
  emergencyContactPhone: varchar("emergencyContactPhone", { length: 50 }),
  emergencyContactRelationship: varchar("emergencyContactRelationship", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

/**
 * Payroll Records table - 薪資紀錄資料表
 * Stores monthly payroll records for each employee
 */
export const payrollRecords = mysqlTable("payroll_records", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  employeeName: varchar("employeeName", { length: 100 }).notNull(), // Denormalized for historical records
  department: varchar("department", { length: 50 }).notNull(),
  position: varchar("position", { length: 50 }).notNull(),
  period: varchar("period", { length: 7 }).notNull(), // YYYY-MM format
  baseSalary: decimal("baseSalary", { precision: 12, scale: 2 }).notNull(),
  allowance: decimal("allowance", { precision: 12, scale: 2 }).notNull(),
  bonus: decimal("bonus", { precision: 12, scale: 2 }).default("0").notNull(),
  deduction: decimal("deduction", { precision: 12, scale: 2 }).default("0").notNull(),
  note: text("note"),
  status: mysqlEnum("status", ["draft", "finalized"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PayrollRecord = typeof payrollRecords.$inferSelect;
export type InsertPayrollRecord = typeof payrollRecords.$inferInsert;
