"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState error={error} reset={reset} title="Couldn't load setup" />;
}
