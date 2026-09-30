import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findCombo, cartItemKey } from "@/lib/variants";

interface ValidateCartItem {
  productId: string;
  selectedVariants?: Record<string, string>;
}

// Public, no auth — buyers re-check their cart against live stock before and
// during checkout. Never trusts client-supplied price/stock, only ids.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const items: ValidateCartItem[] = Array.isArray(body?.items) ? body.items : [];

    const store = await prisma.store.findUnique({
      where: { slug, isSuspended: false },
      select: { id: true },
    });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, storeId: store.id },
      include: { variantCombos: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const results = items.map((item) => {
      const selectedVariants = item.selectedVariants ?? {};
      const key = cartItemKey(item.productId, selectedVariants);
      const product = productMap.get(item.productId);

      if (!product || !product.isVisible) {
        return { key, productId: item.productId, selectedVariants, available: false, maxQty: 0 };
      }

      let combo;
      if (product.variantCombos.length > 0) {
        combo = findCombo(product.variantCombos, selectedVariants);
        if (!combo) {
          return { key, productId: item.productId, selectedVariants, available: false, maxQty: 0 };
        }
      }

      if (!product.trackStock) {
        return { key, productId: item.productId, selectedVariants, available: true, maxQty: null };
      }

      const maxQty = combo ? combo.stock : product.stock;
      return { key, productId: item.productId, selectedVariants, available: maxQty > 0, maxQty };
    });

    return NextResponse.json({ data: results });
  } catch (e) {
    console.error("[POST /api/storefront/[slug]/validate-cart]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
