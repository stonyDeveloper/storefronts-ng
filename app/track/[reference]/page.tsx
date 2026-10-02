import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PackageSearch, MessageCircle, Store as StoreIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatMoney, waMeLink } from "@/lib/utils";
import { TrackingTimeline } from "@/components/storefront/TrackingTimeline";
import { TrackLookupForm } from "@/components/storefront/TrackLookupForm";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

// Order status must always be fresh — never cache this page.
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ reference: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Track order ${decodeURIComponent(reference)} — Storefronts`,
    robots: { index: false },
  };
}

async function getOrder(reference: string) {
  return prisma.order.findUnique({
    where: { reference },
    include: {
      items: true,
      store: {
        select: {
          name: true,
          slug: true,
          logoUrl: true,
          primaryColor: true,
          currency: true,
          country: true,
          merchant: { select: { phone: true } },
        },
      },
    },
  });
}

export default async function TrackOrderPage({ params }: Props) {
  const { reference } = await params;
  const order = await getOrder(decodeURIComponent(reference));

  if (!order) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
          <PackageSearch className="h-7 w-7 text-zinc-400" />
        </span>
        <h1 className="mt-6 font-heading text-2xl font-bold text-zinc-900">
          We couldn&apos;t find that order
        </h1>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">
          Double-check the reference from your confirmation email or receipt —
          it should look like{" "}
          <span className="font-mono text-xs text-zinc-600">SF-…</span> — and
          try again.
        </p>
        <TrackLookupForm />
      </main>
    );
  }

  const { store } = order;
  const currency = store.currency;
  const primaryColor = store.primaryColor;
  const isCOD = order.paymentMethod === "CASH_ON_DELIVERY";
  const waUrl = store.merchant.phone
    ? waMeLink(
        store.merchant.phone,
        store.country,
        `Hi ${store.name}! I'm asking about my order ${order.reference}.`
      )
    : null;

  return (
    <main className="mx-auto max-w-lg px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
      {/* Store identity */}
      <Link
        href={`/store/${store.slug}`}
        className="mx-auto flex w-fit items-center gap-2.5 rounded-full border border-zinc-100 bg-white py-1.5 pl-2 pr-4 shadow-sm transition-shadow hover:shadow-md"
      >
        {store.logoUrl ? (
          <Image
            src={store.logoUrl}
            alt={store.name}
            width={28}
            height={28}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <StoreIcon className="h-3.5 w-3.5" />
          </span>
        )}
        <span className="text-sm font-semibold text-zinc-800">{store.name}</span>
      </Link>

      {/* Header */}
      <div className="mt-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Tracking order
        </p>
        <h1 className="mt-1 font-mono text-lg font-bold text-zinc-900 sm:text-xl">
          {order.reference}
        </h1>
        <div className="mt-3 flex items-center justify-center gap-2">
          <OrderStatusBadge status={order.fulfillmentStatus} />
          <OrderStatusBadge status={order.paymentStatus} variant="payment" />
        </div>
      </div>

      {/* Timeline */}
      <section className="mt-8 rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6">
        <TrackingTimeline
          status={order.fulfillmentStatus}
          primaryColor={primaryColor}
          placedAt={order.createdAt.toISOString()}
          deliveredAt={order.deliveredAt?.toISOString() ?? null}
        />
        {isCOD && order.paymentStatus === "PENDING" && order.fulfillmentStatus !== "CANCELLED" && (
          <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
            You chose <span className="font-semibold">cash on delivery</span> —
            have {formatMoney(order.total, currency)} ready when your order
            arrives.
          </p>
        )}
      </section>

      {/* Items */}
      <section className="mt-4 rounded-2xl border border-zinc-100 bg-white">
        <div className="border-b border-zinc-50 px-5 py-3">
          <p className="text-sm font-semibold text-zinc-700">
            {order.items.length} {order.items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <ul className="divide-y divide-zinc-50 px-5">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              {item.productImage ? (
                <Image
                  src={item.productImage}
                  alt={item.productName}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-lg border border-zinc-100 object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-50">
                  <PackageSearch className="h-4 w-4 text-zinc-300" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-800">
                  {item.productName}
                </p>
                <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-zinc-900">
                {formatMoney(item.unitPrice * item.quantity, currency)}
              </p>
            </li>
          ))}
        </ul>
        <div className="space-y-1.5 border-t border-zinc-100 px-5 py-3.5">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Subtotal</span>
            <span>{formatMoney(order.subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Delivery</span>
            <span>
              {order.deliveryFee > 0 ? formatMoney(order.deliveryFee, currency) : "Free"}
            </span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-sm font-semibold text-zinc-700">Total</span>
            <span className="font-heading text-base font-bold text-zinc-900">
              {formatMoney(order.total, currency)}
            </span>
          </div>
        </div>
      </section>

      {/* Delivery details */}
      <section className="mt-4 rounded-2xl border border-zinc-100 bg-white px-5 py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Delivering to
        </p>
        <p className="text-sm font-medium text-zinc-800">{order.customerName}</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {order.deliveryAddress}, {order.deliveryCity}, {order.deliveryState}
        </p>
        <p className="text-xs text-zinc-500">{order.customerPhone}</p>
      </section>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3">
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            Chat with {store.name} on WhatsApp
          </a>
        )}
        <Link
          href={`/store/${store.slug}`}
          className="rounded-2xl border border-zinc-200 bg-white py-3.5 text-center text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Visit store
        </Link>
      </div>

      <p className="mt-8 text-center text-[11px] text-zinc-400">
        Status updates appear here as the store processes your order — check
        back anytime.
      </p>
    </main>
  );
}
