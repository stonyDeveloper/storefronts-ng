import { Skeleton, SkeletonCardGrid } from "@/components/shared/Skeleton";

export default function ProductsListingLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-10">
      <Skeleton className="mb-6 h-4 w-24" />
      <Skeleton className="mb-8 h-9 w-56" />
      <div className="mb-6 flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl sm:max-w-56" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <SkeletonCardGrid count={12} />
    </main>
  );
}
