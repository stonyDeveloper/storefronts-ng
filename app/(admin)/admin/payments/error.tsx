"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function AdminPaymentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState error={error} reset={reset} title="Couldn't load payments" />;
}
