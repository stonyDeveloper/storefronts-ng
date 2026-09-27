import { Skeleton, SkeletonFormCard } from "@/components/shared/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 sm:space-y-5 sm:p-6">
      <div className="space-y-2 pt-1">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-3.5 w-48" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonFormCard key={i} fields={2} />
      ))}
    </div>
  );
}
