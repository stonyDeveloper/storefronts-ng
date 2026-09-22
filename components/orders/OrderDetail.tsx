"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Check,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Banknote,
  CreditCard,
  Ban,
  Package,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { FulfillmentStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { cn, formatMoney } from "@/lib/utils";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export interface OrderDetailData {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  notes: string | null;
  deliveredAt: Date | null;
  createdAt: Date;
  items: Array<{
    id: string;
    productName: string;
    productImage: string | null;
    quantity: number;
    unitPrice: number;
    selectedVariants: unknown;
  }>;
}

interface OrderDetailProps {
  order: OrderDetailData;
  currency: string;
  waMeUrl: string | null;
}

const PIPELINE: Array<{ value: FulfillmentStatus; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "DELIVERED", label: "Delivered" },
];

function variantSummary(selected: unknown): string | null {
  if (!selected || typeof selected !== "object") return null;
  const entries = Object.entries(selected as Record<string, unknown>).filter(
    ([, v]) => typeof v === "string" && v.length > 0
  );
  if (entries.length === 0) return null;
  return entries.map(([k, v]) => `${k}: ${v}`).join(" · ");
}

export function OrderDetail({ order, currency, waMeUrl }: OrderDetailProps) {
  const router = useRouter();
  const [status, setStatus] = useState<FulfillmentStatus>(order.fulfillmentStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.paymentStatus);
  const [updating, setUpdating] = useState<FulfillmentStatus | null>(null);
  const [error, setError] = useState("");
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const isCancelled = status === "CANCELLED";
  const isCod = order.paymentMethod === "CASH_ON_DELIVERY";
  const merchantReceives = order.total - order.platformFee;

  async function updateStatus(next: FulfillmentStatus) {
    if (next === status || updating) return;

    setUpdating(next);
    setError("");

    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fulfillmentStatus: next }),
    });

    const json = await res.json();
    setUpdating(null);

    if (!res.ok) {
      const message = json.error ?? "Failed to update status";
      setError(message);
      toast.error(message);
      return;
    }

    setStatus(json.data.fulfillmentStatus);
    setPaymentStatus(json.data.paymentStatus);
    if (next === "CANCELLED") toast.success("Order cancelled");
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Left column — status + items */}
      <div className="space-y-4 lg:col-span-2">
        {/* Fulfillment status */}
        <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
          <div className="border-b border-zinc-50 px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">Fulfillment</h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Move the order along as you pack, dispatch, and deliver it.
            </p>
          </div>
          <div className="p-5">
            {isCancelled ? (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3">
                <Ban className="h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-700">
                  This order was cancelled{order.deliveredAt ? "" : " and is no longer active"}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PIPELINE.map(({ value, label }, i) => {
                  const currentIndex = PIPELINE.findIndex((s) => s.value === status);
                  const reached = i <= currentIndex;
                  const isCurrent = value === status;
                  const isLoading = updating === value;
                  return (
                    <motion.button
                      key={value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => updateStatus(value)}
                      disabled={updating !== null || isCurrent}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors",
                        reached
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300",
                        isCurrent && "cursor-default"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : reached ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : null}
                      {label}
                    </motion.button>
                  );
                })}
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 text-xs text-red-500"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {status === "DELIVERED" && order.deliveredAt && (
              <p className="mt-3 text-xs text-zinc-400">
                Delivered {format(order.deliveredAt, "d MMM yyyy, HH:mm")}
              </p>
            )}

            {!isCancelled && status !== "DELIVERED" && (
              <button
                onClick={() => setCancelConfirmOpen(true)}
                disabled={updating !== null}
                className="mt-4 text-xs font-medium text-red-500 transition-colors hover:text-red-600 disabled:opacity-50"
              >
                Cancel this order
              </button>
            )}
          </div>
        </section>

        <ConfirmDialog
          open={cancelConfirmOpen}
          onOpenChange={setCancelConfirmOpen}
          title="Cancel this order?"
          description="The buyer will not be notified automatically — contact them first."
          confirmLabel="Cancel order"
          variant="destructive"
          onConfirm={() => updateStatus("CANCELLED")}
        />

        {/* Items */}
        <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
          <div className="border-b border-zinc-50 px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">
              Items <span className="font-normal text-zinc-400">({order.items.length})</span>
            </h2>
          </div>
          <ul className="divide-y divide-zinc-50">
            {order.items.map((item) => {
              const variants = variantSummary(item.selectedVariants);
              return (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      width={52}
                      height={52}
                      className="h-13 w-13 shrink-0 rounded-xl border border-zinc-100 object-cover"
                    />
                  ) : (
                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                      <Package className="h-5 w-5 text-zinc-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">{item.productName}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {variants ? `${variants} · ` : ""}
                      {formatMoney(item.unitPrice, currency)} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
                    {formatMoney(item.unitPrice * item.quantity, currency)}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="space-y-1.5 border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 text-sm">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatMoney(order.subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Delivery</span>
              <span className="tabular-nums">
                {order.deliveryFee > 0 ? formatMoney(order.deliveryFee, currency) : "Free"}
              </span>
            </div>
            <div className="flex justify-between pt-1 font-semibold text-zinc-900">
              <span>Total</span>
              <span className="tabular-nums">{formatMoney(order.total, currency)}</span>
            </div>
            {order.platformFee > 0 && (
              <div className="flex justify-between pt-1 text-xs text-zinc-400">
                <span>Platform fee −{formatMoney(order.platformFee, currency)}</span>
                <span className="tabular-nums">You receive {formatMoney(merchantReceives, currency)}</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Right column — payment + buyer */}
      <div className="space-y-4">
        {/* Payment */}
        <section className="rounded-2xl border border-zinc-100 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900">Payment</h2>
          <div className="flex items-center gap-2">
            {isCod ? (
              <Banknote className="h-4 w-4 text-zinc-400" />
            ) : (
              <CreditCard className="h-4 w-4 text-zinc-400" />
            )}
            <span className="text-sm text-zinc-700">
              {isCod ? "Cash on delivery" : "Paystack"}
            </span>
            <OrderStatusBadge status={paymentStatus} variant="payment" className="ml-auto" />
          </div>
          {isCod && paymentStatus === "PENDING" && !isCancelled && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-700">
              Collect {formatMoney(order.total, currency)} in cash at delivery. Marking the order
              as delivered records the payment.
            </p>
          )}
        </section>

        {/* Buyer */}
        <section className="rounded-2xl border border-zinc-100 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900">Buyer</h2>
          <p className="text-sm font-medium text-zinc-900">{order.customerName}</p>

          <div className="mt-3 space-y-2.5 text-sm">
            <a
              href={`tel:${order.customerPhone}`}
              className="flex items-center gap-2.5 text-zinc-600 transition-colors hover:text-zinc-900"
            >
              <Phone className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              {order.customerPhone}
            </a>
            <a
              href={`mailto:${order.customerEmail}`}
              className="flex items-center gap-2.5 break-all text-zinc-600 transition-colors hover:text-zinc-900"
            >
              <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              {order.customerEmail}
            </a>
            <div className="flex items-start gap-2.5 text-zinc-600">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span>
                {order.deliveryAddress}, {order.deliveryCity}, {order.deliveryState}
              </span>
            </div>
          </div>

          {waMeUrl && (
            <motion.a
              whileTap={{ scale: 0.97 }}
              href={waMeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </motion.a>
          )}
        </section>

        {/* Buyer notes */}
        {order.notes && (
          <section className="rounded-2xl border border-zinc-100 bg-white p-5">
            <h2 className="mb-2 text-sm font-semibold text-zinc-900">Order notes</h2>
            <p className="text-sm italic leading-relaxed text-zinc-600">&ldquo;{order.notes}&rdquo;</p>
          </section>
        )}
      </div>
    </div>
  );
}
