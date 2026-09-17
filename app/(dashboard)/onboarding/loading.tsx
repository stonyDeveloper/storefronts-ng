import { Skeleton } from "@/components/shared/Skeleton";

export default function OnboardingLoading() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-lg space-y-4 rounded-2xl border border-zinc-100 bg-white p-6">
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3.5 w-64" />
        <div className="space-y-3 pt-2">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
