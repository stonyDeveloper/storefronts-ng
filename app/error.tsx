"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <ErrorState
        error={error}
        reset={reset}
        title="Something went wrong"
        homeHref="/"
        homeLabel="Go home"
      />
    </div>
  );
}
