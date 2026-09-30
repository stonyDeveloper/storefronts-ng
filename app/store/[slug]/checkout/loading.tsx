import { Skeleton } from "@/components/shared/Skeleton";

export default function CheckoutLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28 lg:px-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-xl" />
          ))}
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <div className="space-y-3 rounded-2xl border border-zinc-100 bg-white p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
}
