import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

// ==================== Vendor Router ====================
const vendorRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getVendors();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getVendorById(input.id);
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "請輸入廠商名稱"),
      taxId: z.string().min(1, "請輸入統一編號"),
      phone: z.string().optional(),
      bankAccount: z.string().optional(),
      contactPerson: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.createVendor(input);
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      taxId: z.string().min(1).optional(),
      phone: z.string().optional(),
      bankAccount: z.string().optional(),
      contactPerson: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.updateVendor(id, data);
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // Check if vendor has associated vouchers
      const vouchers = await db.getVouchersByVendorId(input.id);
      if (vouchers.length > 0) {
        throw new Error("無法刪除此廠商，因為有關聯的憑證存在");
      }
      return await db.deleteVendor(input.id);
    }),
});

// ==================== Voucher Router ====================
const voucherRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getVouchers();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getVoucherById(input.id);
    }),
  
  getByVendorId: protectedProcedure
    .input(z.object({ vendorId: z.number() }))
    .query(async ({ input }) => {
      return await db.getVouchersByVendorId(input.vendorId);
    }),
  
  create: protectedProcedure
    .input(z.object({
      vendorId: z.number(),
      amount: z.string(), // Decimal as string
      date: z.string().min(1, "請選擇日期"),
      description: z.string().optional(),
      status: z.enum(["pending", "completed", "void"]).default("pending"),
    }))
    .mutation(async ({ input }) => {
      return await db.createVoucher(input);
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      vendorId: z.number().optional(),
      amount: z.string().optional(),
      date: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["pending", "completed", "void"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.updateVoucher(id, data);
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteVoucher(input.id);
    }),
});

// ==================== Employee Router ====================
const employeeRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getEmployees();
  }),
  
  listActive: protectedProcedure.query(async () => {
    return await db.getActiveEmployees();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getEmployeeById(input.id);
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "請輸入姓名"),
      department: z.string().min(1, "請選擇部門"),
      position: z.string().min(1, "請選擇職稱"),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().min(1, "請輸入電話"),
      joinDate: z.string().min(1, "請選擇到職日"),
      status: z.enum(["active", "leave", "resigned"]).default("active"),
      baseSalary: z.string().default("0"),
      allowance: z.string().default("0"),
      bankAccount: z.string().optional(),
      bankName: z.string().optional(),
      emergencyContactName: z.string().optional(),
      emergencyContactPhone: z.string().optional(),
      emergencyContactRelationship: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.createEmployee(input);
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      department: z.string().min(1).optional(),
      position: z.string().min(1).optional(),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().min(1).optional(),
      joinDate: z.string().optional(),
      status: z.enum(["active", "leave", "resigned"]).optional(),
      baseSalary: z.string().optional(),
      allowance: z.string().optional(),
      bankAccount: z.string().optional(),
      bankName: z.string().optional(),
      emergencyContactName: z.string().optional(),
      emergencyContactPhone: z.string().optional(),
      emergencyContactRelationship: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.updateEmployee(id, data);
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deleteEmployee(input.id);
    }),
});

// ==================== Payroll Router ====================
const payrollRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getPayrollRecords();
  }),
  
  getByPeriod: protectedProcedure
    .input(z.object({ period: z.string() }))
    .query(async ({ input }) => {
      return await db.getPayrollByPeriod(input.period);
    }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getPayrollRecordById(input.id);
    }),
  
  create: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      employeeName: z.string(),
      department: z.string(),
      position: z.string(),
      period: z.string(),
      baseSalary: z.string(),
      allowance: z.string(),
      bonus: z.string().default("0"),
      deduction: z.string().default("0"),
      note: z.string().optional(),
      status: z.enum(["draft", "finalized"]).default("draft"),
    }))
    .mutation(async ({ input }) => {
      return await db.createPayrollRecord(input);
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      bonus: z.string().optional(),
      deduction: z.string().optional(),
      note: z.string().optional(),
      status: z.enum(["draft", "finalized"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.updatePayrollRecord(id, data);
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deletePayrollRecord(input.id);
    }),
  
  saveBatch: protectedProcedure
    .input(z.array(z.object({
      employeeId: z.number(),
      employeeName: z.string(),
      department: z.string(),
      position: z.string(),
      period: z.string(),
      baseSalary: z.string(),
      allowance: z.string(),
      bonus: z.string().default("0"),
      deduction: z.string().default("0"),
      note: z.string().optional(),
      status: z.enum(["draft", "finalized"]).default("draft"),
    })))
    .mutation(async ({ input }) => {
      return await db.upsertPayrollBatch(input);
    }),
  
  finalizePeriod: protectedProcedure
    .input(z.object({ period: z.string() }))
    .mutation(async ({ input }) => {
      const count = await db.updatePayrollStatusByPeriod(input.period, "finalized");
      return { success: true, updatedCount: count };
    }),
});

// ==================== Main Router ====================
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  
  // Feature routers
  vendor: vendorRouter,
  voucher: voucherRouter,
  employee: employeeRouter,
  payroll: payrollRouter,
});

export type AppRouter = typeof appRouter;
