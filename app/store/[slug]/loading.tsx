import { Skeleton, SkeletonCardGrid } from "@/components/shared/Skeleton";

export default function StoreHomeLoading() {
  return (
    <main>
      <div className="skeleton-shimmer h-[420px] w-full sm:h-[480px]" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <Skeleton className="mb-6 h-6 w-40" />
        <SkeletonCardGrid count={8} />
      </div>
    </main>
  );
}
