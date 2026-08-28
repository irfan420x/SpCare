import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/** Core user table backing Manus OAuth and admin access. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  nameBn: varchar("nameBn", { length: 120 }).notNull(),
  nameEn: varchar("nameEn", { length: 120 }).notNull(),
  subtitleBn: varchar("subtitleBn", { length: 220 }),
  iconKey: varchar("iconKey", { length: 64 }).notNull().default("building"),
  accent: varchar("accent", { length: 32 }).notNull().default("green"),
  sortOrder: int("sortOrder").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  isDemo: boolean("isDemo").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ activeOrderIdx: index("categories_active_order_idx").on(table.isActive, table.sortOrder) }));

export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  districtBn: varchar("districtBn", { length: 120 }).notNull().default("শেরপুর"),
  upazilaBn: varchar("upazilaBn", { length: 120 }),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  latitude: varchar("latitude", { length: 32 }),
  longitude: varchar("longitude", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const serviceListings = mysqlTable("serviceListings", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull().references(() => categories.id, { onDelete: "restrict" }),
  locationId: int("locationId").notNull().references(() => locations.id, { onDelete: "restrict" }),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  nameBn: varchar("nameBn", { length: 180 }).notNull(),
  nameEn: varchar("nameEn", { length: 180 }),
  shortDescriptionBn: text("shortDescriptionBn"),
  addressBn: text("addressBn"),
  phone: varchar("phone", { length: 32 }),
  hoursBn: varchar("hoursBn", { length: 160 }),
  imageUrl: text("imageUrl"),
  mapUrl: text("mapUrl"),
  status: mysqlEnum("status", ["draft", "published", "suspended", "archived"]).notNull().default("published"),
  isVerified: boolean("isVerified").notNull().default(false),
  lastVerifiedAt: timestamp("lastVerifiedAt"),
  sortOrder: int("sortOrder").notNull().default(0),
  isDemo: boolean("isDemo").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  directoryIdx: index("service_directory_idx").on(table.status, table.categoryId, table.locationId),
  verifiedIdx: index("service_verified_idx").on(table.isVerified, table.lastVerifiedAt),
}));

export const notices = mysqlTable("notices", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  titleBn: varchar("titleBn", { length: 220 }).notNull(),
  bodyBn: text("bodyBn").notNull(),
  sourceBn: varchar("sourceBn", { length: 180 }),
  severity: mysqlEnum("severity", ["info", "important", "urgent"]).notNull().default("info"),
  status: mysqlEnum("status", ["draft", "published", "expired", "archived"]).notNull().default("published"),
  publishAt: timestamp("publishAt"),
  expiresAt: timestamp("expiresAt"),
  isDemo: boolean("isDemo").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ noticeIdx: index("notice_status_publish_idx").on(table.status, table.publishAt, table.expiresAt) }));

export const featuredItems = mysqlTable("featuredItems", {
  id: int("id").autoincrement().primaryKey(),
  serviceId: int("serviceId").references(() => serviceListings.id, { onDelete: "set null" }),
  titleBn: varchar("titleBn", { length: 180 }).notNull(),
  tagBn: varchar("tagBn", { length: 80 }).notNull(),
  locationBn: varchar("locationBn", { length: 180 }).notNull(),
  ratingLabel: varchar("ratingLabel", { length: 80 }),
  imageUrl: text("imageUrl").notNull(),
  ctaLabelBn: varchar("ctaLabelBn", { length: 80 }).notNull().default("বিস্তারিত দেখুন"),
  sortOrder: int("sortOrder").notNull().default(0),
  isActive: boolean("isActive").notNull().default(true),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ featuredIdx: index("featured_active_order_idx").on(table.isActive, table.sortOrder, table.startsAt, table.endsAt) }));

export const mediaAssets = mysqlTable("mediaAssets", {
  id: int("id").autoincrement().primaryKey(),
  fileKey: varchar("fileKey", { length: 512 }).notNull().unique(),
  filename: varchar("filename", { length: 180 }).notNull(),
  publicUrl: text("publicUrl").notNull(),
  altTextBn: varchar("altTextBn", { length: 240 }),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  bytes: int("bytes"),
  status: mysqlEnum("status", ["pending", "ready", "archived"]).notNull().default("ready"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ mediaStatusIdx: index("media_status_idx").on(table.status, table.createdAt) }));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type ServiceListing = typeof serviceListings.$inferSelect;
export type Notice = typeof notices.$inferSelect;
export type FeaturedItem = typeof featuredItems.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
