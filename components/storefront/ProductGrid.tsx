"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { StorefrontProductCard } from "./StorefrontProductCard";
import type { ProductWithVariants } from "@/types";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

interface ProductGridProps {
  products: ProductWithVariants[];
  storeSlug: string;
  currency: string;
  primaryColor: string;
}

export function ProductGrid({
  products,
  storeSlug,
  currency,
  primaryColor,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <section id="products" className="py-28 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100">
          <Package className="h-9 w-9 text-zinc-300" />
        </div>
        <p className="mt-5 text-lg font-semibold text-zinc-900">New products coming soon</p>
        <p className="mt-2 text-sm text-zinc-400">
          Check back later for our latest collection.
        </p>
      </section>
    );
  }

  return (
    <section id="products" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="font-heading text-2xl font-bold text-zinc-900 sm:text-3xl">
          Products
        </h2>
        <Link
          href={`/store/${storeSlug}/products`}
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-900"
        >
          View all →
        </Link>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={item}>
            <StorefrontProductCard
              product={product}
              storeSlug={storeSlug}
              currency={currency}
              primaryColor={primaryColor}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
