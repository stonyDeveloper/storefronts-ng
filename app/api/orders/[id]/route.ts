import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMerchant, AuthenticationError, AuthorizationError } from "@/lib/auth";
import { UpdateOrderSchema } from "@/lib/validations";
import { decrementOrderItemStock } from "@/lib/orders";

async function getOwnedOrder(storeId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return null;
  if (order.storeId !== storeId) throw new AuthorizationError();
  return order;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const merchant = await requireMerchant();
    if (!merchant.store) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const order = await getOwnedOrder(merchant.store.id, id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json({ data: order });
  } catch (e) {
    if (e instanceof AuthenticationError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e instanceof AuthorizationError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[GET /api/orders/[id]]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const merchant = await requireMerchant();
    if (!merchant.store) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = await getOwnedOrder(merchant.store.id, id);
    if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const body = await req.json();
    const parsed = UpdateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const { fulfillmentStatus, notes } = parsed.data;

    const becomesDelivered =
      fulfillmentStatus === "DELIVERED" && existing.fulfillmentStatus !== "DELIVERED";
    // COD cash changes hands at delivery — that's when the order becomes PAID
    // and stock is decremented (the Paystack paths do this at charge confirmation).
    const collectsCodPayment =
      becomesDelivered &&
      existing.paymentMethod === "CASH_ON_DELIVERY" &&
      existing.paymentStatus === "PENDING";

    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          ...(fulfillmentStatus !== undefined && { fulfillmentStatus }),
          ...(notes !== undefined && { notes }),
          ...(becomesDelivered && { deliveredAt: new Date() }),
          ...(collectsCodPayment && { paymentStatus: "PAID" }),
        },
        include: { items: { include: { product: { include: { variantCombos: true } } } } },
      });

      if (collectsCodPayment) {
        await decrementOrderItemStock(tx, updated.items);
      }

      return updated;
    });

    return NextResponse.json({ data: order });
  } catch (e) {
    if (e instanceof AuthenticationError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e instanceof AuthorizationError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[PATCH /api/orders/[id]]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
