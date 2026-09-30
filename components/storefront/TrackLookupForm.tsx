"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export function TrackLookupForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ref = value.trim();
    if (!ref) return;
    setPending(true);
    router.push(`/track/${encodeURIComponent(ref)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 flex w-full max-w-sm gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter your order reference"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-10 pr-3 font-mono text-sm text-zinc-800 placeholder:font-sans placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-100"
        />
      </div>
      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        disabled={pending || !value.trim()}
        className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
      >
        {pending ? "Looking…" : "Track"}
      </motion.button>
    </form>
  );
}
