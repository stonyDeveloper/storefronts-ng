import { Skeleton, SkeletonTable } from "@/components/shared/Skeleton";

export default function AdminMerchantsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="space-y-2 pt-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3.5 w-40" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <SkeletonTable rows={7} />
    </div>
  );
}
