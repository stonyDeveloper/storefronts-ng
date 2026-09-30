"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
}

export function ErrorState({
  error,
  reset,
  title = "Something went wrong",
  description = "That's on us — please try again. If it keeps happening, refresh the page.",
  homeHref,
  homeLabel = "Go back",
}: ErrorStateProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
        <AlertTriangle className="h-7 w-7 text-red-500" />
      </div>
      <h2 className="font-heading text-lg font-bold text-zinc-900">{title}</h2>
      <p className="mt-1.5 max-w-xs text-sm text-zinc-500">{description}</p>
      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Try again
        </button>
        {homeHref && (
          <Link
            href={homeHref}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            {homeLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
