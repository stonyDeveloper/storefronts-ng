import { redirect } from "next/navigation";
import { requireMerchant, AuthenticationError } from "@/lib/auth";
import { GeneralSection } from "@/components/settings/GeneralSection";
import { BrandingSection } from "@/components/settings/BrandingSection";
import { HeroStyleSection } from "@/components/settings/HeroStyleSection";
import { PaymentsSection } from "@/components/settings/PaymentsSection";
import { SlugSection } from "@/components/settings/SlugSection";
import { DangerSection } from "@/components/settings/DangerSection";

export const metadata = { title: "Settings — Storefronts" };

export default async function SettingsPage() {
  let merchant;
  try {
    merchant = await requireMerchant();
  } catch (e) {
    if (e instanceof AuthenticationError) redirect("/sign-in");
    throw e;
  }

  if (!merchant.store) redirect("/onboarding");
  const store = merchant.store;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 sm:space-y-5 sm:p-6">
      <div className="pt-1">
        <h1 className="font-heading text-2xl font-bold text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage your store configuration.</p>
      </div>

      <GeneralSection
        storeId={store.id}
        name={store.name}
        description={store.description}
        deliveryFee={store.deliveryFee}
        currency={store.currency}
      />

      <BrandingSection
        storeId={store.id}
        storeName={store.name}
        logoUrl={store.logoUrl}
        primaryColor={store.primaryColor}
        accentColor={store.accentColor}
      />

      <HeroStyleSection
        storeId={store.id}
        slug={store.slug}
        storeName={store.name}
        primaryColor={store.primaryColor}
        category={store.category}
        heroStyle={store.heroStyle}
      />

      <PaymentsSection
        storeId={store.id}
        paystackEnabled={store.paystackEnabled}
        bankCode={store.bankCode}
        bankAccountNumber={store.bankAccountNumber}
        bankAccountName={store.bankAccountName}
        codEnabled={store.codEnabled}
      />

      <SlugSection
        storeId={store.id}
        currentSlug={store.slug}
        appUrl={appUrl}
      />

      <DangerSection storeId={store.id} storeName={store.name} />
    </div>
  );
}
