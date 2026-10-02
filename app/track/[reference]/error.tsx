"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function TrackOrderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="pt-12">
      <ErrorState error={error} reset={reset} title="Couldn't look up this order" />
    </div>
  );
}
