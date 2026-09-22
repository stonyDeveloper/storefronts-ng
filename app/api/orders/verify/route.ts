import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paystackProvider } from "@/lib/payments/paystack";
import { notifyOrderPlaced } from "@/lib/notify";
import { decrementOrderItemStock } from "@/lib/orders";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ error: "Payment reference required" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { reference: ref },
      include: { items: { include: { product: true } }, store: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotency — already verified
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ data: { order } });
    }

    const result = await paystackProvider.verifyPayment(ref);

    if (result.status !== "success") {
      return NextResponse.json({ error: "Payment not confirmed by Paystack" }, { status: 402 });
    }

    // Guard: amount must match (prevents replay with under-paid transactions)
    if (result.amount !== order.total) {
      console.error(
        `[verify] Amount mismatch for ${ref}: expected ${order.total}, got ${result.amount}`
      );
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
    }

    // Mark PAID + decrement stock atomically
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { reference: ref },
        data: {
          paymentStatus: "PAID",
          paystackRef: ref,
          fulfillmentStatus: "PROCESSING",
        },
        include: {
          items: { include: { product: { include: { variantCombos: true } } } },
          store: true,
        },
      });

      await decrementOrderItemStock(tx, updated.items);

      return updated;
    });

    // Notify outside the transaction — failure here shouldn't roll back the payment record
    notifyOrderPlaced(updatedOrder).catch((e) => console.error("[notify]", e));

    return NextResponse.json({ data: { order: updatedOrder } });
  } catch (err) {
    console.error("[GET /api/orders/verify]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
