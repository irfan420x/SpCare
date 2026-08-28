import { and, asc, desc, eq, like, ne, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  categories,
  featuredItems,
  locations,
  mediaAssets,
  notices,
  serviceListings,
  type InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  const values: InsertUser = { openId: user.openId };
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
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder));
}

export async function getFeaturedItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(featuredItems).where(eq(featuredItems.isActive, true)).orderBy(asc(featuredItems.sortOrder)).limit(6);
}

export async function getPublishedNotices(limit = 6) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notices)
    .where(eq(notices.status, "published"))
    .orderBy(desc(notices.publishAt), desc(notices.createdAt)).limit(limit);
}

export async function getPublishedServices(input?: { search?: string; categorySlug?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return [];
  const limit = Math.min(Math.max(input?.limit ?? 24, 1), 60);
  const search = input?.search?.trim();
  const conditions = [eq(serviceListings.status, "published")];
  if (search) {
    conditions.push(or(like(serviceListings.nameBn, `%${search}%`), like(serviceListings.nameEn, `%${search}%`), like(serviceListings.shortDescriptionBn, `%${search}%`)) as never);
  }
  if (input?.categorySlug) {
    const category = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, input.categorySlug)).limit(1);
    if (category[0]) conditions.push(eq(serviceListings.categoryId, category[0].id));
  }
  const rows = await db.select({
    id: serviceListings.id,
    slug: serviceListings.slug,
    nameBn: serviceListings.nameBn,
    nameEn: serviceListings.nameEn,
    shortDescriptionBn: serviceListings.shortDescriptionBn,
    addressBn: serviceListings.addressBn,
    phone: serviceListings.phone,
    hoursBn: serviceListings.hoursBn,
    imageUrl: serviceListings.imageUrl,
    mapUrl: serviceListings.mapUrl,
    isVerified: serviceListings.isVerified,
    isDemo: serviceListings.isDemo,
    categoryId: serviceListings.categoryId,
    categoryNameBn: categories.nameBn,
    categorySlug: categories.slug,
    locationId: serviceListings.locationId,
    upazilaBn: locations.upazilaBn,
    districtBn: locations.districtBn,
  })
    .from(serviceListings)
    .leftJoin(categories, eq(serviceListings.categoryId, categories.id))
    .leftJoin(locations, eq(serviceListings.locationId, locations.id))
    .where(and(...conditions))
    .orderBy(desc(serviceListings.isVerified), asc(serviceListings.sortOrder), asc(serviceListings.nameBn))
    .limit(limit);
  return rows;
}

export async function updateServiceListing(input: { id: number; nameBn?: string; phone?: string | null; imageUrl?: string | null; addressBn?: string | null; hoursBn?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const updateSet: Record<string, unknown> = { updatedAt: new Date() };
  if (input.nameBn !== undefined) updateSet.nameBn = input.nameBn;
  if (input.phone !== undefined) updateSet.phone = input.phone;
  if (input.imageUrl !== undefined) updateSet.imageUrl = input.imageUrl;
  if (input.addressBn !== undefined) updateSet.addressBn = input.addressBn;
  if (input.hoursBn !== undefined) updateSet.hoursBn = input.hoursBn;
  await db.update(serviceListings).set(updateSet).where(eq(serviceListings.id, input.id));
  return { success: true as const, id: input.id };
}

export async function getAdminFeaturedItems(limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(featuredItems).orderBy(asc(featuredItems.sortOrder), desc(featuredItems.createdAt)).limit(Math.min(Math.max(limit, 1), 50));
}

export async function updateFeaturedImage(input: { id: number; imageUrl: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(featuredItems).set({ imageUrl: input.imageUrl, updatedAt: new Date() }).where(eq(featuredItems.id, input.id));
  return { success: true as const, id: input.id };
}

export async function getMediaAssets(limit = 60) {
  const db = await getDb();
  if (!db) return [];
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  return db.select().from(mediaAssets).where(ne(mediaAssets.status, "archived")).orderBy(desc(mediaAssets.createdAt)).limit(safeLimit);
}

export async function createMediaAsset(input: { fileKey: string; filename: string; publicUrl: string; altTextBn?: string | null; mimeType: string; bytes: number; createdBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const [created] = await db.insert(mediaAssets).values({ ...input, status: "ready" }).$returningId();
  return { success: true as const, id: created?.id ?? null, fileKey: input.fileKey, publicUrl: input.publicUrl };
}

export async function updateMediaAsset(input: { id: number; altTextBn?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(mediaAssets).set({ altTextBn: input.altTextBn ?? null, updatedAt: new Date() }).where(eq(mediaAssets.id, input.id));
  return { success: true as const, id: input.id };
}

export async function archiveMediaAsset(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(mediaAssets).set({ status: "archived", updatedAt: new Date() }).where(eq(mediaAssets.id, id));
  return { success: true as const, id };
}

export async function getAdminOverview() {
  const db = await getDb();
  if (!db) return { categories: 0, services: 0, notices: 0, featured: 0, media: 0 };
  const [categoryRows, serviceRows, noticeRows, featuredRows, mediaRows] = await Promise.all([
    db.select({ id: categories.id }).from(categories),
    db.select({ id: serviceListings.id }).from(serviceListings),
    db.select({ id: notices.id }).from(notices),
    db.select({ id: featuredItems.id }).from(featuredItems),
    db.select({ id: mediaAssets.id }).from(mediaAssets).where(ne(mediaAssets.status, "archived")),
  ]);
  return { categories: categoryRows.length, services: serviceRows.length, notices: noticeRows.length, featured: featuredRows.length, media: mediaRows.length };
}
