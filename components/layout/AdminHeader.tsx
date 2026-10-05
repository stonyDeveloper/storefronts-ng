"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Overview",
  "/admin/merchants": "Merchants",
  "/admin/orders": "Orders",
  "/admin/payments": "Payments",
};

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (prefix !== "/admin" && pathname.startsWith(prefix + "/")) return title;
  }
  if (pathname.startsWith("/admin/merchants/")) return "Merchant detail";
  return "Admin";
}

export function AdminHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-100 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-semibold text-zinc-900">{resolveTitle(pathname)}</h1>
        <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-white">
          ADMIN
        </span>
      </div>
      <div className="lg:hidden">
        <UserButton />
      </div>
    </header>
  );
}
