import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStorefrontStore } from "@/lib/storefront";
import { StoreHero } from "@/components/storefront/StoreHero";
import { ProductGrid } from "@/components/storefront/ProductGrid";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStorefrontStore(slug);
  if (!store) return { title: "Store not found" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const description =
    store.description ?? `Shop ${store.name} — browse and buy online.`;

  return {
    title: store.name,
    description,
    openGraph: {
      title: store.name,
      description,
      url: `${appUrl}/store/${slug}`,
      images: store.logoUrl ? [{ url: store.logoUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: store.name,
      description,
      images: store.logoUrl ? [store.logoUrl] : [],
    },
    alternates: { canonical: `${appUrl}/store/${slug}` },
  };
}

export default async function StorefrontPage({ params }: Props) {
  const { slug } = await params;

  // getStorefrontStore is React.cache()'d — reuses the result from layout + generateMetadata
  const store = await getStorefrontStore(slug);
  if (!store) notFound();

  const products = await prisma.product.findMany({
    where: { storeId: store.id, isVisible: true },
    include: { variantAttributes: true, variantCombos: true },
    orderBy: { createdAt: "desc" },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const storeUrl = `${appUrl}/store/${store.slug}`;

  const jsonLdStore = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.name,
    url: storeUrl,
    ...(store.description ? { description: store.description } : {}),
    ...(store.logoUrl ? { image: store.logoUrl } : {}),
    potentialAction: {
      "@type": "SearchAction",
      target: `${storeUrl}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: appUrl },
      { "@type": "ListItem", position: 2, name: store.name, item: storeUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdStore) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <main>
        <StoreHero
          name={store.name}
          slug={store.slug}
          description={store.description}
          logoUrl={store.logoUrl}
          primaryColor={store.primaryColor}
          category={store.category}
          heroStyle={store.heroStyle}
          productCount={products.length}
          deliveryFee={store.deliveryFee}
          currency={store.currency}
        />
        <ProductGrid
          products={products}
          storeSlug={store.slug}
          currency={store.currency}
          primaryColor={store.primaryColor}
        />
      </main>
    </>
  );
}
