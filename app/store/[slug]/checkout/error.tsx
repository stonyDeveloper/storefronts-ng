"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="pt-24">
      <ErrorState
        error={error}
        reset={reset}
        title="Checkout couldn't load"
        description="Nothing was charged. Please try again."
      />
    </div>
  );
}
