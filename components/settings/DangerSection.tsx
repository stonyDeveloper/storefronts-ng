"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";

interface DangerSectionProps {
  storeId: string;
  storeName: string;
}

export function DangerSection({ storeId, storeName }: DangerSectionProps) {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canDelete = confirm === storeName;

  async function handleDelete() {
    if (!canDelete) return;
    setDeleting(true);
    setErrorMsg("");

    const res = await fetch(`/api/stores/${storeId}`, { method: "DELETE" });

    if (res.ok) {
      router.push("/onboarding");
    } else {
      const json = await res.json();
      setErrorMsg(json.error ?? "Could not delete store. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-red-100 bg-white">
      <div className="border-b border-red-50 bg-red-50/50 px-5 py-4">
        <h2 className="text-sm font-semibold text-red-700">Danger zone</h2>
        <p className="mt-0.5 text-xs text-red-400">
          Irreversible actions. Proceed with care.
        </p>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">Delete this store</p>
            <p className="mt-0.5 text-xs text-red-600">
              This permanently deletes your store, all products, and all orders. This
              action cannot be undone.
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Type <span className="font-semibold text-zinc-900">{storeName}</span> to confirm
          </label>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={storeName}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow"
          />
        </div>

        {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}

        <button
          type="button"
          onClick={handleDelete}
          disabled={!canDelete || deleting}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {deleting ? "Deleting…" : "Delete store permanently"}
        </button>
      </div>
    </section>
  );
}
