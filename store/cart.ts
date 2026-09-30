"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

export interface CartItem {
  productId: string;
  storeSlug: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  selectedVariants: Record<string, string>;
  /** Captured at add-to-cart time. Undefined on carts persisted before this field existed — treat as allowed. */
  codEnabled?: boolean;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, selectedVariants: Record<string, string>) => void;
  updateQuantity: (
    productId: string,
    selectedVariants: Record<string, string>,
    qty: number
  ) => void;
  clearCart: () => void;
  clearStoreCart: (storeSlug: string) => void;
}

function variantKey(variants: Record<string, string>): string {
  return Object.entries(variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}

function isSameItem(
  item: CartItem,
  productId: string,
  selectedVariants: Record<string, string>
): boolean {
  return (
    item.productId === productId &&
    variantKey(item.selectedVariants) === variantKey(selectedVariants)
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const exists = state.items.find((i) =>
            isSameItem(i, newItem.productId, newItem.selectedVariants)
          );
          if (exists) {
            return {
              items: state.items.map((i) =>
                isSameItem(i, newItem.productId, newItem.selectedVariants)
                  ? { ...i, quantity: i.quantity + (newItem.quantity ?? 1) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...newItem, quantity: newItem.quantity ?? 1 }],
          };
        }),

      removeItem: (productId, selectedVariants) =>
        set((state) => ({
          items: state.items.filter((i) => !isSameItem(i, productId, selectedVariants)),
        })),

      updateQuantity: (productId, selectedVariants, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => !isSameItem(i, productId, selectedVariants))
              : state.items.map((i) =>
                  isSameItem(i, productId, selectedVariants) ? { ...i, quantity: qty } : i
                ),
        })),

      clearCart: () => set({ items: [] }),

      clearStoreCart: (storeSlug) =>
        set((state) => ({
          items: state.items.filter((i) => i.storeSlug !== storeSlug),
        })),
    }),
    { name: "sf-cart" }
  )
);

export function useCartItemCount(storeSlug?: string) {
  return useCartStore((state) => {
    const items = storeSlug
      ? state.items.filter((i) => i.storeSlug === storeSlug)
      : state.items;
    return items.reduce((sum, i) => sum + i.quantity, 0);
  });
}

export function useCartTotal(storeSlug?: string) {
  return useCartStore((state) => {
    const items = storeSlug
      ? state.items.filter((i) => i.storeSlug === storeSlug)
      : state.items;
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  });
}

export function useStoreCartItems(storeSlug: string) {
  return useCartStore(
    useShallow((state) => state.items.filter((i) => i.storeSlug === storeSlug))
  );
}

/** How many units of this exact product+variant selection are already in the cart. */
export function useCartItemQuantity(
  productId: string,
  selectedVariants: Record<string, string>
) {
  return useCartStore(
    (state) => state.items.find((i) => isSameItem(i, productId, selectedVariants))?.quantity ?? 0
  );
}
