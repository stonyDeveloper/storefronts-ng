"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ExternalLink } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/orders": "Orders",
  "/settings": "Settings",
  "/onboarding": "Set up your store",
};

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(prefix + "/")) return title;
  }
  return "Dashboard";
}

interface DashboardHeaderProps {
  storeSlug: string | null;
}

export function DashboardHeader({ storeSlug }: DashboardHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-100 bg-white px-4 sm:px-6">
      <h1 className="text-sm font-semibold text-zinc-900">{resolveTitle(pathname)}</h1>

      <div className="flex items-center gap-3">
        {storeSlug && (
          <Link
            href={`/store/${storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-900 sm:flex"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View store
          </Link>
        )}
        {/* UserButton shown in header on mobile; sidebar shows it on desktop */}
        <div className="lg:hidden">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
