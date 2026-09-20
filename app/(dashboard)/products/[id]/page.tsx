import { notFound, redirect } from "next/navigation";
import { requireMerchant, AuthenticationError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/products/ProductForm";

export const metadata = { title: "Edit Product — Storefronts" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const merchant = await requireMerchant();
    if (!merchant.store) redirect("/onboarding");

    const product = await prisma.product.findUnique({
      where: { id },
      include: { variantAttributes: true, variantCombos: true },
    });

    if (!product || product.storeId !== merchant.store.id) notFound();

    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <ProductForm product={product} currency={merchant.store.currency} />
      </div>
    );
  } catch (e) {
    if (e instanceof AuthenticationError) redirect("/sign-in");
    throw e;
  }
}
