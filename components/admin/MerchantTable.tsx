"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Store as StoreIcon, ChevronRight, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";

export interface MerchantRow {
  id: string;
  email: string;
  phone: string | null;
  createdAt: string;
  storeName: string | null;
  storeSlug: string | null;
  plan: string | null;
  subscriptionStatus: string | null;
  isSuspended: boolean;
  onboardingComplete: boolean;
  productCount: number;
  orderCount: number;
}

const TABS = [
  { label: "All", value: "ALL" },
  { label: "Live stores", value: "LIVE" },
  { label: "Incomplete setup", value: "INCOMPLETE" },
  { label: "Suspended", value: "SUSPENDED" },
] as const;

export function MerchantTable({ merchants }: { merchants: MerchantRow[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return merchants.filter((m) => {
      if (tab === "LIVE" && !(m.onboardingComplete && !m.isSuspended)) return false;
      if (tab === "INCOMPLETE" && m.onboardingComplete) return false;
      if (tab === "SUSPENDED" && !m.isSuspended) return false;
      if (!q) return true;
      return (
        m.email.toLowerCase().includes(q) ||
        (m.storeName?.toLowerCase().includes(q) ?? false) ||
        (m.storeSlug?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [merchants, tab, search]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 [scrollbar-width:none]">
          {TABS.map(({ label, value }) => {
            const active = tab === value;
            return (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or store…"
            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={StoreIcon}
          title={merchants.length === 0 ? "No merchants yet" : "No matching merchants"}
          description={
            merchants.length === 0
              ? "New signups will show up here."
              : "Try a different filter or search term."
          }
        />
      )}

      {filtered.length > 0 && (
        <div className="hidden overflow-hidden rounded-2xl border border-zinc-100 bg-white md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs text-zinc-400">
                <th className="px-5 py-3.5 font-medium">Store</th>
                <th className="px-5 py-3.5 font-medium">Contact</th>
                <th className="px-5 py-3.5 font-medium">Plan</th>
                <th className="px-5 py-3.5 font-medium">Products</th>
                <th className="px-5 py-3.5 font-medium">Orders</th>
                <th className="px-5 py-3.5 font-medium">Joined</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((m, i) => (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3), ease: "easeOut" }}
                    className="group relative border-b border-zinc-50 last:border-0 transition-colors hover:bg-zinc-50/60"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/merchants/${m.id}`}
                        className="flex items-center gap-2 font-medium text-zinc-900 after:absolute after:inset-0"
                      >
                        {m.storeName ?? "No store yet"}
                        {m.isSuspended && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
                            <ShieldAlert className="h-2.5 w-2.5" /> Suspended
                          </span>
                        )}
                        {!m.onboardingComplete && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                            Setup incomplete
                          </span>
                        )}
                      </Link>
                      {m.storeSlug && <p className="mt-0.5 text-xs text-zinc-400">/{m.storeSlug}</p>}
                    </td>
                    <td className="px-5 py-4 text-zinc-700">{m.email}</td>
                    <td className="px-5 py-4 text-zinc-700">{m.plan ?? "—"}</td>
                    <td className="px-5 py-4 tabular-nums text-zinc-700">{m.productCount}</td>
                    <td className="px-5 py-4 tabular-nums text-zinc-700">{m.orderCount}</td>
                    <td className="px-5 py-4 text-zinc-400">{format(new Date(m.createdAt), "d MMM yyyy")}</td>
                    <td className="pr-4">
                      <ChevronRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-500" />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="space-y-3 md:hidden">
          <AnimatePresence initial={false}>
            {filtered.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3), ease: "easeOut" }}
              >
                <Link
                  href={`/admin/merchants/${m.id}`}
                  className="block rounded-2xl border border-zinc-100 bg-white p-4 transition-colors active:bg-zinc-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{m.storeName ?? "No store yet"}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{m.email}</p>
                    </div>
                    <p className="shrink-0 text-xs text-zinc-400">{format(new Date(m.createdAt), "d MMM")}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {m.isSuspended && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
                        <ShieldAlert className="h-2.5 w-2.5" /> Suspended
                      </span>
                    )}
                    {!m.onboardingComplete && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        Setup incomplete
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-400">
                      {m.productCount} products · {m.orderCount} orders
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
