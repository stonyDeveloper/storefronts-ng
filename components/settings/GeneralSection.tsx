"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface GeneralSectionProps {
  storeId: string;
  name: string;
  description: string | null;
  deliveryFee: number;
  currency: string;
}

type Status = "idle" | "saving" | "saved" | "error";

export function GeneralSection({
  storeId,
  name: initialName,
  description: initialDesc,
  deliveryFee: initialFee,
  currency,
}: GeneralSectionProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDesc ?? "");
  const [deliveryFee, setDeliveryFee] = useState(String(initialFee / 100));
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const currencySymbol = currency === "NGN" ? "₦" : currency;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMsg("");

    const feeKobo = Math.round(parseFloat(deliveryFee || "0") * 100);

    const res = await fetch(`/api/stores/${storeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        deliveryFee: isNaN(feeKobo) ? 0 : feeKobo,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setStatus("error");
      setErrorMsg(json.error ?? "Something went wrong");
    } else {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
      <div className="border-b border-zinc-50 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-900">General</h2>
        <p className="mt-0.5 text-xs text-zinc-400">Store name, description, and delivery settings.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Store name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={80}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Description <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Tell buyers what you sell…"
            className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
          />
          <p className="mt-1 text-right text-xs text-zinc-300">{description.length}/500</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Delivery fee
          </label>
          <div className="flex items-center overflow-hidden rounded-xl border border-zinc-200 focus-within:ring-2 focus-within:ring-zinc-900 transition-shadow">
            <span className="bg-zinc-50 px-4 py-3 text-sm text-zinc-500 border-r border-zinc-200">
              {currencySymbol}
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              placeholder="0"
              className="flex-1 bg-white px-4 py-3 text-sm text-zinc-900 focus:outline-none"
            />
          </div>
          <p className="mt-1 text-xs text-zinc-400">Set to 0 for free delivery.</p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={status === "saving"}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
          >
            {status === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {status === "saving" ? "Saving…" : "Save changes"}
          </button>
          {status === "saved" && (
            <span className="text-xs text-emerald-600">Saved!</span>
          )}
          {status === "error" && (
            <span className="text-xs text-red-500">{errorMsg}</span>
          )}
        </div>
      </form>
    </section>
  );
}
