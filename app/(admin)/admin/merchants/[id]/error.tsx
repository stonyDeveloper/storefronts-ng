"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function AdminMerchantDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Couldn't load this merchant"
      homeHref="/admin/merchants"
      homeLabel="Back to merchants"
    />
  );
}
