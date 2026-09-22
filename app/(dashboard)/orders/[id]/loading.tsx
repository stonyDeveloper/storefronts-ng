import { Skeleton, SkeletonFormCard } from "@/components/shared/Skeleton";

export default function OrderDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <Skeleton className="mb-4 h-4 w-20" />
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SkeletonFormCard fields={1} />
          <div className="space-y-3 rounded-2xl border border-zinc-100 bg-white p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-13 w-13 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <SkeletonFormCard fields={1} />
          <SkeletonFormCard fields={2} />
        </div>
      </div>
    </div>
  );
}
