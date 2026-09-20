import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireMerchant, AuthenticationError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { QuickLinks } from "@/components/dashboard/QuickLinks";

export const metadata = { title: "Dashboard — Storefronts" };

export default async function DashboardPage() {
  let merchant;
  try {
    merchant = await requireMerchant();
  } catch (e) {
    if (e instanceof AuthenticationError) redirect("/sign-in");
    throw e;
  }

  if (!merchant.store?.onboardingComplete) redirect("/onboarding");
  const store = merchant.store;
  const storeId = store.id;

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [revenueAgg, orderCount, paidOrderCount, productCount, recentOrders, chartOrders] =
    await Promise.all([
      prisma.order.aggregate({
        where: { storeId, paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { storeId } }),
      prisma.order.count({ where: { storeId, paymentStatus: "PAID" } }),
      prisma.product.count({ where: { storeId } }),
      prisma.order.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          reference: true,
          customerName: true,
          total: true,
          paymentStatus: true,
          fulfillmentStatus: true,
          createdAt: true,
        },
      }),
      prisma.order.findMany({
        where: { storeId, paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } },
        select: { total: true, createdAt: true },
      }),
    ]);

  // Build 30-day chart data, filling missing dates with 0
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const storeUrl = `${appUrl}/store/${store.slug}`;

  const recentOrdersSerialized = recentOrders.map((o) => ({
    id: o.id,
    reference: o.reference,
    customerName: o.customerName,
    total: o.total,
    paymentStatus: o.paymentStatus,
    fulfillmentStatus: o.fulfillmentStatus,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Store identity */}
      <div className="pt-1">
        <h1 className="font-heading text-2xl font-bold text-zinc-900 sm:text-3xl">
          {store.name}
        </h1>
        <Link
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex w-fit items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-600"
        >
          {storeUrl.replace(/^https?:\/\//, "")}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Stat cards */}
      <StatsGrid
        revenue={revenueAgg._sum.total ?? 0}
        orderCount={orderCount}
        productCount={productCount}
        paidOrderCount={paidOrderCount}
        currency={store.currency}
      />

      {/* Revenue chart + Quick links */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">Revenue — last 30 days</h2>
          <RevenueChart data={chartData} currency={store.currency} />
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-5">
          <QuickLinks
            storeUrl={storeUrl}
            storeSlug={store.slug}
            paystackEnabled={store.paystackEnabled}
            codEnabled={store.codEnabled}
            productCount={productCount}
          />
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-zinc-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Recent orders</h2>
          <Link
            href="/orders"
            className="text-xs text-zinc-400 transition-colors hover:text-zinc-900"
          >
            View all →
          </Link>
        </div>
        <RecentOrders orders={recentOrdersSerialized} currency={store.currency} />
      </div>
    </div>
  );
}
