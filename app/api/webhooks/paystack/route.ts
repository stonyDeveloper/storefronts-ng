import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { notifyOrderPlaced } from "@/lib/notify";
import { decrementOrderItemStock } from "@/lib/orders";

// Paystack sends the raw body for HMAC verification — do not pre-parse
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  // PAYSTACK_WEBHOOK_SECRET = same as secret key per spec
  const secret =
    process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    console.error("[webhook/paystack] Missing secret key");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // Constant-time HMAC-SHA512 comparison (prevents timing attacks)
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");

  let signatureValid = false;
  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expectedBuf = Buffer.from(expected, "hex");
    signatureValid =
      sigBuf.length === expectedBuf.length &&
      timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    signatureValid = false;
  }

  if (!signatureValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { event: string; data: Record<string, unknown> };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Acknowledge non-charge events immediately — we only care about charge.success
  if (payload.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = payload.data.reference as string | undefined;
  const amount = payload.data.amount as number | undefined;

  if (!reference) {
    return NextResponse.json({ error: "Missing reference in event" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { reference },
      include: { items: { include: { product: true } }, store: true },
    });

    // Unknown reference — could be a charge from another integration; just acknowledge
    if (!order) {
      return NextResponse.json({ received: true });
    }

    // Idempotency guard — client verify may have already marked this PAID
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ received: true });
    }

    // Amount guard — reject if Paystack confirmed a different amount than the order total
    if (amount !== undefined && amount !== order.total) {
      console.error(
        `[webhook/paystack] Amount mismatch on ${reference}: expected ${order.total}, got ${amount}`
      );
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Mark PAID + decrement stock atomically
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { reference },
        data: {
          paymentStatus: "PAID",
          paystackRef: reference,
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

    // Notify outside the transaction — failure here must not return a non-200 to Paystack
    notifyOrderPlaced(updatedOrder).catch((e) =>
      console.error("[webhook/paystack/notify]", e)
    );

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook/paystack]", err);
    // Return 500 so Paystack retries — but only for genuine processing errors
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
