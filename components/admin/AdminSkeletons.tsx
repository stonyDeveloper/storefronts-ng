import { Skeleton } from "@/components/shared/Skeleton";

export function AdminStatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-zinc-100 bg-white p-5">
          <Skeleton className="mb-4 h-8 w-8 rounded-xl" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="mt-3 h-3.5 w-20" />
          <Skeleton className="mt-1.5 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
