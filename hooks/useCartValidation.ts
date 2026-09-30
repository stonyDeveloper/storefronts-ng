"use client";

import { useCallback, useEffect, useState } from "react";
import type { CartItem } from "@/store/cart";
import { cartItemKey } from "@/lib/variants";

export interface CartValidationResult {
  key: string;
  productId: string;
  selectedVariants: Record<string, string>;
  available: boolean;
  /** null = stock isn't tracked for this item (unlimited) */
  maxQty: number | null;
}

/**
 * Re-checks a storefront cart against live stock. Buyers can add items, sit
 * on a page for a while, or another buyer can deplete stock in between — this
 * catches that before checkout instead of only failing at final submit.
 */
export function useCartValidation(storeSlug: string, items: CartItem[]) {
  const [results, setResults] = useState<Record<string, CartValidationResult>>({});
  const itemsKey = items.map((i) => cartItemKey(i.productId, i.selectedVariants)).join(",");

  const revalidate = useCallback(async () => {
    if (items.length === 0) {
      setResults({});
      return;
    }
    try {
      const res = await fetch(`/api/storefront/${storeSlug}/validate-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            selectedVariants: i.selectedVariants,
          })),
        }),
      });
      if (!res.ok) return;
      const json = await res.json();
      const map: Record<string, CartValidationResult> = {};
      for (const r of json.data as CartValidationResult[]) map[r.key] = r;
      setResults(map);
    } catch {
      // Live check failed — leave prior results. The server still enforces
      // stock authoritatively at order submission either way.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSlug, itemsKey]);

  useEffect(() => {
    revalidate();
  }, [revalidate]);

  const hasIssues = items.some((i) => {
    const r = results[cartItemKey(i.productId, i.selectedVariants)];
    return r && (!r.available || (r.maxQty !== null && i.quantity > r.maxQty));
  });

  return { results, hasIssues, revalidate };
}
