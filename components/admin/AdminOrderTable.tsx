"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Banknote, CreditCard } from "lucide-react";
import { format } from "date-fns";
import type { FulfillmentStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { cn, formatMoney } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";

export interface AdminOrderRow {
  id: string;
  reference: string;
  customerName: string;
  total: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  createdAt: string;
  storeName: string;
  storeSlug: string;
}

const TABS: Array<{ label: string; value: FulfillmentStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Dispatched", value: "DISPATCHED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function AdminOrderTable({ orders }: { orders: AdminOrderRow[] }) {
  const [tab, setTab] = useState<FulfillmentStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (tab !== "ALL" && o.fulfillmentStatus !== tab) return false;
      if (!q) return true;
      return (
        o.reference.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.storeName.toLowerCase().includes(q)
      );
    });
  }, [orders, tab, search]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 [scrollbar-width:none]">
          {TABS.map(({ label, value }) => {
            const active = tab === value;
            return (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, buyer, or store…"
            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={ShoppingBag}
          title={orders.length === 0 ? "No orders yet" : "No matching orders"}
          description={
            orders.length === 0
              ? "Orders will appear here as merchants start selling."
              : "Try a different status or search term."
          }
        />
      )}

      {filtered.length > 0 && (
        <div className="hidden overflow-hidden rounded-2xl border border-zinc-100 bg-white md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs text-zinc-400">
                <th className="px-5 py-3.5 font-medium">Order</th>
                <th className="px-5 py-3.5 font-medium">Store</th>
                <th className="px-5 py-3.5 font-medium">Buyer</th>
                <th className="px-5 py-3.5 font-medium">Payment</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((o, i) => (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3), ease: "easeOut" }}
                    className="border-b border-zinc-50 last:border-0 transition-colors hover:bg-zinc-50/60"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-900">{o.reference}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {format(new Date(o.createdAt), "d MMM yyyy, HH:mm")}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-zinc-700">
                      {o.storeName}
                      <p className="text-xs text-zinc-400">/{o.storeSlug}</p>
                    </td>
                    <td className="px-5 py-4 text-zinc-700">{o.customerName}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {o.paymentMethod === "CASH_ON_DELIVERY" ? (
                          <Banknote className="h-3.5 w-3.5 text-zinc-400" />
                        ) : (
                          <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                        )}
                        <OrderStatusBadge status={o.paymentStatus} variant="payment" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusBadge status={o.fulfillmentStatus} />
                    </td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums text-zinc-900">
                      {formatMoney(o.total, o.currency)}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="space-y-3 md:hidden">
          <AnimatePresence initial={false}>
            {filtered.map((o, i) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3), ease: "easeOut" }}
                className="rounded-2xl border border-zinc-100 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{o.reference}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {o.storeName} · {o.customerName}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
                    {formatMoney(o.total, o.currency)}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <OrderStatusBadge status={o.fulfillmentStatus} />
                  <OrderStatusBadge status={o.paymentStatus} variant="payment" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
