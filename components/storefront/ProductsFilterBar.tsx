"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface ProductsFilterBarProps {
  total: number;
  primaryColor: string;
}

export function ProductsFilterBar({ total, primaryColor: _primaryColor }: ProductsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") ?? "newest";
  const currentSearch = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(currentSearch);
  const debouncedSearch = useDebounce(search, 400);
  const isFirstRender = useRef(true);

  // Push debounced search to URL — skip initial mount
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams();
    params.set("sort", currentSort);
    if (debouncedSearch) params.set("search", debouncedSearch);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  function handleSort(sort: string) {
    const params = new URLSearchParams();
    params.set("sort", sort);
    if (search) params.set("search", search);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
        <span className="text-sm text-zinc-500">
          {total} {total === 1 ? "product" : "products"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 sm:w-56 sm:flex-none">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-xl border border-zinc-200 py-2.5 pl-9 pr-8 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={currentSort}
          onChange={(e) => handleSort(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>
    </div>
  );
}
