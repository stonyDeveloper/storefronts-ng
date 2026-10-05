import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TopStores } from "@/components/admin/TopStores";
import { formatMoney } from "@/lib/utils";

export const metadata = { title: "Admin overview — Storefronts" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const [
    merchantCount,
    storeCount,
    suspendedCount,
    gmvAgg,
    feeAgg,
    orderCount,
    ordersToday,
    chartOrders,
    topStoresRaw,
  ] = await Promise.all([
    prisma.merchant.count(),
    prisma.store.count(),
    prisma.store.count({ where: { isSuspended: true } }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { platformFee: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.findMany({
      where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } },
      select: { total: true, createdAt: true },
    }),
    prisma.order.groupBy({
      by: ["storeId"],
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
  ]);

  const dayMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const order of chartOrders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    dayMap.set(key, (dayMap.get(key) ?? 0) + order.total);
  }
  const chartData = Array.from(dayMap.entries()).map(([date, revenue]) => ({ date, revenue }));

  const topStoreIds = topStoresRaw.map((s) => s.storeId);
  const topStoreDetails = topStoreIds.length
    ? await prisma.store.findMany({
        where: { id: { in: topStoreIds } },
        select: { id: true, name: true, slug: true, currency: true },
      })
    : [];
  const topStores = topStoresRaw.map((s) => {
    const store = topStoreDetails.find((d) => d.id === s.storeId);
    return {
      id: s.storeId,
      name: store?.name ?? "Unknown store",
      slug: store?.slug ?? "",
      revenue: s._sum.total ?? 0,
      currency: store?.currency ?? "NGN",
    };
  });

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="pt-1">
        <h1 className="font-heading text-2xl font-bold text-zinc-900 sm:text-3xl">
          Platform overview
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Cross-tenant metrics across every merchant on Storefronts.
        </p>
      </div>

      <AdminStatsGrid
        gmv={gmvAgg._sum.total ?? 0}
        platformFees={feeAgg._sum.platformFee ?? 0}
        merchantCount={merchantCount}
        storeCount={storeCount}
        suspendedCount={suspendedCount}
        orderCount={orderCount}
        ordersToday={ordersToday}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">GMV — last 30 days</h2>
          <RevenueChart data={chartData} />
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Top stores</h2>
            <Link href="/admin/merchants" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">
              View all →
            </Link>
          </div>
          <TopStores stores={topStores} />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white p-5 text-xs text-zinc-400">
        Platform fee shown is what Paystack auto-splits to our settlement account — we never
        hold merchant funds (Model B). Total collected: {formatMoney(feeAgg._sum.platformFee ?? 0, "NGN")}.
      </div>
    </div>
  );
}
