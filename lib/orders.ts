import type { Prisma } from "@prisma/client";
import { findCombo } from "./variants";

type StockDecrementItem = {
  productId: string;
  quantity: number;
  selectedVariants: Prisma.JsonValue;
  product: {
    trackStock: boolean;
    variantCombos: { id: string; options: Prisma.JsonValue; stock: number }[];
  };
};

/**
 * Decrements the correct stock target for a newly-paid/fulfilled order item —
 * the matching variant combo when the product has variants, otherwise the
 * base product stock. Must run inside the same transaction that marks the
 * order PAID (called identically from verify, the webhook, and COD-delivered).
 */
export async function decrementOrderItemStock(
  tx: Prisma.TransactionClient,
  items: StockDecrementItem[]
) {
  for (const item of items) {
    if (!item.product.trackStock) continue;

    if (item.product.variantCombos.length > 0) {
      const combo = findCombo(
        item.product.variantCombos,
        (item.selectedVariants ?? {}) as Record<string, string>
      );
      if (combo) {
        await tx.productVariantCombo.update({
          where: { id: combo.id },
          data: { stock: { decrement: item.quantity } },
        });
      }
      continue;
    }

    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }
}
