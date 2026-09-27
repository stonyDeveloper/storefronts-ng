"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { StoreCategory } from "@prisma/client";
import { HeroStylePicker } from "@/components/storefront/HeroStylePicker";
import { HERO_STYLES, type HeroStyle } from "@/lib/validations";

interface HeroStyleSectionProps {
  storeId: string;
  slug: string;
  storeName: string;
  primaryColor: string;
  category: StoreCategory;
  heroStyle: string;
}

type Status = "idle" | "saving" | "saved" | "error";

export function HeroStyleSection({
  storeId,
  slug,
  storeName,
  primaryColor,
  category,
  heroStyle: initialStyle,
}: HeroStyleSectionProps) {
  const [selected, setSelected] = useState<HeroStyle>(
    (HERO_STYLES as readonly string[]).includes(initialStyle) ? (initialStyle as HeroStyle) : "auto"
  );
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function select(style: HeroStyle) {
    if (style === selected || status === "saving") return;
    const previous = selected;
    setSelected(style);
    setStatus("saving");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroStyle: style }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Something went wrong");
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e) {
      setSelected(previous);
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
      <div className="flex items-start justify-between border-b border-zinc-50 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Hero style</h2>
          <p className="mt-0.5 text-xs text-zinc-400">
            The atmosphere behind your store name on your storefront.
          </p>
        </div>
        <div className="pt-0.5 text-xs">
          {status === "saving" && (
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </span>
          )}
          {status === "saved" && <span className="text-emerald-600">Saved!</span>}
          {status === "error" && <span className="text-red-500">{errorMsg}</span>}
        </div>
      </div>

      <div className="p-5">
        <HeroStylePicker
          slug={slug}
          storeName={storeName}
          primaryColor={primaryColor}
          category={category}
          value={selected}
          onChange={select}
          disabled={status === "saving"}
        />
      </div>
    </section>
  );
}
