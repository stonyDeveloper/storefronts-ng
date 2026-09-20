import { redirect } from "next/navigation";
import { requireMerchant, AuthenticationError } from "@/lib/auth";
import { ProductForm } from "@/components/products/ProductForm";

export const metadata = { title: "New Product — Storefronts" };

export default async function NewProductPage() {
  try {
    const merchant = await requireMerchant();
    if (!merchant.store) redirect("/onboarding");

    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <ProductForm currency={merchant.store.currency} />
      </div>
    );
  } catch (e) {
    if (e instanceof AuthenticationError) redirect("/sign-in");
    throw e;
  }
}
