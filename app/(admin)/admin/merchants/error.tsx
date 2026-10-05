"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function AdminMerchantsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState error={error} reset={reset} title="Couldn't load merchants" />;
}
