import { Skeleton } from "@/components/shared/Skeleton";
import { AdminStatsGridSkeleton } from "@/components/admin/AdminSkeletons";

export default function AdminPaymentsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="space-y-2 pt-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3.5 w-72" />
      </div>
      <AdminStatsGridSkeleton />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 lg:col-span-2">
          <Skeleton className="mb-4 h-4 w-56" />
          <Skeleton className="h-[220px] w-full" />
        </div>
        <div className="space-y-4 rounded-2xl border border-zinc-100 bg-white p-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-100 bg-white p-5">
        <Skeleton className="mb-4 h-4 w-36" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
