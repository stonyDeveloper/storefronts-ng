import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { requireMerchant, AuthenticationError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { waMeLink } from "@/lib/utils";
import { OrderDetail } from "@/components/orders/OrderDetail";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export const metadata = { title: "Order — Storefronts" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const merchant = await requireMerchant();
    if (!merchant.store) redirect("/onboarding");

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    // Tenant isolation — never render another store's order
    if (!order || order.storeId !== merchant.store.id) notFound();

    const waMeUrl = waMeLink(
      order.customerPhone,
      merchant.store.country,
      `Hi ${order.customerName}, this is ${merchant.store.name} — about your order ${order.reference}.`
    );

    return (
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <Link
          href="/orders"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Orders
        </Link>

        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-heading text-2xl font-bold text-zinc-900">{order.reference}</h1>
          <OrderStatusBadge status={order.fulfillmentStatus} />
          <p className="w-full text-sm text-zinc-500 sm:w-auto">
            Placed {format(order.createdAt, "d MMM yyyy, HH:mm")}
          </p>
        </div>

        <OrderDetail
          order={{
            id: order.id,
            reference: order.reference,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            deliveryAddress: order.deliveryAddress,
            deliveryCity: order.deliveryCity,
            deliveryState: order.deliveryState,
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee,
            platformFee: order.platformFee,
            total: order.total,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            fulfillmentStatus: order.fulfillmentStatus,
            notes: order.notes,
            deliveredAt: order.deliveredAt,
            createdAt: order.createdAt,
            items: order.items.map((item) => ({
              id: item.id,
              productName: item.productName,
              productImage: item.productImage,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              selectedVariants: item.selectedVariants,
            })),
          }}
          currency={merchant.store.currency}
          waMeUrl={waMeUrl}
        />
      </div>
    );
  } catch (e) {
    if (e instanceof AuthenticationError) redirect("/sign-in");
    throw e;
  }
}
