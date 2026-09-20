"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/products", icon: Package },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface DashboardSidebarProps {
  storeName: string | null;
  storeSlug: string | null;
}

export function DashboardSidebar({ storeName, storeSlug }: DashboardSidebarProps) {
  const pathname = usePathname();

  const initial = storeName?.[0]?.toUpperCase() ?? "S";

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-zinc-100 bg-white lg:flex">
        {/* Store identity */}
        <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900">
            <span className="font-heading text-sm font-bold text-white">{initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {storeName ?? "Your Store"}
            </p>
            <p className="text-xs text-zinc-400">Free plan</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="space-y-1 border-t border-zinc-100 p-4">
          {storeSlug && (
            <Link
              href={`/store/${storeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View live store
            </Link>
          )}
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton />
            <span className="text-sm text-zinc-500">Account</span>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom-nav ───────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-zinc-100 bg-white lg:hidden">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors",
                active ? "text-zinc-900" : "text-zinc-400"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
