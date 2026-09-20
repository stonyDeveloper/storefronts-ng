import { Skeleton, SkeletonStatsGrid } from "@/components/shared/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="space-y-2 pt-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-3.5 w-32" />
      </div>
      <SkeletonStatsGrid />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 lg:col-span-2">
          <Skeleton className="mb-4 h-4 w-40" />
          <Skeleton className="h-[220px] w-full" />
        </div>
        <div className="space-y-3 rounded-2xl border border-zinc-100 bg-white p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-100 bg-white p-5">
        <Skeleton className="mb-4 h-4 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
