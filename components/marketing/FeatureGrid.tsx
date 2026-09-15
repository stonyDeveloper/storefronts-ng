"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useInView, animate } from "framer-motion";
import {
  CreditCard,
  Landmark,
  Hash,
  Check,
  MessageCircle,
  Banknote,
  Paintbrush,
} from "lucide-react";

const stats = [
  { value: 5, suffix: " min", label: "to go live" },
  { value: 0, prefix: "₦", label: "setup fee" },
  { value: 100, suffix: "%", label: "your brand" },
];

function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  label,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setCount(value); return; }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v: number) => setCount(Math.round(v)),
    });
    return controls.stop;
  }, [inView, value, reduce]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-heading text-5xl sm:text-6xl font-bold text-accent-600 tabular-nums">
        {prefix}{count}{suffix}
      </p>
      <p className="text-sm text-zinc-500 mt-2 font-medium">{label}</p>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const hoverLift = (reduce: boolean | null) =>
  reduce ? undefined : { y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.10)" };

/** Payment methods mock for the Paystack card */
function PaymentsMock() {
  const methods = [
    { icon: CreditCard, label: "Card" },
    { icon: Landmark, label: "Transfer" },
    { icon: Hash, label: "USSD" },
  ];
  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2.5 mb-4">
        {methods.map((m) => {
          const Icon = m.icon;
          return (
            <span
              key={m.label}
              className="inline-flex items-center gap-2 bg-white/10 ring-1 ring-white/15 rounded-xl px-3.5 py-2 text-xs font-medium text-zinc-200"
            >
              <Icon className="w-3.5 h-3.5 text-accent-400" />
              {m.label}
            </span>
          );
        })}
      </div>
      <div className="flex items-center gap-3 bg-white/[0.07] ring-1 ring-white/10 rounded-2xl px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-accent-400" strokeWidth={3} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white leading-tight">Order #SF-1042 paid</p>
          <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
            ₦12,500 → settles straight to your bank
          </p>
        </div>
        <span className="text-[10px] font-semibold text-accent-400 bg-accent-500/10 ring-1 ring-accent-500/25 rounded-full px-2 py-0.5 shrink-0">
          Auto-split
        </span>
      </div>
    </div>
  );
}

/** WhatsApp share-card preview */
function ShareCardMock() {
  return (
    <div className="mt-8 bg-[#dcf8c6] rounded-2xl rounded-tl-sm p-2.5 shadow-sm max-w-[240px]">
      <div className="rounded-xl overflow-hidden bg-white">
        <div className="h-16 relative">
          <Image
            src="/images/marketing/skincare-product.jpg"
            alt="Ngozi Cosmetics product photo"
            fill
            sizes="240px"
            className="object-cover"
          />
        </div>
        <div className="px-3 py-2">
          <p className="text-[11px] font-bold text-zinc-900 leading-tight">Ngozi Cosmetics</p>
          <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">
            storefronts.com/ngozi-cosmetics
          </p>
        </div>
      </div>
      <p className="text-[11px] text-zinc-700 mt-2 px-1">Shop my new arrivals 💄✨</p>
    </div>
  );
}

