import { Skeleton, SkeletonFormCard } from "@/components/shared/Skeleton";

export default function AdminMerchantDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      <Skeleton className="h-4 w-24" />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-3.5 w-40" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-100 bg-white p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-5 w-20" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonFormCard fields={4} />
        <SkeletonFormCard fields={4} />
      </div>
      <SkeletonFormCard fields={3} />
    </div>
  );
}
