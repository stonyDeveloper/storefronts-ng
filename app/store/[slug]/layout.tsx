import { getStorefrontStore } from "@/lib/storefront";
import { StorefrontNav } from "@/components/storefront/StorefrontNav";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStorefrontStore(slug);

  // Don't call notFound() here: thrown from a layout it resolves to the ROOT
  // not-found.tsx, not this segment's. Each page already re-checks (same
  // React.cache()'d call, no extra query) and calls notFound() itself, which
  // correctly renders app/store/[slug]/not-found.tsx. If store is null here,
  // just skip the store-dependent chrome and let the page's own check fire.
  if (!store) return <>{children}</>;

  return (
    <>
      <StorefrontNav
        storeName={store.name}
        storeSlug={store.slug}
        logoUrl={store.logoUrl}
        primaryColor={store.primaryColor}
      />
      <CartDrawer
        storeSlug={store.slug}
        currency={store.currency}
        primaryColor={store.primaryColor}
      />
      {children}
      {store.merchant?.phone && (
        <WhatsAppButton
          phone={store.merchant.phone}
          country={store.country}
          storeName={store.name}
        />
      )}
    </>
  );
}
