import { describe, expect, it, vi } from "vitest";
import { storagePut } from "./storage";

vi.mock("./storage", () => ({ storagePut: vi.fn() }));
import { appRouter } from "./routers";
import { getCategories, getPublishedServices } from "./db";
import type { TrpcContext } from "./_core/context";

type TestUser = NonNullable<TrpcContext["user"]>;

function createContext(user: TestUser | null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("SPCare public directory", () => {
  it("returns homepage content from the centralized public procedure", async () => {
    const caller = appRouter.createCaller(createContext(null));
    const result = await caller.spcare.homepage();

    expect(result).toHaveProperty("categories");
    expect(result).toHaveProperty("services");
    expect(result).toHaveProperty("notices");
    expect(result).toHaveProperty("featured");
    expect(Array.isArray(result.categories)).toBe(true);
  });

  it("supports bounded service search inputs", async () => {
    const caller = appRouter.createCaller(createContext(null));
    const result = await caller.spcare.services({ search: "হাসপাতাল", limit: 5 });

    expect(result.length).toBeLessThanOrEqual(5);
    expect(result.every((service) => service.status === undefined || service.nameBn)).toBe(true);
  });
});

describe("SPCare database helpers", () => {
  it("reads seeded categories directly from the database", async () => {
    const result = await getCategories();
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]).toHaveProperty("slug");
  });

  it("reads joined service directory rows with category and location context", async () => {
    const result = await getPublishedServices({ limit: 10 });
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]).toHaveProperty("categoryNameBn");
    expect(result[0]).toHaveProperty("districtBn");
  });
});

describe("SPCare admin authorization", () => {
  it("rejects a signed-in non-admin user", async () => {
    const caller = appRouter.createCaller(createContext({
      id: 21,
      openId: "regular-user",
      name: "Regular User",
      email: "user@example.com",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    }));

    await expect(caller.admin.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows an admin to read the overview", async () => {
    const caller = appRouter.createCaller(createContext({
      id: 1,
      openId: "admin-user",
      name: "Admin User",
      email: "admin@example.com",
      loginMethod: "test",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    }));

    const result = await caller.admin.overview();
    expect(result).toMatchObject({ categories: expect.any(Number), services: expect.any(Number), notices: expect.any(Number), featured: expect.any(Number) });
  });
});


describe("SPCare media library authorization", () => {
  it("rejects media listing for a regular user", async () => {
    const caller = appRouter.createCaller(createContext({
      id: 22,
      openId: "media-user",
      name: "Media User",
      email: "media@example.com",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    }));

    await expect(caller.admin.media()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects unsupported media MIME types before storage upload", async () => {
    const caller = appRouter.createCaller(createContext({
      id: 1,
      openId: "media-admin",
      name: "Media Admin",
      email: "admin@example.com",
      loginMethod: "test",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    }));

    await expect(caller.admin.uploadMedia({
      filename: "document.pdf",
      mimeType: "application/pdf",
      bytes: 128,
      base64: "AA==",
      altTextBn: "ডকুমেন্ট",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("updates media alt text through the protected procedure", async () => {
    const caller = appRouter.createCaller(createContext({
      id: 1,
      openId: "metadata-admin",
      name: "Metadata Admin",
      email: "admin@example.com",
      loginMethod: "test",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    }));

    await expect(caller.admin.updateMedia({ id: 999999, altTextBn: "ডেমো alt text" })).resolves.toMatchObject({ success: true, id: 999999 });
    await expect(caller.admin.updateMedia({ id: 1, altTextBn: "x".repeat(241) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("propagates an S3 storage failure from the upload procedure", async () => {
    vi.mocked(storagePut).mockRejectedValueOnce(new Error("S3 unavailable"));
    const caller = appRouter.createCaller(createContext({
      id: 1,
      openId: "storage-admin",
      name: "Storage Admin",
      email: "admin@example.com",
      loginMethod: "test",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    }));

    await expect(caller.admin.uploadMedia({ filename: "park.png", mimeType: "image/png", bytes: 1, base64: "AQ==" })).rejects.toThrow("S3 unavailable");
  });

  it("rejects media payloads above the five megabyte limit", async () => {
    const caller = appRouter.createCaller(createContext({
      id: 1,
      openId: "size-admin",
      name: "Size Admin",
      email: "admin@example.com",
      loginMethod: "test",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    }));

    await expect(caller.admin.uploadMedia({
      filename: "large.png",
      mimeType: "image/png",
      bytes: 5 * 1024 * 1024 + 1,
      base64: "AA==",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
