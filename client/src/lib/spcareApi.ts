import { trpc } from "@/lib/trpc";

/**
 * Central frontend access point for all SPCare backend procedures.
 * Feature pages should use these hooks instead of importing the tRPC client directly.
 */
export const useSpCareHomepage = () => trpc.spcare.homepage.useQuery(undefined, {
  staleTime: 60_000,
  refetchOnWindowFocus: false,
});

export const useSpCareCategories = () => trpc.spcare.categories.useQuery(undefined, {
  staleTime: 5 * 60_000,
});

export const useSpCareServices = (input?: { search?: string; categorySlug?: string; limit?: number }) =>
  trpc.spcare.services.useQuery(input, { staleTime: 60_000, refetchOnWindowFocus: false });

export const useSpCareNotices = (limit = 10) =>
  trpc.spcare.notices.useQuery({ limit }, { staleTime: 60_000, refetchOnWindowFocus: false });

export const useSpCareWeather = () =>
  trpc.spcare.weather.useQuery(undefined, { staleTime: 10 * 60_000, refetchOnWindowFocus: false });

export const useSpCareAdminOverview = () =>
  trpc.admin.overview.useQuery(undefined, { staleTime: 30_000, refetchOnWindowFocus: false });

export const useSpCareAdminServices = (search?: string) =>
  trpc.admin.services.useQuery({ search, limit: 50 }, { staleTime: 30_000, refetchOnWindowFocus: false });

export const useSpCareAdminFeatured = () =>
  trpc.admin.featured.useQuery({ limit: 30 }, { staleTime: 30_000, refetchOnWindowFocus: false });

export const useSpCareAdminMedia = () =>
  trpc.admin.media.useQuery({ limit: 80 }, { staleTime: 30_000, refetchOnWindowFocus: false });

export const useSpCareAdminMediaActions = () => {
  const upload = trpc.admin.uploadMedia.useMutation();
  const update = trpc.admin.updateMedia.useMutation();
  const archive = trpc.admin.archiveMedia.useMutation();
  const updateFeaturedImage = trpc.admin.updateFeaturedImage.useMutation();
  const utils = trpc.useUtils();
  const refresh = () => { void utils.admin.media.invalidate(); void utils.admin.overview.invalidate(); void utils.admin.featured.invalidate(); };
  const saveFeaturedImage = (input: Parameters<typeof updateFeaturedImage.mutate>[0]) => updateFeaturedImage.mutate(input, { onSuccess: refresh });
  return {
    upload,
    update,
    archive,
    uploadFile: (input: Parameters<typeof upload.mutate>[0]) => upload.mutate(input, { onSuccess: refresh }),
    saveMetadata: (input: Parameters<typeof update.mutate>[0]) => update.mutate(input, { onSuccess: refresh }),
    archiveAsset: (input: Parameters<typeof archive.mutate>[0]) => archive.mutate(input, { onSuccess: refresh }),
    updateFeaturedImage,
    saveFeaturedImage,
  };
};

export const useSpCareAdminUpdateService = () => {
  const mutation = trpc.admin.updateService.useMutation();
  const utils = trpc.useUtils();
  return {
    ...mutation,
    save: (input: Parameters<typeof mutation.mutate>[0]) => mutation.mutate(input, {
      onSuccess: () => {
        void utils.admin.services.invalidate();
        void utils.admin.overview.invalidate();
      },
    }),
  };
};
