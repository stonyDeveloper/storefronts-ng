"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState error={error} reset={reset} title="Couldn't load your products" />;
}
