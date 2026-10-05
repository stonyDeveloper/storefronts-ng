import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail, Phone, Building2, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { MerchantSuspendToggle } from "@/components/admin/MerchantSuspendToggle";

export const metadata = { title: "Merchant detail — Admin — Storefronts" };
export const dynamic = "force-dynamic";

export default async function AdminMerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const merchant = await prisma.merchant.findUnique({
    where: { id },
    include: { store: true },
  });

  if (!merchant) notFound();

  const store = merchant.store;

  const [recentOrders, gmvAgg, feeAgg] = store
    ? await Promise.all([
        prisma.order.findMany({
          where: { storeId: store.id },
          orderBy: { createdAt: "desc" },
          take: 10,
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
        prisma.order.aggregate({
          where: { storeId: store.id, paymentStatus: "PAID" },
          _sum: { total: true },
        }),
        prisma.order.aggregate({
          where: { storeId: store.id, paymentStatus: "PAID" },
          _sum: { platformFee: true },
        }),
      ])
    : [[], { _sum: { total: 0 } }, { _sum: { platformFee: 0 } }];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      <Link
        href="/admin/merchants"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Merchants
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-zinc-900 sm:text-3xl">
            {store?.name ?? "No store yet"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{merchant.email}</p>
        </div>
        {store && (
          <MerchantSuspendToggle
            storeId={store.id}
            storeName={store.name}
            isSuspended={store.isSuspended}
          />
        )}
      </div>

      {!store && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-sm text-amber-700">
          This merchant has not created a store yet — nothing else to show.
        </div>
      )}

      {store && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              { label: "GMV (paid)", value: formatMoney(gmvAgg._sum.total ?? 0, store.currency) },
              { label: "Platform fees", value: formatMoney(feeAgg._sum.platformFee ?? 0, store.currency) },
              { label: "Plan", value: store.plan },
              { label: "Subscription", value: store.subscriptionStatus },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-zinc-100 bg-white p-4">
                <p className="text-xs text-zinc-400">{s.label}</p>
                <p className="mt-1 font-heading text-lg font-bold text-zinc-900">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Store info */}
            <section className="rounded-2xl border border-zinc-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-zinc-900">Store</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-400">Public URL</dt>
                  <dd>
                    <Link
                      href={`${appUrl}/store/${store.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-medium text-zinc-900 hover:underline"
                    >
                      /{store.slug}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-400">Category</dt>
                  <dd className="font-medium text-zinc-900">{store.category}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-400">Country / currency</dt>
                  <dd className="font-medium text-zinc-900">{store.country} · {store.currency}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-400">Onboarding</dt>
                  <dd className="flex items-center gap-1.5 font-medium text-zinc-900">
                    {store.onboardingComplete ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-amber-500" />
                    )}
                    {store.onboardingComplete ? "Complete" : "Incomplete"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-400">Joined</dt>
                  <dd className="font-medium text-zinc-900">{format(merchant.createdAt, "d MMM yyyy")}</dd>
                </div>
              </dl>
            </section>

            {/* Payment setup */}
            <section className="rounded-2xl border border-zinc-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-zinc-900">Payments</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-400">Paystack</dt>
                  <dd className="flex items-center gap-1.5 font-medium text-zinc-900">
                    {store.paystackEnabled ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-zinc-300" />
                    )}
                    {store.paystackEnabled ? "Connected" : "Not connected"}
                  </dd>
                </div>
                {store.paystackEnabled && (
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-400">Settlement account</dt>
                    <dd className="flex items-center gap-1.5 font-medium text-zinc-900">
                      <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                      {store.bankAccountName ?? "—"}
                      {store.bankAccountNumber && ` ••••${store.bankAccountNumber.slice(-4)}`}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-400">Cash on delivery</dt>
                  <dd className="font-medium text-zinc-900">{store.codEnabled ? "Enabled" : "Disabled"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-400">Platform fee</dt>
                  <dd className="font-medium text-zinc-900">{store.platformFeePercent}%</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-400">Contact</dt>
                  <dd className="flex items-center gap-2 font-medium text-zinc-900">
                    <a href={`mailto:${merchant.email}`} className="flex items-center gap-1 hover:underline">
                      <Mail className="h-3.5 w-3.5 text-zinc-400" />
                    </a>
                    {merchant.phone && (
                      <a href={`tel:${merchant.phone}`} className="flex items-center gap-1 hover:underline">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                      </a>
                    )}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Recent orders */}
          <section className="rounded-2xl border border-zinc-100 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">Recent orders</h2>
            {recentOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-400">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-zinc-50">
                {recentOrders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">{o.reference}</p>
                      <p className="text-xs text-zinc-400">
                        {o.customerName} · {format(o.createdAt, "d MMM yyyy")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <OrderStatusBadge status={o.fulfillmentStatus} />
                      <span className="text-sm font-semibold tabular-nums text-zinc-900">
                        {formatMoney(o.total, store.currency)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
