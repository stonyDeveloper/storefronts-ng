import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckoutSchema } from "@/lib/validations";
import { generateRef } from "@/lib/utils";
import { paystackProvider } from "@/lib/payments/paystack";
import { notifyOrderPlaced } from "@/lib/notify";
import { requireMerchant, AuthenticationError } from "@/lib/auth";
import { findCombo } from "@/lib/variants";

class CheckoutError extends Error {}

// Merchant: list own orders (tenant-scoped)
export async function GET() {
  try {
    const merchant = await requireMerchant();
    if (!merchant.store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Lazy sweep: a buyer who starts a Paystack checkout and never completes
    // or retries payment leaves a permanent PENDING order behind. Clean those
    // up on read rather than running scheduled infra for it. COD orders are
    // untouched — PENDING there just means "not yet delivered/paid", not abandoned.
    await prisma.order.updateMany({
      where: {
        storeId: merchant.store.id,
        paymentMethod: "PAYSTACK",
        paymentStatus: "PENDING",
        fulfillmentStatus: "PENDING",
        createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      data: { fulfillmentStatus: "CANCELLED" },
    });

    const orders = await prisma.order.findMany({
      where: { storeId: merchant.store.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: orders });
  } catch (e) {
    if (e instanceof AuthenticationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/orders]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const storeSlug = typeof body.storeSlug === "string" ? body.storeSlug : null;
    if (!storeSlug) {
      return NextResponse.json({ error: "Store not specified" }, { status: 400 });
    }

    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid checkout data" },
        { status: 422 }
      );
    }

    const data = parsed.data;

    const store = await prisma.store.findUnique({
      where: { slug: storeSlug, isSuspended: false },
      select: {
        id: true,
        deliveryFee: true,
        platformFeePercent: true,
        paystackSubaccountCode: true,
        paystackEnabled: true,
        codEnabled: true,
        currency: true,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    if (data.paymentMethod === "PAYSTACK" && !store.paystackEnabled) {
      return NextResponse.json(
        { error: "Online payment is not available for this store" },
        { status: 400 }
      );
    }
    if (data.paymentMethod === "CASH_ON_DELIVERY" && !store.codEnabled) {
      return NextResponse.json(
        { error: "Cash on delivery is not available for this store" },
        { status: 400 }
      );
    }

    // Fetch products (server-side prices — never trust client). Dedupe first:
    // two cart lines can reference the same product via different variant
    // combos, but a SQL `IN` only returns each matching row once.
    const productIds = [...new Set(data.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, storeId: store.id, isVisible: true },
      include: { variantCombos: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products are no longer available" },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    if (data.paymentMethod === "CASH_ON_DELIVERY" && products.some((p) => !p.codEnabled)) {
      return NextResponse.json(
        { error: "Cash on delivery is not available for one or more items in this order" },
        { status: 400 }
      );
    }

    // Resolve each line's combo (if the product has variants), validate stock,
    // and compute subtotal — never trust price/stock from the client.
    let subtotal = 0;
    const resolved = data.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const selectedVariants = item.selectedVariants ?? {};

      let combo: (typeof product.variantCombos)[number] | undefined;
      if (product.variantCombos.length > 0) {
        combo = findCombo(product.variantCombos, selectedVariants);
        if (!combo) {
          throw new CheckoutError(`Invalid variant selection for "${product.name}"`);
        }
      }

      const unitPrice = combo ? combo.price ?? product.price : product.price;
      const availableStock = combo ? combo.stock : product.stock;
      if (product.trackStock && availableStock < item.quantity) {
        throw new CheckoutError(`"${product.name}" doesn't have enough stock`);
      }

      subtotal += unitPrice * item.quantity;
      return { item, product, combo, unitPrice, selectedVariants };
    });

    const deliveryFee = store.deliveryFee;
    const total = subtotal + deliveryFee;
    // Platform fee only for card payments (auto-split via Paystack). COD is free for MVP.
    const platformFee =
      data.paymentMethod === "PAYSTACK"
        ? Math.round(total * (store.platformFeePercent / 100))
        : 0;

    const reference = generateRef();

    const order = await prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          storeId: store.id,
          reference,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          deliveryAddress: data.deliveryAddress,
          deliveryCity: data.deliveryCity,
          deliveryState: data.deliveryState,
          notes: data.notes,
          subtotal,
          deliveryFee,
          platformFee,
          total,
          paymentMethod: data.paymentMethod,
          paymentStatus: "PENDING",
          fulfillmentStatus: "PENDING",
          items: {
            create: resolved.map(({ item, product, combo, unitPrice, selectedVariants }) => ({
              productId: item.productId,
              productName: product.name,
              productImage: combo?.image ?? product.images[0] ?? null,
              quantity: item.quantity,
              unitPrice,
              selectedVariants,
            })),
          },
        },
        include: { items: { include: { product: true } }, store: true },
      });
    });

    // Cash on delivery — notify immediately, no payment to init
    if (data.paymentMethod === "CASH_ON_DELIVERY") {
      notifyOrderPlaced(order).catch((e) => console.error("[notify]", e));
      return NextResponse.json({ data: { orderId: order.id, reference: order.reference } });
    }

    // Paystack — initialize transaction server-side, return accessCode to client
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const result = await paystackProvider.initializePayment({
      amount: total,
      email: data.customerEmail,
      reference,
      subaccountCode: store.paystackSubaccountCode!,
      callbackUrl: `${appUrl}/store/${storeSlug}/checkout/success?ref=${reference}`,
      metadata: { orderId: order.id, storeSlug },
    });

    return NextResponse.json({
      data: { orderId: order.id, reference, accessCode: result.accessCode },
    });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ error: "Failed to place order. Please try again." }, { status: 500 });
  }
}
