import { cn } from "@/lib/utils";
import type { FulfillmentStatus, PaymentStatus } from "@prisma/client";

const FULFILLMENT_STYLES: Record<FulfillmentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  DISPATCHED: "bg-violet-50 text-violet-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-600",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PAID: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-600",
  REFUNDED: "bg-zinc-100 text-zinc-600",
};

const LABELS: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

interface OrderStatusBadgeProps {
  status: FulfillmentStatus | PaymentStatus;
  variant?: "fulfillment" | "payment";
  className?: string;
}

export function OrderStatusBadge({
  status,
  variant = "fulfillment",
  className,
}: OrderStatusBadgeProps) {
  const styles = variant === "payment" ? PAYMENT_STYLES : FULFILLMENT_STYLES;
  const color = (styles as Record<string, string>)[status] ?? "bg-zinc-100 text-zinc-600";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        color,
        className
      )}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
