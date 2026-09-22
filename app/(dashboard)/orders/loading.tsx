import { Skeleton, SkeletonTable } from "@/components/shared/Skeleton";

export default function OrdersLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3.5 w-56" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <SkeletonTable rows={6} />
    </div>
  );
}
