import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const stores = await prisma.store.findMany({
    where: { onboardingComplete: true, isSuspended: false },
    select: {
      slug: true,
      updatedAt: true,
      products: {
        where: { isVisible: true },
        select: { id: true, updatedAt: true },
      },
    },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  ];

  const storeRoutes: MetadataRoute.Sitemap = stores.flatMap((store) => [
    {
      url: `${appUrl}/store/${store.slug}`,
      lastModified: store.updatedAt,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${appUrl}/store/${store.slug}/products`,
      lastModified: store.updatedAt,
      changeFrequency: "daily",
      priority: 0.6,
    },
    ...store.products.map((p) => ({
      url: `${appUrl}/store/${store.slug}/products/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ]);

  return [...staticRoutes, ...storeRoutes];
}
