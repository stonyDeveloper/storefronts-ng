import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SettlementsTable } from "@/components/admin/SettlementsTable";

export const metadata = { title: "Payments — Admin — Storefronts" };
export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [gmvAgg, feeAgg, paystackAgg, codAgg, chartOrders, recentPaid] = await Promise.all([
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { platformFee: true } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", paymentMethod: "PAYSTACK" },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", paymentMethod: "CASH_ON_DELIVERY" },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.findMany({
      where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } },
      select: { platformFee: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { paymentStatus: "PAID" },
      orderBy: { updatedAt: "desc" },
      take: 15,
      include: { store: { select: { name: true, slug: true, currency: true } } },
    }),
  ]);

  const dayMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const o of chartOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    dayMap.set(key, (dayMap.get(key) ?? 0) + o.platformFee);
  }
  const chartData = Array.from(dayMap.entries()).map(([date, revenue]) => ({ date, revenue }));

  const totalOrders = gmvAgg._count;
  const avgOrderValue = totalOrders > 0 ? Math.round((gmvAgg._sum.total ?? 0) / totalOrders) : 0;

  const settlements = recentPaid.map((o) => ({
    id: o.id,
    reference: o.reference,
    storeName: o.store.name,
    storeSlug: o.store.slug,
    total: o.total,
    platformFee: o.platformFee,
    merchantReceives: o.total - o.platformFee,
    paymentMethod: o.paymentMethod,
    currency: o.store.currency,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="pt-1">
        <h1 className="font-heading text-2xl font-bold text-zinc-900 sm:text-3xl">Payments</h1>
        <p className="mt-1 text-sm text-zinc-400">
          GMV, platform fees, and the Paystack/COD split — Model B, we never hold merchant funds.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-zinc-900 p-5">
          <p className="text-xs text-zinc-400">Total GMV</p>
          <p className="mt-1 font-heading text-xl font-bold text-white sm:text-2xl">
            {formatMoney(gmvAgg._sum.total ?? 0, "NGN")}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-5">
          <p className="text-xs text-zinc-400">Platform fees earned</p>
          <p className="mt-1 font-heading text-xl font-bold text-zinc-900 sm:text-2xl">
            {formatMoney(feeAgg._sum.platformFee ?? 0, "NGN")}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-5">
          <p className="text-xs text-zinc-400">Avg order value</p>
          <p className="mt-1 font-heading text-xl font-bold text-zinc-900 sm:text-2xl">
            {formatMoney(avgOrderValue, "NGN")}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-5">
          <p className="text-xs text-zinc-400">Paid orders</p>
          <p className="mt-1 font-heading text-xl font-bold text-zinc-900 sm:text-2xl">{totalOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">Platform fee revenue — last 30 days</h2>
          <RevenueChart data={chartData} />
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">Payment method split</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-900">Paystack</span>
                <span className="text-zinc-500">{paystackAgg._count} orders</span>
              </div>
              <p className="text-lg font-semibold text-zinc-900">
                {formatMoney(paystackAgg._sum.total ?? 0, "NGN")}
              </p>
              <p className="text-xs text-zinc-400">Auto-split at settlement — we never touch this.</p>
            </div>
            <div className="border-t border-zinc-50 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-900">Cash on delivery</span>
                <span className="text-zinc-500">{codAgg._count} orders</span>
              </div>
              <p className="text-lg font-semibold text-zinc-900">
                {formatMoney(codAgg._sum.total ?? 0, "NGN")}
              </p>
              <p className="text-xs text-zinc-400">No platform fee collected on COD (MVP).</p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-100 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900">Recent settlements</h2>
        <SettlementsTable settlements={settlements} />
      </section>
    </div>
  );
}
