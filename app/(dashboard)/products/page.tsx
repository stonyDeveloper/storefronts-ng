import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Package } from "lucide-react";
import { requireMerchant, AuthenticationError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/ProductCard";
import { isOutOfStock } from "@/lib/variants";

export const metadata = { title: "Products — Storefronts" };

export default async function ProductsPage() {
  try {
    const merchant = await requireMerchant();
    if (!merchant.store) redirect("/onboarding");

    const products = await prisma.product.findMany({
      where: { storeId: merchant.store.id },
      include: { variantAttributes: true, variantCombos: true },
      orderBy: { createdAt: "desc" },
    });

    const currency = merchant.store.currency;
    const visible = products.filter((p) => p.isVisible).length;
    const outOfStock = products.filter((p) => p.isVisible && isOutOfStock(p)).length;

    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-2xl font-bold text-zinc-900">Products</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {products.length} total · {visible} visible
              {outOfStock > 0 && ` · ${outOfStock} out of stock`}
            </p>
          </div>
          <Link
            href="/products/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add product
          </Link>
        </div>

        {/* Empty state */}
        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="font-heading text-lg font-bold text-zinc-900">No products yet</h2>
            <p className="text-sm text-zinc-500 mt-1 max-w-xs">
              Add your first product and it will show up in your store instantly.
            </p>
            <Link
              href="/products/new"
              className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add your first product
            </Link>
          </div>
        )}

        {/* Product grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} currency={currency} />
            ))}
          </div>
        )}
      </div>
    );
  } catch (e) {
    if (e instanceof AuthenticationError) redirect("/sign-in");
    throw e;
  }
}
