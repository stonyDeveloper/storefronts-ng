import Link from "next/link";
import { Compass } from "lucide-react";

export const metadata = { title: "Page not found — Storefronts" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
        <Compass className="h-8 w-8 text-zinc-400" />
      </div>
      <h1 className="font-heading text-2xl font-bold text-zinc-900">Page not found</h1>
      <p className="mt-2 max-w-xs text-sm text-zinc-500">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
      >
        Go home
      </Link>
    </main>
  );
}
