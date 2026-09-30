"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ShoppingCart, Check, Package, Tag } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import { useCartStore, useCartItemQuantity } from "@/store/cart";
import { findCombo } from "@/lib/variants";
import type { ProductWithVariants } from "@/types";

interface ProductDetailProps {
  product: ProductWithVariants;
  storeSlug: string;
  currency: string;
  primaryColor: string;
  /** Notifies the parent (gallery) which image to crossfade to as variants are picked. */
  onVariantImageChange?: (url: string | null) => void;
}

export function ProductDetail({
  product,
  storeSlug,
  currency,
  primaryColor,
  onVariantImageChange,
}: ProductDetailProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [addedState, setAddedState] = useState<"idle" | "added">("idle");
  const addItem = useCartStore((s) => s.addItem);
  const shouldReduceMotion = useReducedMotion();

  const hasUnselectedVariants = product.variantAttributes.some(
    (a) => !selectedVariants[a.name]
  );
  const selectedCombo = hasUnselectedVariants
    ? undefined
    : findCombo(product.variantCombos, selectedVariants);

  const effectivePrice = selectedCombo ? selectedCombo.price ?? product.price : product.price;
  const effectiveImage = selectedCombo?.image ?? product.images[0] ?? null;

  const outOfStock = product.trackStock
    ? selectedCombo
      ? selectedCombo.stock === 0
      : product.variantAttributes.length === 0 && product.stock === 0
    : false;
  const lowStock =
    product.trackStock &&
    !outOfStock &&
    (selectedCombo
      ? selectedCombo.stock <= 5
      : product.variantAttributes.length === 0 && product.stock <= 5);

  // Cap add-to-cart at what's actually left once what's already in the cart is
  // accounted for — otherwise repeated clicks (or the drawer's + stepper) can
  // push a cart past real stock with no warning.
  const alreadyInCart = useCartItemQuantity(product.id, selectedVariants);
  const availableStock = selectedCombo ? selectedCombo.stock : product.stock;
  const atCartLimit =
    product.trackStock &&
    !outOfStock &&
    !hasUnselectedVariants &&
    alreadyInCart >= availableStock;

  const hasDiscount =
    product.comparePrice != null && product.comparePrice > effectivePrice;
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - effectivePrice) / product.comparePrice!) * 100)
    : 0;

  useEffect(() => {
    onVariantImageChange?.(effectiveImage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveImage]);

  function handleVariantChange(name: string, option: string) {
    setSelectedVariants((prev) => ({ ...prev, [name]: option }));
  }

  function handleAddToCart() {
    if (outOfStock || hasUnselectedVariants || atCartLimit || addedState === "added") return;
    addItem({
      productId: product.id,
      storeSlug,
      name: product.name,
      image: effectiveImage,
      price: effectivePrice,
      selectedVariants,
      codEnabled: product.codEnabled,
    });
    setAddedState("added");
    setTimeout(() => setAddedState("idle"), 2200);
  }

  const buttonDisabled = outOfStock || hasUnselectedVariants || atCartLimit;

  return (
    <div className="flex flex-col gap-6">
      {/* Name + discount badge */}
      <div>
        {hasDiscount && (
          <span
            className="mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            -{discountPct}% OFF
          </span>
        )}
        <h1 className="font-heading text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
          {product.name}
        </h1>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="font-heading text-3xl font-bold text-zinc-900">
          {formatMoney(effectivePrice, currency)}
        </span>
        {hasDiscount && (
          <span className="text-lg text-zinc-400 line-through">
            {formatMoney(product.comparePrice!, currency)}
          </span>
        )}
      </div>

      {/* Stock status — only shown once we know which stock applies (no variants, or a full combo is selected) */}
      {(product.variantAttributes.length === 0 || selectedCombo) && (
        <div className="flex items-center gap-2">
          {outOfStock ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Out of stock
            </span>
          ) : lowStock ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Only {selectedCombo ? selectedCombo.stock : product.stock} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              In stock
            </span>
          )}
          {product.sku && (
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Tag className="h-3 w-3" />
              {product.sku}
            </span>
          )}
        </div>
      )}

      {/* Description */}
      {product.description && (
        <p className="text-sm leading-relaxed text-zinc-500 sm:text-base">
          {product.description}
        </p>
      )}

      {/* Variants */}
      {product.variantAttributes.length > 0 && (
        <div className="space-y-4 border-t border-zinc-100 pt-4">
          {product.variantAttributes.map((attribute) => (
            <div key={attribute.id}>
              <p className="mb-2.5 text-sm font-semibold text-zinc-700">
                {attribute.name}
                {selectedVariants[attribute.name] && (
                  <span className="ml-2 font-normal text-zinc-400">
                    {selectedVariants[attribute.name]}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {attribute.values.map((option) => {
                  const isSelected = selectedVariants[attribute.name] === option;
                  return (
                    <motion.button
                      key={option}
                      type="button"
                      whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                      onClick={() => handleVariantChange(attribute.name, option)}
                      className={cn(
                        "rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-150",
                        isSelected
                          ? "border-transparent text-white shadow-sm"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                      )}
                      style={
                        isSelected
                          ? { backgroundColor: primaryColor, borderColor: primaryColor }
                          : {}
                      }
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add to cart */}
      <div className="border-t border-zinc-100 pt-4">
        <motion.button
          whileTap={shouldReduceMotion || buttonDisabled ? {} : { scale: 0.97 }}
          onClick={handleAddToCart}
          disabled={buttonDisabled}
          className={cn(
            "relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl py-4 text-base font-semibold text-white shadow-lg transition-all duration-200",
            buttonDisabled
              ? "cursor-not-allowed opacity-50 shadow-none"
              : "hover:shadow-xl active:shadow-md"
          )}
          style={{ backgroundColor: primaryColor }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {addedState === "added" ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-2"
              >
                <Check className="h-5 w-5" />
                Added to cart!
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {outOfStock
                  ? "Out of stock"
                  : hasUnselectedVariants
                  ? "Select options above"
                  : atCartLimit
                  ? "All available stock in cart"
                  : "Add to cart"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Helper text when variants are unselected */}
        {hasUnselectedVariants && !outOfStock && (
          <p className="mt-2 text-center text-xs text-zinc-400">
            Please choose{" "}
            {product.variantAttributes
              .filter((a) => !selectedVariants[a.name])
              .map((a) => a.name.toLowerCase())
              .join(" and ")}
          </p>
        )}
        {atCartLimit && !hasUnselectedVariants && (
          <p className="mt-2 text-center text-xs text-zinc-400">
            You already have all {alreadyInCart} available in your cart.
          </p>
        )}
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-zinc-100 pt-4">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Delivery note */}
      <div className="flex items-start gap-2.5 rounded-xl bg-zinc-50 px-4 py-3">
        <Package className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
        <p className="text-xs text-zinc-500">
          Items ship after order confirmation. Contact the store for delivery timeline.
        </p>
      </div>
    </div>
  );
}
