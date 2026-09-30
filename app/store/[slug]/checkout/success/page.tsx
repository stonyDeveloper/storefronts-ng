import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStorefrontStore } from "@/lib/storefront";
import { formatMoney } from "@/lib/utils";
import { SuccessAnimation } from "@/components/storefront/SuccessAnimation";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Order confirmed", robots: { index: false } };
}

export default async function CheckoutSuccessPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { ref } = await searchParams;

  const [store, order] = await Promise.all([
    getStorefrontStore(slug),
    ref
      ? prisma.order.findUnique({
          where: { reference: ref },
          include: { items: true },
        })
      : Promise.resolve(null),
  ]);

  const isPaid = order?.paymentStatus === "PAID";
  const isCOD = order?.paymentMethod === "CASH_ON_DELIVERY";
  const primaryColor = store?.primaryColor ?? "#18181b";
  const currency = store?.currency ?? "NGN";

  return (
    <main className="mx-auto max-w-lg px-4 pb-24 pt-24 sm:px-6 sm:pt-32 text-center">
      {/* Animated checkmark */}
      <SuccessAnimation primaryColor={primaryColor} />

      {/* Heading */}
      <h1 className="mt-8 font-heading text-3xl font-bold text-zinc-900">
        {isCOD ? "Order placed!" : isPaid ? "Payment confirmed!" : "Order received!"}
      </h1>
      <p className="mt-3 text-base text-zinc-500">
        {isCOD
          ? "The store will contact you to arrange delivery. Have your cash ready."
          : "Your payment was successful. The store is preparing your order."}
      </p>

      {/* Reference */}
      {order && (
        <div className="mt-6 rounded-2xl border border-zinc-100 bg-zinc-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Order reference
          </p>
          <p className="mt-1 font-mono text-sm font-bold text-zinc-800">{order.reference}</p>
          <p className="mt-1 text-xs text-zinc-400">
            Save this to track your order
          </p>
        </div>
      )}

      {/* Order items */}
      {order && order.items.length > 0 && (
        <div className="mt-6 rounded-2xl border border-zinc-100 bg-white text-left">
          <div className="border-b border-zinc-50 px-5 py-3">
            <p className="text-sm font-semibold text-zinc-700">What you ordered</p>
          </div>
          <ul className="divide-y divide-zinc-50 px-5">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-800">{item.productName}</p>
                  <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-zinc-900">
                  {formatMoney(item.unitPrice * item.quantity, currency)}
                </p>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3">
            <span className="text-sm font-semibold text-zinc-700">Total paid</span>
            <span className="font-heading text-base font-bold text-zinc-900">
              {formatMoney(order.total, currency)}
            </span>
          </div>
        </div>
      )}

      {/* Customer info */}
      {order && (
        <div className="mt-4 rounded-2xl border border-zinc-100 bg-white text-left px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
            Delivering to
          </p>
          <p className="text-sm font-medium text-zinc-800">{order.customerName}</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {order.deliveryAddress}, {order.deliveryCity}, {order.deliveryState}
          </p>
          <p className="text-xs text-zinc-500">{order.customerPhone}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3">
        {ref && (
          <Link
            href={`/track/${ref}`}
            className="rounded-2xl py-3.5 text-sm font-semibold text-white shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            Track your order
          </Link>
        )}
        <Link
          href={`/store/${slug}`}
          className="rounded-2xl border border-zinc-200 bg-white py-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
