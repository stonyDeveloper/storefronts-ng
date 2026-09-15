"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowDown, Check, Link2, BellRing } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/** A scattered clutter card — the visual language of the DM grind. */
function ClutterCard({
  rotate,
  className = "",
  children,
}: {
  rotate: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ rotate: 0, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200/70 ${rotate} ${className}`}
    >
      {children}
    </motion.div>
  );
}

/** Left panel — the grind, deliberately desaturated. */
function OldWayPanel() {
  return (
    <div className="relative h-full rounded-3xl bg-zinc-100 p-5 sm:p-7">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
          The old way
        </p>
        <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-500">
          every single day
        </span>
      </div>

      <div className="space-y-3">
        <ClutterCard rotate="-rotate-2">
          <div className="space-y-2">
            {["How much? 🙏", "Is it available?", "Do you have it in red?"].map((msg) => (
              <div key={msg} className="flex">
                <div className="rounded-2xl rounded-tl-sm bg-zinc-100 px-3 py-1.5">
                  <p className="text-[13px] text-zinc-600">{msg}</p>
                </div>
              </div>
            ))}
            <p className="pl-1 pt-0.5 text-[11px] italic text-zinc-400">
              You replied · Seen 3 days ago 👀
            </p>
          </div>
        </ClutterCard>

        <ClutterCard rotate="rotate-1" className="ml-4 sm:ml-8">
          <div className="flex items-center gap-3">
            <div className="grid shrink-0 grid-cols-2 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-5 w-5 rounded bg-zinc-200" />
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-zinc-700">Story expired</p>
              <p className="text-[11px] text-zinc-400">
                24 hours of reach, gone. Repost tomorrow.
              </p>
            </div>
          </div>
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full w-[4%] rounded-full bg-zinc-300" />
          </div>
        </ClutterCard>

        <ClutterCard rotate="-rotate-1" className="mr-4 sm:mr-6">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-zinc-700">
                Waiting for transfer alert…
              </p>
              <p className="text-[11px] text-zinc-400">₦8,500 — promised since Tuesday</p>
            </div>
          </div>
        </ClutterCard>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-zinc-200/70 pt-4">
        <p className="text-[12px] text-zinc-400">
          &ldquo;Is it available?&rdquo; <span className="font-semibold text-zinc-500">×12 today</span>
        </p>
        <p className="text-[12px] font-medium text-zinc-500">3 chats · 0 checkouts</p>
      </div>
    </div>
  );
}

/** Right panel — the fix: one clean storefront, in full color. */
function NewWayPanel() {
  const products = [
    { src: "/images/marketing/fashion-boutique.jpg", alt: "Boutique clothing rack", price: "₦8,500" },
    { src: "/images/marketing/jollof-rice.jpg", alt: "Plated jollof rice", price: "₦12,000" },
    { src: "/images/marketing/wireless-earbuds.jpg", alt: "Wireless earbuds", price: "₦6,500" },
  ];

  return (
    <div className="relative h-full rounded-3xl bg-white p-5 shadow-xl shadow-zinc-900/[0.06] ring-1 ring-zinc-200/70 sm:p-7">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent-600">
          The Storefronts way
        </p>
        <span className="rounded-full bg-accent-50 px-2.5 py-1 text-[11px] font-medium text-accent-700">
          set up once
        </span>
      </div>

      {/* Browser frame */}
      <div className="overflow-hidden rounded-2xl ring-1 ring-zinc-200/80">
        <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50 px-3.5 py-2.5">
          <div className="flex gap-1.5">
            {["bg-red-300", "bg-amber-300", "bg-accent-300"].map((c) => (
              <span key={c} className={`h-2 w-2 rounded-full ${c}`} />
            ))}
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 ring-1 ring-zinc-100">
            <Link2 className="h-3 w-3 shrink-0 text-accent-600" />
            <span className="truncate font-mono text-[11px] text-zinc-500">
              storefronts.com/adas-closet
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-accent-600 to-teal-600 px-4 py-4">
          <p className="font-heading text-sm font-bold text-white">Ada&apos;s Closet</p>
          <p className="text-[10px] text-white/70">Lagos · Free delivery over ₦20,000</p>
        </div>

        <div className="grid grid-cols-3 gap-2 p-3">
          {products.map((p) => (
            <div key={p.price} className="overflow-hidden rounded-lg ring-1 ring-zinc-100">
              <div className="aspect-square relative">
                <Image src={p.src} alt={p.alt} fill sizes="120px" className="object-cover" />
              </div>
              <p className="px-1.5 py-1 text-[10px] font-semibold text-zinc-700">{p.price}</p>
            </div>
          ))}
        </div>

        <div className="px-3 pb-3">
          <div className="rounded-lg bg-zinc-900 py-2 text-center text-[11px] font-semibold text-white">
            Pay with Paystack →
          </div>
        </div>
      </div>

      {/* Order toast — the payoff */}
      <div className="animate-float-slow absolute -right-2 top-24 hidden w-52 rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-accent-200 sm:block">
        <div className="flex items-start gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-100">
            <BellRing className="h-3.5 w-3.5 text-accent-700" />
          </span>
          <div>
            <p className="text-[12px] font-semibold text-zinc-900">
              New order — <span className="text-accent-600">₦8,500 paid</span>
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-400">
              Stock updated. Money on the way to your bank.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
        <p className="text-[12px] text-zinc-400">
          Prices, stock &amp; checkout — <span className="font-semibold text-zinc-600">no DMs needed</span>
        </p>
        <p className="text-[12px] font-semibold text-accent-600">3 visits · 3 checkouts</p>
      </div>
    </div>
  );
}

const fixes = [
  "Prices on every product — no “how much?”",
  "Stock tracked — no overselling",
  "Paystack checkout — no chasing transfers",
  "Notified the second an order lands",
];

export function PainSection() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-white px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="max-w-2xl"
          variants={fadeUp}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-accent-600">
            Why merchants switch
          </p>
          <h2 className="font-heading text-4xl font-bold leading-tight text-zinc-900 sm:text-5xl">
            Selling in DMs
            <br />
            <span className="text-zinc-400">is real work.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-zinc-500">
            Post. Repost. Screenshot. Send. Answer the same three questions, chase the
            transfer, pray they don&apos;t ghost. There&apos;s a calmer way to sell.
          </p>
        </motion.div>

        <motion.div
          className="relative mt-12 grid gap-5 sm:mt-16 md:grid-cols-2 md:gap-8"
          variants={stagger}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.div variants={fadeUp}>
            <OldWayPanel />
          </motion.div>

          {/* Bridge badge — in flow on mobile, centered overlay on desktop */}
          <div className="-my-1 flex justify-center md:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-white shadow-lg ring-4 ring-white">
              <ArrowDown className="h-3.5 w-3.5" />
            </span>
          </div>

          <motion.div variants={fadeUp}>
            <NewWayPanel />
          </motion.div>

          <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-950 text-white shadow-lg ring-4 ring-white">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </motion.div>

        {/* Receipts */}
        <motion.ul
          className="mt-8 flex flex-wrap gap-2.5 sm:mt-10"
          variants={stagger}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {fixes.map((fix) => (
            <motion.li
              key={fix}
              variants={fadeUp}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-2 pl-2.5 pr-4"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-100">
                <Check className="h-3 w-3 text-accent-700" strokeWidth={3} />
              </span>
              <span className="text-[13px] font-medium text-zinc-600">{fix}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
