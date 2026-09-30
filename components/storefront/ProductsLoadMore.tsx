"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Loader2 } from "lucide-react";
import { StorefrontProductCard } from "./StorefrontProductCard";
import type { ProductWithVariants } from "@/types";

interface ProductsLoadMoreProps {
  initialProducts: ProductWithVariants[];
  total: number;
  storeSlug: string;
  sort: string;
  search: string;
  currency: string;
  primaryColor: string;
}

export function ProductsLoadMore({
  initialProducts,
  total,
  storeSlug,
  sort,
  search,
  currency,
  primaryColor,
}: ProductsLoadMoreProps) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = products.length < total;

  async function loadMore() {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const qs = new URLSearchParams({ page: String(nextPage), sort });
      if (search) qs.set("search", search);
      const res = await fetch(`/api/storefront/${storeSlug}/products?${qs}`);
      const json = await res.json();
      if (json.data?.length) {
        setProducts((prev) => [...prev, ...json.data]);
        setPage(nextPage);
      }
    } finally {
      setLoading(false);
    }
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
          <Package className="h-7 w-7 text-zinc-300" />
        </div>
        <p className="text-base font-semibold text-zinc-900">No products found</p>
        {search && (
          <p className="mt-1 text-sm text-zinc-400">
            Try a different search term or clear the filter.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: Math.min(i * 0.04, 0.2),
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <StorefrontProductCard
              product={product}
              storeSlug={storeSlug}
              currency={currency}
              primaryColor={primaryColor}
            />
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={loadMore}
            disabled={loading}
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-7 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-shadow hover:border-zinc-300 hover:shadow-md disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Loading…" : "Load more"}
          </motion.button>
          <p className="text-xs text-zinc-400">
            Showing {products.length} of {total}
          </p>
        </div>
      )}
    </div>
  );
}
