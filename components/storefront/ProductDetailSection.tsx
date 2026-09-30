"use client";

import { useState } from "react";
import { ProductGallery } from "./ProductGallery";
import { ProductDetail } from "./ProductDetail";
import type { ProductWithVariants } from "@/types";

interface Props {
  product: ProductWithVariants;
  storeSlug: string;
  currency: string;
  primaryColor: string;
}

/**
 * Client wrapper so the gallery can crossfade to a variant's assigned image —
 * ProductGallery and ProductDetail are siblings, so the selection has to be
 * lifted here rather than owned by either one.
 */
export function ProductDetailSection({ product, storeSlug, currency, primaryColor }: Props) {
  const [focusImage, setFocusImage] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Gallery — sticky on desktop so it stays visible while scrolling product info */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <ProductGallery images={product.images} productName={product.name} focusImage={focusImage} />
      </div>

      {/* Product info */}
      <ProductDetail
        product={product}
        storeSlug={storeSlug}
        currency={currency}
        primaryColor={primaryColor}
        onVariantImageChange={setFocusImage}
      />
    </div>
  );
}
