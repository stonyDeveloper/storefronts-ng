import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStorefrontStore } from "@/lib/storefront";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStorefrontStore(slug);
  if (!store) return { title: "Checkout" };
  return {
    title: `Checkout — ${store.name}`,
    robots: { index: false },
  };
}

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params;
  const store = await getStorefrontStore(slug);
  if (!store) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28 lg:px-10">
      <CheckoutForm
        storeSlug={store.slug}
        storeName={store.name}
        currency={store.currency}
        primaryColor={store.primaryColor}
        paystackEnabled={store.paystackEnabled}
        codEnabled={store.codEnabled}
        deliveryFee={store.deliveryFee}
      />
    </main>
  );
}
