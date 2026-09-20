import { Skeleton, SkeletonFormCard } from "@/components/shared/Skeleton";

export function ProductFormSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <SkeletonFormCard fields={2} />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <SkeletonFormCard fields={2} />
        </div>
        <div className="space-y-4">
          <SkeletonFormCard fields={2} />
          <SkeletonFormCard fields={2} />
        </div>
      </div>
    </div>
  );
}
