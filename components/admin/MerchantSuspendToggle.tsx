"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function MerchantSuspendToggle({
  storeId,
  storeName,
  isSuspended: initial,
}: {
  storeId: string;
  storeName: string;
  isSuspended: boolean;
}) {
  const router = useRouter();
  const [isSuspended, setIsSuspended] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = !isSuspended;
    const res = await fetch(`/api/admin/stores/${storeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isSuspended: next }),
    });
    setLoading(false);
    setConfirming(false);

    if (res.ok) {
      setIsSuspended(next);
      toast.success(next ? `${storeName} suspended` : `${storeName} reinstated`);
      router.refresh();
    } else {
      toast.error("Could not update store status");
    }
  }

  if (isSuspended) {
    return (
      <button
        onClick={toggle}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
        Reinstate store
      </button>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500">Suspend this store's storefront?</span>
        <button
          onClick={toggle}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-3 w-3 animate-spin" />}
          Confirm
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
    >
      <ShieldAlert className="h-3.5 w-3.5" />
      Suspend store
    </button>
  );
}
