import { prisma } from "@/lib/prisma";
import { MerchantTable } from "@/components/admin/MerchantTable";

export const metadata = { title: "Merchants — Admin — Storefronts" };
export const dynamic = "force-dynamic";

export default async function AdminMerchantsPage() {
  const merchants = await prisma.merchant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      store: {
        include: { _count: { select: { products: true, orders: true } } },
      },
    },
  });

  const rows = merchants.map((m) => ({
    id: m.id,
    email: m.email,
    phone: m.phone,
    createdAt: m.createdAt.toISOString(),
    storeName: m.store?.name ?? null,
    storeSlug: m.store?.slug ?? null,
    plan: m.store?.plan ?? null,
    subscriptionStatus: m.store?.subscriptionStatus ?? null,
    isSuspended: m.store?.isSuspended ?? false,
    onboardingComplete: m.store?.onboardingComplete ?? false,
    productCount: m.store?._count.products ?? 0,
    orderCount: m.store?._count.orders ?? 0,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="pt-1">
        <h1 className="font-heading text-2xl font-bold text-zinc-900 sm:text-3xl">Merchants</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {rows.length} merchant{rows.length === 1 ? "" : "s"} on the platform.
        </p>
      </div>

      <MerchantTable merchants={rows} />
    </div>
  );
}
