import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { getSherpurWeather } from "./weather";
import { storagePut } from "./storage";
import {
  archiveMediaAsset,
  createMediaAsset,
  getAdminOverview,
  getCategories,
  getAdminFeaturedItems,
  getFeaturedItems,
  getPublishedNotices,
  getMediaAssets,
  getPublishedServices,
  updateFeaturedImage,
  updateMediaAsset,
  updateServiceListing,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  /** Public read model consumed by the public homepage and future mobile client. */
  spcare: router({
    homepage: publicProcedure.query(async () => {
      const [categories, featured, notices, services] = await Promise.all([
        getCategories(),
        getFeaturedItems(),
        getPublishedNotices(5),
        getPublishedServices({ limit: 12 }),
      ]);
      return { categories, featured, notices, services, generatedAt: new Date() };
    }),
    categories: publicProcedure.query(() => getCategories()),
    featured: publicProcedure.query(() => getFeaturedItems()),
    weather: publicProcedure.query(() => getSherpurWeather()),
    notices: publicProcedure.input(z.object({ limit: z.number().int().min(1).max(20).default(10) }).optional()).query(({ input }) => getPublishedNotices(input?.limit ?? 10)),
    services: publicProcedure.input(z.object({ search: z.string().trim().max(100).optional(), categorySlug: z.string().trim().max(80).optional(), limit: z.number().int().min(1).max(60).default(24) }).optional()).query(({ input }) => getPublishedServices(input)),
  }),

  /** Admin read model; all admin mutations will use this protected namespace. */
  admin: router({
    overview: adminProcedure.query(() => getAdminOverview()),
    services: adminProcedure.input(z.object({ search: z.string().trim().max(100).optional(), limit: z.number().int().min(1).max(100).default(50) }).optional()).query(({ input }) => getPublishedServices({ search: input?.search, limit: input?.limit ?? 50 })),
    updateService: adminProcedure.input(z.object({ id: z.number().int().positive(), nameBn: z.string().trim().min(2).max(180).optional(), phone: z.string().trim().max(32).nullable().optional(), imageUrl: z.string().trim().url().max(1000).nullable().optional(), addressBn: z.string().trim().max(500).nullable().optional(), hoursBn: z.string().trim().max(160).nullable().optional() })).mutation(({ input }) => updateServiceListing(input)),
    media: adminProcedure.input(z.object({ limit: z.number().int().min(1).max(100).default(60) }).optional()).query(({ input }) => getMediaAssets(input?.limit ?? 60)),
    uploadMedia: adminProcedure.input(z.object({ filename: z.string().trim().min(1).max(180), mimeType: z.string().regex(/^image\/(jpeg|png|webp|gif|avif)$/i), bytes: z.number().int().positive().max(5 * 1024 * 1024), base64: z.string().min(1).max(7_000_000), altTextBn: z.string().trim().max(240).nullable().optional() })).mutation(async ({ input, ctx }) => {
      const safeName = input.filename.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^[-.]+|[-.]+$/g, "").slice(0, 120) || "upload";
      const buffer = Buffer.from(input.base64, "base64");
      if (buffer.byteLength !== input.bytes) throw new Error("Uploaded file size mismatch");
      const { key, url } = await storagePut(`admin/${ctx.user.id}/media/${safeName}`, buffer, input.mimeType);
      return createMediaAsset({ fileKey: key, filename: safeName, publicUrl: url, altTextBn: input.altTextBn ?? null, mimeType: input.mimeType, bytes: buffer.byteLength, createdBy: ctx.user.id });
    }),
    updateMedia: adminProcedure.input(z.object({ id: z.number().int().positive(), altTextBn: z.string().trim().max(240).nullable().optional() })).mutation(({ input }) => updateMediaAsset(input)),
    archiveMedia: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => archiveMediaAsset(input.id)),
    featured: adminProcedure.input(z.object({ limit: z.number().int().min(1).max(50).default(30) }).optional()).query(({ input }) => getAdminFeaturedItems(input?.limit ?? 30)),
    updateFeaturedImage: adminProcedure.input(z.object({ id: z.number().int().positive(), imageUrl: z.string().trim().url().max(1000) })).mutation(({ input }) => updateFeaturedImage(input)),
  }),
});

export type AppRouter = typeof appRouter;
