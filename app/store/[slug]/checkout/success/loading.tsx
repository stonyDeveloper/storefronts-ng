import { Skeleton } from "@/components/shared/Skeleton";

export default function CheckoutSuccessLoading() {
  return (
    <main className="mx-auto max-w-lg px-4 pb-24 pt-24 text-center sm:px-6 sm:pt-32">
      <Skeleton className="mx-auto h-20 w-20 rounded-full" />
      <Skeleton className="mx-auto mt-8 h-8 w-56" />
      <Skeleton className="mx-auto mt-3 h-4 w-72" />
      <Skeleton className="mx-auto mt-6 h-20 w-full rounded-2xl" />
      <Skeleton className="mx-auto mt-4 h-32 w-full rounded-2xl" />
    </main>
  );
}
