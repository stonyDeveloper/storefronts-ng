import { Skeleton } from "@/components/shared/Skeleton";

export default function ProductDetailLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-10">
      <Skeleton className="mb-6 h-4 w-24" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="mt-4 h-12 w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
}
