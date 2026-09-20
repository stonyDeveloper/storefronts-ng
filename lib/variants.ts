export interface VariantAttributeInput {
  name: string;
  values: string[];
}

export interface VariantComboInput {
  options: Record<string, string>;
  price: number | null;
  stock: number;
  image: string | null;
}

function optionsKey(options: Record<string, string>): string {
  return Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}

/**
 * Cartesian product of attribute values into combo option-maps. Preserves
 * price/stock/image from any existing combo whose option-map still matches
 * exactly, so editing one attribute doesn't wipe pricing already entered for
 * unaffected combos.
 */
export function generateCombos(
  attributes: VariantAttributeInput[],
  existingCombos: VariantComboInput[]
): VariantComboInput[] {
  const usable = attributes.filter((a) => a.name.trim() && a.values.length > 0);
  if (usable.length === 0) return [];

  const existingByKey = new Map(existingCombos.map((c) => [optionsKey(c.options), c]));

  const combos = usable.reduce<Record<string, string>[]>(
    (acc, attr) => acc.flatMap((combo) => attr.values.map((v) => ({ ...combo, [attr.name]: v }))),
    [{}]
  );

  return combos.map((options) => {
    const existing = existingByKey.get(optionsKey(options));
    return {
      options,
      price: existing?.price ?? null,
      stock: existing?.stock ?? 0,
      image: existing?.image ?? null,
    };
  });
}

/**
 * Identity key for a cart line (product + exact variant selection). Sorted
 * like optionsKey so insertion order in the selection object never matters.
 */
export function cartItemKey(productId: string, selectedVariants: Record<string, string>): string {
  return `${productId}::${optionsKey(selectedVariants)}`;
}

/** Stable, human-readable label for a combo, e.g. "M · Blue". */
export function variantLabel(options: Record<string, string>): string {
  return Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
    .join(" · ");
}

/** Match a buyer's selection against a product's combos (order-independent). */
export function findCombo<T extends { options: unknown }>(
  combos: T[],
  selected: Record<string, string>
): T | undefined {
  const selectedKey = optionsKey(selected);
  return combos.find(
    (c) => optionsKey((c.options ?? {}) as Record<string, string>) === selectedKey
  );
}

interface StockCheckable {
  trackStock: boolean;
  stock: number;
  variantCombos: { stock: number }[];
}

/**
 * Total sellable units. For variant products, Product.stock is unused —
 * availability lives entirely on the combos, so it sums those instead.
 */
export function getStockCount(product: StockCheckable): number {
  if (product.variantCombos.length > 0) {
    return product.variantCombos.reduce((sum, c) => sum + c.stock, 0);
  }
  return product.stock;
}

/** True only when tracking is on and every sellable unit (base or combo) is at zero. */
export function isOutOfStock(product: StockCheckable): boolean {
  if (!product.trackStock) return false;
  return getStockCount(product) === 0;
}
