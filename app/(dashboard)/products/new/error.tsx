"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function NewProductError({
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
      title="Couldn't load this page"
      homeHref="/products"
      homeLabel="Back to products"
    />
  );
}
