"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function EditProductError({
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
      title="Couldn't load this product"
      homeHref="/products"
      homeLabel="Back to products"
    />
  );
}
