"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function CheckoutSuccessError({
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
        title="Couldn't load your order confirmation"
        description="If you were charged, check your email or track your order with the reference sent to you."
      />
    </div>
  );
}
