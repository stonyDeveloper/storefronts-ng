import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStorefrontStore } from "@/lib/storefront";
import { formatMoney } from "@/lib/utils";
import { ProductDetailSection } from "@/components/storefront/ProductDetailSection";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, id } = await params;
  const [store, product] = await Promise.all([
    getStorefrontStore(slug),
    prisma.product.findUnique({
      where: { id },
      select: { name: true, description: true, images: true, price: true },
    }),
  ]);
  if (!store || !product) return { title: "Product not found" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const title = `${product.name} — ${store.name}`;
  const description =
    product.description ?? `Buy ${product.name} from ${store.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
      url: `${appUrl}/store/${slug}/products/${id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.images[0] ? [product.images[0]] : [],
    },
    alternates: { canonical: `${appUrl}/store/${slug}/products/${id}` },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug, id } = await params;

  const [store, product] = await Promise.all([
    getStorefrontStore(slug),
    prisma.product.findUnique({
      where: { id },
      include: { variantAttributes: true, variantCombos: true },
    }),
  ]);

  if (
    !store ||
    !product ||
    product.storeId !== store.id ||
    !product.isVisible
  ) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const productUrl = `${appUrl}/store/${slug}/products/${id}`;
  const inStock = !product.trackStock || product.stock > 0;

  const jsonLdProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    image: product.images,
    url: productUrl,
    ...(product.sku ? { sku: product.sku } : {}),
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: store.currency,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: productUrl,
      seller: { "@type": "Organization", name: store.name },
    },
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: appUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: store.name,
        item: `${appUrl}/store/${slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Products",
        item: `${appUrl}/store/${slug}/products`,
      },
      { "@type": "ListItem", position: 4, name: product.name, item: productUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28 lg:px-10">
        {/* Back navigation */}
        <Link
          href={`/store/${slug}/products`}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All products
        </Link>

        {/* Two-column layout — stacks on mobile */}
        <ProductDetailSection
          product={product}
          storeSlug={slug}
          currency={store.currency}
          primaryColor={store.primaryColor}
        />

        {/* Product meta footer */}
        <div className="mt-16 border-t border-zinc-100 pt-8 text-xs text-zinc-400">
          Price shown in {formatMoney(product.price, store.currency).slice(0, 1)}
          {store.currency}. All sales handled directly by{" "}
          <span className="font-medium text-zinc-600">{store.name}</span>.
        </div>
      </main>
    </>
  );
}
