import { cache } from "react";
import { prisma } from "./prisma";

// React.cache() deduplicates this across layout + page + generateMetadata in one request
export const getStorefrontStore = cache((slug: string) =>
  prisma.store.findUnique({
    where: { slug, isSuspended: false },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoUrl: true,
      primaryColor: true,
      accentColor: true,
      heroStyle: true,
      currency: true,
      country: true,
      codEnabled: true,
      paystackEnabled: true,
      deliveryFee: true,
      category: true,
      merchant: { select: { phone: true } },
    },
  })
);
