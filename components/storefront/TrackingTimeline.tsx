"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Receipt, Package, Truck, Home, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FulfillmentStatus } from "@prisma/client";

const STEPS = [
  {
    key: "PENDING",
    label: "Order placed",
    description: "We've received your order",
    icon: Receipt,
  },
  {
    key: "PROCESSING",
    label: "Processing",
    description: "The store is preparing your order",
    icon: Package,
  },
  {
    key: "DISPATCHED",
    label: "Dispatched",
    description: "Your order is on its way",
    icon: Truck,
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    description: "Your order has arrived",
    icon: Home,
  },
] as const;

interface TrackingTimelineProps {
  status: FulfillmentStatus;
  primaryColor: string;
  placedAt: string; // ISO — serialized across the server boundary
  deliveredAt?: string | null;
}

export function TrackingTimeline({
  status,
  primaryColor,
  placedAt,
  deliveredAt,
}: TrackingTimelineProps) {
  const reduced = useReducedMotion();

  if (status === "CANCELLED") {
    return (
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex items-start gap-4 rounded-2xl border border-red-100 bg-red-50/60 px-5 py-4"
      >
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-5 w-5 text-red-500" />
        </span>
        <div>
          <p className="text-sm font-semibold text-red-700">Order cancelled</p>
          <p className="mt-1 text-sm text-red-600/80">
            This order was cancelled. If you weren't expecting this, contact the
            store directly — they can help sort it out.
          </p>
        </div>
      </motion.div>
    );
  }

  const activeIndex = STEPS.findIndex((s) => s.key === status);
  // The colored line reaches the center of the active step's icon.
  const progress = activeIndex <= 0 ? 0 : (activeIndex / (STEPS.length - 1)) * 100;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="relative">
      {/* Track line — sits behind the icons, spans first to last icon center */}
      <div className="absolute bottom-5 left-5 top-5 w-0.5 -translate-x-1/2 rounded-full bg-zinc-100" />
      <motion.div
        className="absolute left-5 top-5 w-0.5 origin-top -translate-x-1/2 rounded-full"
        style={{
          backgroundColor: primaryColor,
          height: `calc((100% - 2.5rem) * ${progress / 100})`,
        }}
        initial={reduced ? false : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      />

      <ol className="relative space-y-7">
        {STEPS.map((step, i) => {
          const reached = i <= activeIndex;
          const isCurrent = i === activeIndex;
          const isDone = i < activeIndex || status === "DELIVERED";
          const Icon = step.icon;

          return (
            <motion.li
              key={step.key}
              initial={reduced ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: reduced ? 0 : 0.1 + i * 0.12,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="flex items-start gap-4"
            >
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                {/* Pulse ring on the current (not yet complete) step */}
                {isCurrent && status !== "DELIVERED" && !reduced && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                    initial={{ opacity: 0.35, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.55 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <span
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
                    reached
                      ? "border-transparent text-white shadow-md"
                      : "border-zinc-200 bg-white text-zinc-300"
                  )}
                  style={reached ? { backgroundColor: primaryColor } : undefined}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </span>
              </span>

              <div className="pt-1">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    reached ? "text-zinc-900" : "text-zinc-400"
                  )}
                >
                  {step.label}
                  {isCurrent && status !== "DELIVERED" && (
                    <span
                      className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Current
                    </span>
                  )}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    reached ? "text-zinc-500" : "text-zinc-300"
                  )}
                >
                  {step.description}
                </p>
                {step.key === "PENDING" && (
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    {formatDate(placedAt)}
                  </p>
                )}
                {step.key === "DELIVERED" && isDone && deliveredAt && (
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    {formatDate(deliveredAt)}
                  </p>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
