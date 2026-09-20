import { Skeleton, SkeletonCardGrid } from "@/components/shared/Skeleton";

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3.5 w-40" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <SkeletonCardGrid count={8} />
    </div>
  );
}
