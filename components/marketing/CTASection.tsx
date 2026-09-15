"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export function CTASection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative bg-zinc-950 py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* One deliberate glow, off-center — not a full-bleed wash */}
      <div className="absolute bottom-[-30%] right-[15%] w-[520px] h-[420px] rounded-full bg-accent-500/20 blur-[110px] pointer-events-none" />
      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="text-xs font-semibold text-accent-400 uppercase tracking-[0.15em] mb-6">
            Ready to start?
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Your store is one
            <br />
            <span className="text-accent-400">link away.</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Create your free store in 5 minutes. No credit card, no tech setup — just your
            products and a link to share.
          </p>

          <motion.div whileTap={{ scale: 0.97 }} className="inline-block">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-accent-500 text-white text-sm font-semibold px-8 py-4 rounded-xl hover:bg-accent-400 transition-colors shadow-[0_8px_30px_rgba(16,185,129,0.35)]"
            >
              Create your free store
              <span aria-hidden="true">→</span>
            </Link>
          </motion.div>

          <p className="text-zinc-600 text-xs mt-6">
            Free forever · Paystack payments · No hidden fees
          </p>
        </motion.div>
      </div>
    </section>
  );
}
