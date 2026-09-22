"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, ChevronRight, Banknote, CreditCard } from "lucide-react";
import { format } from "date-fns";
import type { FulfillmentStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { cn, formatMoney } from "@/lib/utils";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";

export interface OrderRow {
  id: string;
  reference: string;
  customerName: string;
  total: number;
  itemCount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  createdAt: Date;
}

interface OrderTableProps {
  orders: OrderRow[];
  currency: string;
}

const TABS: Array<{ label: string; value: FulfillmentStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Dispatched", value: "DISPATCHED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function OrderTable({ orders, currency }: OrderTableProps) {
  const [tab, setTab] = useState<FulfillmentStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: orders.length };
    for (const order of orders) {
      c[order.fulfillmentStatus] = (c[order.fulfillmentStatus] ?? 0) + 1;
    }
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (tab !== "ALL" && order.fulfillmentStatus !== tab) return false;
      if (!q) return true;
      return (
        order.reference.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q)
      );
    });
  }, [orders, tab, search]);

  return (
    <div>
      {/* Filter tabs + search */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 [scrollbar-width:none]">
          {TABS.map(({ label, value }) => {
            const count = counts[value] ?? 0;
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
                {count > 0 && (
                  <span className={cn("ml-1.5 tabular-nums", active ? "text-zinc-400" : "text-zinc-400")}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference or buyer…"
            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
          />
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <EmptyState
          icon={ShoppingBag}
          title={orders.length === 0 ? "No orders yet" : "No matching orders"}
          description={
            orders.length === 0
              ? "Share your store link on WhatsApp and Instagram — orders will land here."
              : "Try a different status or search term."
          }
        />
      )}

      {/* Desktop table */}
      {filtered.length > 0 && (
        <div className="hidden overflow-hidden rounded-2xl border border-zinc-100 bg-white md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs text-zinc-400">
                <th className="px-5 py-3.5 font-medium">Order</th>
                <th className="px-5 py-3.5 font-medium">Buyer</th>
                <th className="px-5 py-3.5 font-medium">Payment</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-medium">Total</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3), ease: "easeOut" }}
                    className="group relative border-b border-zinc-50 last:border-0 transition-colors hover:bg-zinc-50/60"
                  >
                    <td className="px-5 py-4">
                      <Link href={`/orders/${order.id}`} className="font-medium text-zinc-900 after:absolute after:inset-0">
                        {order.reference}
                      </Link>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {format(order.createdAt, "d MMM yyyy, HH:mm")} · {order.itemCount}{" "}
                        {order.itemCount === 1 ? "item" : "items"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-zinc-700">{order.customerName}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {order.paymentMethod === "CASH_ON_DELIVERY" ? (
                          <Banknote className="h-3.5 w-3.5 text-zinc-400" />
                        ) : (
                          <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                        )}
                        <OrderStatusBadge status={order.paymentStatus} variant="payment" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusBadge status={order.fulfillmentStatus} />
                    </td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums text-zinc-900">
                      {formatMoney(order.total, currency)}
                    </td>
                    <td className="pr-4">
                      <ChevronRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-500" />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {filtered.length > 0 && (
        <div className="space-y-3 md:hidden">
          <AnimatePresence initial={false}>
            {filtered.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3), ease: "easeOut" }}
              >
                <Link
                  href={`/orders/${order.id}`}
                  className="block rounded-2xl border border-zinc-100 bg-white p-4 transition-colors active:bg-zinc-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{order.reference}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {order.customerName} · {format(order.createdAt, "d MMM, HH:mm")}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
                      {formatMoney(order.total, currency)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <OrderStatusBadge status={order.fulfillmentStatus} />
                    <OrderStatusBadge status={order.paymentStatus} variant="payment" />
                    {order.paymentMethod === "CASH_ON_DELIVERY" && (
                      <span className="text-[11px] text-zinc-400">Cash on delivery</span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
