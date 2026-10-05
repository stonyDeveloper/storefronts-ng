import { prisma } from "@/lib/prisma";
import { AdminOrderTable } from "@/components/admin/AdminOrderTable";

export const metadata = { title: "Orders — Admin — Storefronts" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { store: { select: { name: true, slug: true, currency: true } } },
  });

  const rows = orders.map((o) => ({
    id: o.id,
    reference: o.reference,
    customerName: o.customerName,
    total: o.total,
    currency: o.store.currency,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    fulfillmentStatus: o.fulfillmentStatus,
    createdAt: o.createdAt.toISOString(),
    storeName: o.store.name,
    storeSlug: o.store.slug,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="pt-1">
        <h1 className="font-heading text-2xl font-bold text-zinc-900 sm:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Most recent {rows.length} orders across every store, newest first.
        </p>
      </div>

      <AdminOrderTable orders={rows} />
    </div>
  );
}
