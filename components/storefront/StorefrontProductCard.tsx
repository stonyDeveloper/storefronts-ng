"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { isOutOfStock } from "@/lib/variants";
import type { ProductWithVariants } from "@/types";

interface StorefrontProductCardProps {
  product: ProductWithVariants;
  storeSlug: string;
  currency: string;
  primaryColor: string;
}

export function StorefrontProductCard({
  product,
  storeSlug,
  currency,
  primaryColor,
}: StorefrontProductCardProps) {
  const imageUrl = product.images[0];
  const outOfStock = isOutOfStock(product);
  const hasDiscount =
    product.comparePrice != null && product.comparePrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.comparePrice! - product.price) / product.comparePrice!) * 100
      )
    : 0;

  return (
    <motion.div
      whileHover={outOfStock ? {} : { y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.10)" }}
      className="group overflow-hidden rounded-2xl bg-white transition-shadow"
    >
      <Link href={`/store/${storeSlug}/products/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-zinc-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageOff className="h-8 w-8 text-zinc-200" />
            </div>
          )}

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-500 shadow">
                Out of stock
              </span>
            </div>
          )}

          {/* Discount badge */}
          {hasDiscount && !outOfStock && (
            <div
              className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow"
              style={{ backgroundColor: primaryColor }}
            >
              -{discountPct}%
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4">
          <p className="truncate text-sm font-medium text-zinc-800">{product.name}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-base font-bold text-zinc-900">
              {formatMoney(product.price, currency)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-zinc-400 line-through">
                {formatMoney(product.comparePrice!, currency)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
