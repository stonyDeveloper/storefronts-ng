import { createElement } from "react";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { formatMoney, waMeLink } from "@/lib/utils";
import OrderConfirmation from "@/emails/OrderConfirmation";
import MerchantNotification from "@/emails/MerchantNotification";
import type { OrderWithItems } from "@/types";

// Resend free tier sends from onboarding@resend.dev until a domain is verified.
const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL ?? "Storefronts <onboarding@resend.dev>";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function emailEnabled(): boolean {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === "re_placeholder") {
    console.warn("[notify] RESEND_API_KEY not configured — skipping email");
    return false;
  }
  return true;
}

export async function notifyOrderPlaced(order: OrderWithItems): Promise<void> {
  const merchant = await prisma.merchant.findUnique({
    where: { id: order.store.merchantId },
    select: { email: true },
  });

  const results = await Promise.allSettled([
    sendBuyerEmail(order, merchant?.email),
    sendMerchantEmail(order, merchant?.email),
    sendWhatsAppPush(order),
  ]);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[notify] channel failed:", result.reason);
    }
  }
}

async function sendBuyerEmail(
  order: OrderWithItems,
  merchantEmail: string | undefined
): Promise<void> {
  if (!emailEnabled()) return;

  const { store } = order;
  const isCashOnDelivery = order.paymentMethod === "CASH_ON_DELIVERY";

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: order.customerEmail,
    // Buyer replies go straight to the seller
    reply_to: merchantEmail,
    subject: `Order confirmed — ${order.reference} · ${store.name}`,
    react: createElement(OrderConfirmation, {
      storeName: store.name,
      storeLogoUrl: store.logoUrl,
      primaryColor: store.primaryColor,
      currency: store.currency,
      reference: order.reference,
      customerName: order.customerName,
      items: order.items.map((item) => ({
        name: item.productName,
        image: item.productImage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      deliveryState: order.deliveryState,
      isCashOnDelivery,
      trackUrl: `${APP_URL}/track/${order.reference}`,
      storeUrl: `${APP_URL}/store/${store.slug}`,
    }),
  });

  if (error) throw new Error(`buyer email: ${error.message}`);
}

async function sendMerchantEmail(
  order: OrderWithItems,
  merchantEmail: string | undefined
): Promise<void> {
  if (!emailEnabled()) return;

  const { store } = order;
  const isCashOnDelivery = order.paymentMethod === "CASH_ON_DELIVERY";

  if (!merchantEmail) {
    throw new Error(`merchant email: no merchant for store ${store.id}`);
  }

  const waMeUrl = waMeLink(
    order.customerPhone,
    store.country,
    `Hi ${order.customerName}, this is ${store.name} — about your order ${order.reference}.`
  );

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: merchantEmail,
    // Merchant replies go straight to the buyer
    reply_to: order.customerEmail,
    subject: `New order ${formatMoney(order.total, store.currency)} — ${order.reference}`,
    react: createElement(MerchantNotification, {
      storeName: store.name,
      currency: store.currency,
      reference: order.reference,
      items: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      deliveryState: order.deliveryState,
      isCashOnDelivery,
      notes: order.notes,
      waMeUrl,
      orderUrl: `${APP_URL}/orders/${order.id}`,
    }),
  });

  if (error) throw new Error(`merchant email: ${error.message}`);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendWhatsAppPush(_order: OrderWithItems): Promise<void> {
  // Fast-follow: wire Termii/Whispr here. No-op while WHATSAPP_API_KEY is empty.
  if (!process.env.WHATSAPP_API_KEY) return;
}
