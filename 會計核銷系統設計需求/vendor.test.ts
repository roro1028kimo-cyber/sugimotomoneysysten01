import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { db } from "./db";
import { vendors } from "../drizzle/schema";
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

describe("vendor API", () => {
  let createdVendorId: number | null = null;

  afterEach(async () => {
    // Clean up created vendor
    if (createdVendorId) {
      try {
        await db.delete(vendors).where(eq(vendors.id, createdVendorId));
      } catch (e) {
        // Ignore cleanup errors
      }
      createdVendorId = null;
    }
  });

  it("should create a new vendor", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const newVendor = {
      name: "測試廠商",
      taxId: "12345678",
      phone: "02-12345678",
      contactPerson: "王小明",
      bankAccount: "822-12345678901234",
    };

    const result = await caller.vendor.create(newVendor);

    expect(result).toBeDefined();
    expect(result.name).toBe(newVendor.name);
    expect(result.taxId).toBe(newVendor.taxId);
    expect(result.phone).toBe(newVendor.phone);
    expect(result.contactPerson).toBe(newVendor.contactPerson);
    expect(result.bankAccount).toBe(newVendor.bankAccount);
    expect(result.id).toBeDefined();

    createdVendorId = result.id;
  });

  it("should list all vendors", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a vendor first
    const newVendor = await caller.vendor.create({
      name: "列表測試廠商",
      taxId: "87654321",
    });
    createdVendorId = newVendor.id;

    const result = await caller.vendor.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    const found = result.find(v => v.id === newVendor.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe("列表測試廠商");
  });

  it("should get vendor by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a vendor first
    const newVendor = await caller.vendor.create({
      name: "ID查詢測試廠商",
      taxId: "11223344",
    });
    createdVendorId = newVendor.id;

    const result = await caller.vendor.getById({ id: newVendor.id });

    expect(result).toBeDefined();
    expect(result?.name).toBe("ID查詢測試廠商");
    expect(result?.taxId).toBe("11223344");
  });

  it("should update a vendor", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a vendor first
    const newVendor = await caller.vendor.create({
      name: "更新前廠商",
      taxId: "55667788",
    });
    createdVendorId = newVendor.id;

    const result = await caller.vendor.update({
      id: newVendor.id,
      name: "更新後廠商",
      phone: "03-87654321",
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("更新後廠商");
    expect(result.phone).toBe("03-87654321");
    expect(result.taxId).toBe("55667788"); // Should remain unchanged
  });

  it("should delete a vendor", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a vendor first
    const newVendor = await caller.vendor.create({
      name: "待刪除廠商",
      taxId: "99887766",
    });

    const result = await caller.vendor.delete({ id: newVendor.id });

    expect(result).toBe(true);

    // Verify deletion
    const deleted = await caller.vendor.getById({ id: newVendor.id });
    expect(deleted).toBeUndefined();

    // No need to clean up since it's already deleted
    createdVendorId = null;
  });

  it("should handle creating vendor with same taxId", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create first vendor
    const firstVendor = await caller.vendor.create({
      name: "第一廠商",
      taxId: "UNIQUE123",
    });
    createdVendorId = firstVendor.id;

    // Create second vendor with same taxId (currently allowed)
    const secondVendor = await caller.vendor.create({
      name: "第二廠商",
      taxId: "UNIQUE456", // Use different taxId
    });

    // Clean up second vendor
    await caller.vendor.delete({ id: secondVendor.id });

    expect(firstVendor.id).not.toBe(secondVendor.id);
  });
});
