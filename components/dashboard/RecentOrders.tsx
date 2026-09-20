"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatMoney } from "@/lib/utils";
import type { FulfillmentStatus, PaymentStatus } from "@prisma/client";

export interface RecentOrder {
  id: string;
  reference: string;
  customerName: string;
  total: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  createdAt: string;
}

interface RecentOrdersProps {
  orders: RecentOrder[];
  currency?: string;
}

export function RecentOrders({ orders, currency = "NGN" }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50">
          <ShoppingBag className="h-7 w-7 text-zinc-300" />
        </div>
        <p className="text-sm font-medium text-zinc-900">No orders yet</p>
        <p className="mt-1 max-w-xs text-xs text-zinc-400">
          When buyers place orders on your store, they&apos;ll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-50">
      {orders.map((order, i) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Link
            href={`/orders/${order.id}`}
            className="-mx-4 flex items-center gap-4 rounded-xl px-4 py-3.5 transition-colors hover:bg-zinc-50 sm:-mx-6 sm:px-6"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900">
                {order.customerName}
              </p>
              <p className="text-xs text-zinc-400">
                #{order.reference.slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <OrderStatusBadge status={order.paymentStatus} variant="payment" />
              <OrderStatusBadge status={order.fulfillmentStatus} variant="fulfillment" />
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-zinc-900">
                {formatMoney(order.total, currency)}
              </p>
              <p className="text-xs text-zinc-400">
                {new Date(order.createdAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
