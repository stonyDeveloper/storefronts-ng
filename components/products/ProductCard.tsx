"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/utils";
import { getStockCount, isOutOfStock } from "@/lib/variants";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { ProductWithVariants } from "@/types";

interface Props {
  product: ProductWithVariants;
  currency?: string;
}

export function ProductCard({ product, currency = "NGN" }: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`"${product.name}" deleted`);
      router.refresh();
    } else {
      toast.error("Could not delete product");
    }
  }

  const stockBadge = () => {
    if (!product.trackStock) return null;
    const count = getStockCount(product);
    if (isOutOfStock(product))
      return (
        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 rounded-md">
          Out of stock
        </span>
      );
    if (count <= 10)
      return (
        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-600 rounded-md">
          {count} left
        </span>
      );
    return (
      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-600 rounded-md">
        {count} in stock
      </span>
    );
  };

  const coverImage = product.images[0];

  return (
    <div className="group bg-white rounded-2xl border border-zinc-100 overflow-hidden hover:border-zinc-200 hover:shadow-md transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-zinc-50">
        {coverImage ? (
          <Image src={coverImage} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}
        {/* Visibility indicator */}
        <div className="absolute top-2 right-2">
          {product.isVisible ? (
            <Eye className="w-3.5 h-3.5 text-white drop-shadow-sm" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-white/60 drop-shadow-sm" />
          )}
        </div>
        {!product.isVisible && (
          <div className="absolute inset-0 bg-white/40" />
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        <p className="text-sm font-semibold text-zinc-900 truncate leading-snug">{product.name}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-sm font-bold text-zinc-900">
            {formatMoney(product.price, currency)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-zinc-400 line-through">
              {formatMoney(product.comparePrice, currency)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          {stockBadge()}
          {!product.isVisible && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-zinc-100 text-zinc-500 rounded-md">
              Hidden
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-3.5 pb-3.5 flex gap-2">
        <Link
          href={`/products/${product.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit
        </Link>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete "${product.name}"?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
