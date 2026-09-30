"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="pt-24">
      <ErrorState error={error} reset={reset} title="Couldn't load this product" />
    </div>
  );
}
