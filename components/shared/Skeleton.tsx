import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-lg", className)} />;
}

/** Mimics the 4-tile StatsGrid/AdminStatsGrid layout. */
export function SkeletonStatsGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-zinc-100 bg-white p-5">
          <Skeleton className="mb-4 h-8 w-8 rounded-xl" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="mt-3 h-3.5 w-24" />
          <Skeleton className="mt-1.5 h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Mimics OrderTable/MerchantTable/AdminOrderTable rows. */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
      <div className="divide-y divide-zinc-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mimics a stacked card-section form (settings, product form panels). */
export function SkeletonFormCard({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-4 rounded-2xl border border-zinc-100 bg-white p-5">
      <Skeleton className="h-4 w-32" />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/** Mimics a grid of ProductCard/StorefrontProductCard tiles. */
export function SkeletonCardGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-3.5">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