/** Brand color picker mock */
function BrandMock() {
  const swatches = ["#7c3aed", "#0d9488", "#c2410c", "#be185d", "#18181b"];
  const selected = "#7c3aed";
  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-3">
        {swatches.map((c) => (
          <span
            key={c}
            className={`w-8 h-8 rounded-full ${c === selected ? "ring-2 ring-offset-2 ring-zinc-900" : ""}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden ring-1 ring-zinc-100 shadow-sm max-w-[280px]">
        <div className="px-4 py-3" style={{ backgroundColor: selected }}>
          <p className="text-[9px] text-white/70 uppercase tracking-[0.15em] font-medium">Beauty</p>
          <p className="font-heading text-white text-sm font-bold leading-tight">Ngozi Cosmetics</p>
        </div>
        <div className="bg-white px-4 py-2.5 flex items-center justify-between">
          <div className="h-1.5 bg-zinc-100 rounded-full w-1/2" />
          <span
            className="text-[9px] font-semibold text-white rounded-lg px-2.5 py-1"
            style={{ backgroundColor: selected }}
          >
            Add to cart
          </span>
        </div>
      </div>
    </div>
  );
}

export function FeatureGrid() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-zinc-50 py-24 sm:py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          className="max-w-2xl mb-16"
          variants={fadeUp}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="text-xs font-semibold text-accent-600 uppercase tracking-[0.15em] mb-4">
            Everything you need
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-zinc-900 leading-tight">
            Built for how Nigerian
            <br />
            <span className="text-zinc-400">businesses actually work.</span>
          </h2>
        </motion.div>

        {/* Animated stats */}
        <motion.div
          className="grid grid-cols-3 gap-4 sm:gap-8 py-12 mb-16 border-y border-zinc-200"
          variants={stagger}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <AnimatedCounter {...s} />
            </motion.div>
          ))}
        </motion.div>

        {/* Bento grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          variants={stagger}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {/* Paystack — large dark card */}
          <motion.div
            variants={fadeUp}
            whileHover={hoverLift(reduce)}
            className="lg:col-span-2 bg-zinc-950 rounded-3xl p-7 sm:p-9 relative overflow-hidden transition-shadow duration-300"
          >
            <div className="absolute -top-24 right-0 w-[350px] h-[250px] rounded-full bg-accent-500/10 blur-[80px] pointer-events-none" />
            <div className="relative">
              <div className="w-11 h-11 bg-accent-500 rounded-2xl flex items-center justify-center mb-5">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white mb-2">
                Paystack built-in
              </h3>
              <p className="text-zinc-400 leading-relaxed max-w-md">
                Accept card payments, bank transfers, and USSD from any Nigerian
                bank. No API keys. No webhook setup. Just your bank account number.
              </p>
              <PaymentsMock />
            </div>
          </motion.div>

          {/* WhatsApp-native — emerald card */}
          <motion.div
            variants={fadeUp}
            whileHover={hoverLift(reduce)}
            className="bg-gradient-to-br from-accent-500 to-teal-600 rounded-3xl p-7 sm:p-9 transition-shadow duration-300"
          >
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-white mb-2">
              WhatsApp-native
            </h3>
            <p className="text-accent-50/90 leading-relaxed text-[15px]">
              Your store link previews beautifully in any chat — drop it once and
              let it sell.
            </p>
            <ShareCardMock />
          </motion.div>

          {/* COD — warm card */}
          <motion.div
            variants={fadeUp}
            whileHover={hoverLift(reduce)}
            className="bg-gradient-to-br from-amber-50 to-orange-100 ring-1 ring-amber-100 rounded-3xl p-7 sm:p-9 transition-shadow duration-300"
          >
            <div className="w-11 h-11 bg-amber-500 rounded-2xl flex items-center justify-center mb-5">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-zinc-900 mb-2">
              Cash on delivery
            </h3>
            <p className="text-zinc-600 leading-relaxed text-[15px]">
              Let customers pay when they receive their order. Perfect for
              building trust with first-time buyers.
            </p>
            <div className="mt-8 inline-flex items-center gap-2.5 bg-white rounded-full shadow-sm ring-1 ring-amber-100 pl-2 pr-4 py-2">
              <span className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                <Banknote className="w-3.5 h-3.5 text-amber-600" />
              </span>
              <span className="text-xs font-semibold text-zinc-800">
                Pay when it arrives — ₦8,500
              </span>
            </div>
          </motion.div>

          {/* Brand colors — wide light card */}
          <motion.div
            variants={fadeUp}
            whileHover={hoverLift(reduce)}
            className="lg:col-span-2 bg-white ring-1 ring-zinc-100 rounded-3xl p-7 sm:p-9 transition-shadow duration-300"
          >
            <div className="grid sm:grid-cols-2 gap-6 items-start">
              <div>
                <div className="w-11 h-11 bg-zinc-900 rounded-2xl flex items-center justify-center mb-5">
                  <Paintbrush className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-zinc-900 mb-2">
                  Your brand, your colours
                </h3>
                <p className="text-zinc-500 leading-relaxed">
                  Set your store name, logo, and accent colour. Every storefront
                  looks and feels like its own brand — not a template.
                </p>
              </div>
              <BrandMock />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
