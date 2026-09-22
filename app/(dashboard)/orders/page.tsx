import { redirect } from "next/navigation";
import { requireMerchant, AuthenticationError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import { OrderTable, type OrderRow } from "@/components/orders/OrderTable";

export const metadata = { title: "Orders — Storefronts" };

export default async function OrdersPage() {
  try {
    const merchant = await requireMerchant();
    if (!merchant.store) redirect("/onboarding");

    const orders = await prisma.order.findMany({
      where: { storeId: merchant.store.id },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
    });

    const currency = merchant.store.currency;
    const pending = orders.filter((o) => o.fulfillmentStatus === "PENDING").length;
    const paidRevenue = orders
      .filter((o) => o.paymentStatus === "PAID")
      .reduce((sum, o) => sum + o.total, 0);

    const rows: OrderRow[] = orders.map((order) => ({
      id: order.id,
      reference: order.reference,
      customerName: order.customerName,
      total: order.total,
      itemCount: order._count.items,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      createdAt: order.createdAt,
    }));

    return (
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold text-zinc-900">Orders</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {orders.length} total
            {pending > 0 && ` · ${pending} awaiting action`}
            {paidRevenue > 0 && ` · ${formatMoney(paidRevenue, currency)} collected`}
          </p>
        </div>

        <OrderTable orders={rows} currency={currency} />
      </div>
    );
  } catch (e) {
    if (e instanceof AuthenticationError) redirect("/sign-in");
    throw e;
  }
}
