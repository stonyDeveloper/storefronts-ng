import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStorefrontStore } from "@/lib/storefront";
import { ProductsFilterBar } from "@/components/storefront/ProductsFilterBar";
import { ProductsLoadMore } from "@/components/storefront/ProductsLoadMore";

const PAGE_LIMIT = 24;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; search?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStorefrontStore(slug);
  if (!store) return { title: "Products" };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    title: `Shop — ${store.name}`,
    description: `Browse all products from ${store.name}.`,
    alternates: { canonical: `${appUrl}/store/${slug}/products` },
  };
}

export default async function ProductsListingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort = "newest", search = "" } = await searchParams;

  const store = await getStorefrontStore(slug);
  if (!store) notFound();

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
      ? { price: "desc" as const }
      : { createdAt: "desc" as const };

  const where = {
    storeId: store.id,
    isVisible: true,
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variantAttributes: true, variantCombos: true },
      orderBy,
      take: PAGE_LIMIT,
    }),
    prisma.product.count({ where }),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 sm:pt-28 lg:px-10">
      {/* Breadcrumb */}
      <Link
        href={`/store/${slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {store.name}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-zinc-900 sm:text-4xl">
          All products
        </h1>
      </div>

      {/* Filter bar — needs Suspense because of useSearchParams() */}
      <div className="mb-6">
        <Suspense
          fallback={
            <div className="flex animate-pulse gap-3">
              <div className="h-10 flex-1 rounded-xl bg-zinc-100 sm:max-w-56" />
              <div className="h-10 w-36 rounded-xl bg-zinc-100" />
            </div>
          }
        >
          <ProductsFilterBar total={total} primaryColor={store.primaryColor} />
        </Suspense>
      </div>

      {/* Product grid + load-more
          Key resets client state when sort/search changes so stale pages don't accumulate */}
      <ProductsLoadMore
        key={`${sort}-${search}`}
        initialProducts={products}
        total={total}
        storeSlug={slug}
        sort={sort}
        search={search}
        currency={store.currency}
        primaryColor={store.primaryColor}
      />
    </main>
  );
}
