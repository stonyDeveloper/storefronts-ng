"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading]);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && onOpenChange(false)}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-start gap-3">
              {variant === "destructive" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-500" />
                </div>
              )}
              <div className="min-w-0">
                <h2 id="confirm-dialog-title" className="text-sm font-semibold text-zinc-900">
                  {title}
                </h2>
                {description && <p className="mt-1 text-sm leading-relaxed text-zinc-500">{description}</p>}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60",
                  variant === "destructive"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-zinc-900 hover:bg-zinc-800"
                )}
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
