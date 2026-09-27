"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { slugify } from "@/lib/utils";

interface SlugSectionProps {
  storeId: string;
  currentSlug: string;
  appUrl: string;
}

type AvailState = "idle" | "checking" | "available" | "taken" | "invalid";
type SaveStatus = "idle" | "saving" | "saved" | "error";

export function SlugSection({ storeId, currentSlug, appUrl }: SlugSectionProps) {
  const [slug, setSlug] = useState(currentSlug);
  const [availState, setAvailState] = useState<AvailState>("idle");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const debouncedSlug = useDebounce(slug, 400);

  const isChanged = debouncedSlug !== currentSlug;
  const isValid = /^[a-z0-9-]{2,60}$/.test(debouncedSlug);

  useEffect(() => {
    if (!isChanged) {
      setAvailState("idle");
      return;
    }
    if (!isValid) {
      setAvailState("invalid");
      return;
    }

    setAvailState("checking");
    fetch(`/api/stores/check-slug?slug=${encodeURIComponent(debouncedSlug)}`)
      .then((r) => r.json())
      .then((d) => setAvailState(d.available ? "available" : "taken"))
      .catch(() => setAvailState("idle"));
  }, [debouncedSlug, isChanged, isValid]);

  function handleChange(val: string) {
    setSlug(slugify(val) || val.toLowerCase().replace(/[^a-z0-9-]/g, ""));
    setSaveStatus("idle");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (availState !== "available") return;
    setSaveStatus("saving");
    setErrorMsg("");

    const res = await fetch(`/api/stores/${storeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });

    const json = await res.json();
    if (!res.ok) {
      setSaveStatus("error");
      setErrorMsg(json.error ?? "Something went wrong");
    } else {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
  }

  const canSave = isChanged && availState === "available" && saveStatus !== "saving";

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
      <div className="border-b border-zinc-50 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-900">Store URL</h2>
        <p className="mt-0.5 text-xs text-zinc-400">
          Your public storefront address. Changing it will break any existing links.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        {/* Warning */}
        {isChanged && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              Changing your URL will break any existing links, bookmarks, and search engine
              rankings. Only do this if you&apos;re sure.
            </p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Store URL</label>
          <div className="flex items-center overflow-hidden rounded-xl border border-zinc-200 focus-within:ring-2 focus-within:ring-zinc-900 transition-shadow">
            <span className="bg-zinc-50 px-3 py-3 text-sm text-zinc-400 border-r border-zinc-200 whitespace-nowrap">
              {appUrl.replace(/^https?:\/\//, "")}/store/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="your-store"
              maxLength={60}
              className="flex-1 bg-white px-3 py-3 text-sm text-zinc-900 focus:outline-none min-w-0"
            />
            <div className="px-3">
              {availState === "checking" && (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />
              )}
              {availState === "available" && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              )}
              {(availState === "taken" || availState === "invalid") && (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
            </div>
          </div>
          {availState === "taken" && (
            <p className="mt-1 text-xs text-red-500">That URL is already taken.</p>
          )}
          {availState === "invalid" && (
            <p className="mt-1 text-xs text-red-500">
              Only lowercase letters, numbers, and hyphens. 2–60 characters.
            </p>
          )}
          {availState === "available" && (
            <p className="mt-1 text-xs text-emerald-600">Available!</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSave}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-40"
          >
            {saveStatus === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saveStatus === "saving" ? "Saving…" : "Update URL"}
          </button>
          {saveStatus === "saved" && (
            <span className="text-xs text-emerald-600">URL updated!</span>
          )}
          {saveStatus === "error" && (
            <span className="text-xs text-red-500">{errorMsg}</span>
          )}
        </div>
      </form>
    </section>
  );
}
