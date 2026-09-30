"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useCartStore, useStoreCartItems, useCartTotal } from "@/store/cart";
import { formatMoney } from "@/lib/utils";
import { cartItemKey } from "@/lib/variants";
import { useCartValidation } from "@/hooks/useCartValidation";

interface CartDrawerProps {
  storeSlug: string;
  currency: string;
  primaryColor: string;
}

export function CartDrawer({ storeSlug, currency, primaryColor }: CartDrawerProps) {
  const cartOpen = useUIStore((s) => s.cartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const items = useStoreCartItems(storeSlug);
  const total = useCartTotal(storeSlug);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const { results, hasIssues } = useCartValidation(storeSlug, items);

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  // Live stock shifted under an item sitting in the cart — clamp it down
  // rather than letting the buyer carry an unfulfillable quantity to checkout.
  useEffect(() => {
    for (const item of items) {
      const r = results[cartItemKey(item.productId, item.selectedVariants)];
      if (r && r.available && r.maxQty !== null && item.quantity > r.maxQty) {
        updateQuantity(item.productId, item.selectedVariants, r.maxQty);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  // Close on Escape
  useEffect(() => {
    if (!cartOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closeCart}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            role="dialog"
            aria-label="Shopping cart"
            aria-modal="true"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="h-5 w-5 text-zinc-600" />
                <h2 className="text-base font-semibold text-zinc-900">
                  Cart
                  {totalQty > 0 && (
                    <span className="ml-2 font-normal text-zinc-400">
                      ({totalQty} {totalQty === 1 ? "item" : "items"})
                    </span>
                  )}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            {items.length === 0 ? (
              <EmptyCart primaryColor={primaryColor} onClose={closeCart} />
            ) : (
              <>
                <ul className="flex-1 divide-y divide-zinc-50 overflow-y-auto px-5">
                  {items.map((item) => {
                    const variantSummary = Object.entries(item.selectedVariants)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ");
                    const validation = results[cartItemKey(item.productId, item.selectedVariants)];
                    const unavailable = validation && !validation.available;
                    const atMax =
                      !unavailable &&
                      validation?.maxQty !== null &&
                      validation?.maxQty !== undefined &&
                      item.quantity >= validation.maxQty;
                    return (
                      <li
                        key={`${item.productId}-${JSON.stringify(item.selectedVariants)}`}
                        className="py-4"
                      >
                        <div className="flex gap-3.5">
                          {/* Image */}
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-zinc-200" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex min-w-0 flex-1 flex-col">
                            <p className="truncate text-sm font-medium text-zinc-800">
                              {item.name}
                            </p>
                            {variantSummary && (
                              <p className="mt-0.5 text-xs text-zinc-400">{variantSummary}</p>
                            )}
                            <p className="mt-1.5 text-sm font-semibold text-zinc-900">
                              {formatMoney(item.price * item.quantity, currency)}
                            </p>
                          </div>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId, item.selectedVariants)}
                            className="shrink-0 self-start rounded-lg p-1.5 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-400"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Quantity controls */}
                        <div className="mt-3 flex items-center gap-2">
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.selectedVariants,
                                item.quantity - 1
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </motion.button>

                          <span className="w-8 text-center text-sm font-medium tabular-nums text-zinc-800">
                            {item.quantity}
                          </span>

                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            disabled={unavailable || atMax}
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.selectedVariants,
                                item.quantity + 1
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-200 disabled:hover:bg-transparent"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </motion.button>

                          <span className="ml-auto text-xs text-zinc-400">
                            {formatMoney(item.price, currency)} each
                          </span>
                        </div>

                        {unavailable ? (
                          <p className="mt-1.5 text-xs font-medium text-red-500">
                            No longer available
                          </p>
                        ) : atMax ? (
                          <p className="mt-1.5 text-xs font-medium text-amber-600">
                            Max available quantity
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>

                {/* Footer */}
                <div className="border-t border-zinc-100 bg-white px-5 py-5">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Subtotal</span>
                    <span className="font-heading text-xl font-bold text-zinc-900">
                      {formatMoney(total, currency)}
                    </span>
                  </div>
                  <p className="mb-4 text-xs text-zinc-400">
                    Delivery fee calculated at checkout.
                  </p>
                  {hasIssues ? (
                    <div className="flex w-full flex-col items-center gap-1.5 rounded-2xl bg-zinc-100 py-4 text-center">
                      <span className="text-sm font-medium text-zinc-400">
                        Resolve the cart issues above to checkout
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={`/store/${storeSlug}/checkout`}
                      onClick={closeCart}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Checkout · {formatMoney(total, currency)}
                    </Link>
                  )}
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyCart({
  primaryColor,
  onClose,
}: {
  primaryColor: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100"
      >
        <ShoppingCart className="h-9 w-9 text-zinc-300" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.3 }}
      >
        <p className="font-semibold text-zinc-800">Your cart is empty</p>
        <p className="mt-1 text-sm text-zinc-400">Add some products to get started.</p>
      </motion.div>
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.26 }}
        onClick={onClose}
        className="mt-1 text-sm font-medium underline-offset-2 hover:underline"
        style={{ color: primaryColor }}
      >
        Continue shopping
      </motion.button>
    </div>
  );
}
