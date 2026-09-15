"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Store, ImageIcon, Share2, Check } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

/** Step 1 mock — claiming your store URL */
function UrlMock() {
  return (
    <div className="rounded-2xl bg-zinc-50 ring-1 ring-zinc-100 p-4 space-y-2.5">
      <div className="flex items-center gap-2 bg-white rounded-xl ring-1 ring-zinc-200 px-3 py-2.5">
        <span className="text-xs text-zinc-400 font-mono">storefronts.com/</span>
        <span className="text-xs text-zinc-900 font-mono font-semibold">ada-boutique</span>
        <span className="w-px h-3.5 bg-zinc-900 animate-pulse" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded-full bg-accent-100 flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-accent-600" strokeWidth={3.5} />
        </span>
        <span className="text-[11px] font-medium text-accent-600">Available — it&apos;s yours</span>
      </div>
    </div>
  );
}

/** Step 2 mock — a product card taking shape */
function ProductMock() {
  return (
    <div className="rounded-2xl bg-zinc-50 ring-1 ring-zinc-100 p-4">
      <div className="flex gap-3">
        <div className="w-14 h-14 rounded-xl shrink-0 relative overflow-hidden ring-1 ring-zinc-100">
          <Image
            src="/images/marketing/skincare-product.jpg"
            alt="Skincare product photo"
            fill
            sizes="56px"
            className="object-cover"
          />
          <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-white/90 flex items-center justify-center">
            <ImageIcon className="w-2.5 h-2.5 text-zinc-500" />
          </span>
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <div className="h-2 bg-zinc-200 rounded-full w-3/4 mb-2" />
          <div className="h-2 bg-zinc-100 rounded-full w-1/2 mb-2.5" />
          <p className="text-sm font-bold text-zinc-900">₦8,500</p>
        </div>
        <span className="text-[10px] font-semibold text-accent-700 bg-accent-50 ring-1 ring-accent-100 rounded-full px-2 py-0.5 h-fit">
          In stock · 12
        </span>
      </div>
    </div>
  );
}

/** Step 3 mock — the link shared in a WhatsApp chat */
function ShareMock() {
  return (
    <div className="rounded-2xl bg-[#e5ddd5] p-4 space-y-2">
      <div className="flex justify-end">
        <div className="bg-[#dcf8c6] rounded-2xl rounded-tr-sm px-3 py-2 shadow-sm max-w-[85%]">
          <p className="text-[12px] text-zinc-800">
            New stock just landed 🔥 <span className="text-sky-600 underline">storefronts.com/ada-boutique</span>
          </p>
        </div>
      </div>
      <div className="flex">
        <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
          <p className="text-[12px] text-zinc-800">Just ordered! 😍</p>
        </div>
      </div>
    </div>
  );
}

const steps = [
  {
    number: "01",
    icon: Store,
    title: "Create your store",
    description:
      "Pick a name, choose your category, and set your brand colours. Your store URL is live in under 2 minutes.",
    Mock: UrlMock,
  },
  {
    number: "02",
    icon: ImageIcon,
    title: "Add your products",
    description:
      "Upload photos, write descriptions, set prices, and manage stock. Add product variants like size and colour.",
    Mock: ProductMock,
  },
  {
    number: "03",
    icon: Share2,
    title: "Share and start selling",
    description:
      "Drop your store link in WhatsApp or Instagram. Customers browse, pay via Paystack or cash, and you get notified instantly.",
    Mock: ShareMock,
  },
];

export function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section id="how-it-works" className="bg-white py-24 sm:py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          className="max-w-2xl mb-16 sm:mb-20"
          variants={fadeUp}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="text-xs font-semibold text-accent-600 uppercase tracking-[0.15em] mb-4">
            How it works
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-zinc-900 leading-tight">
            From signup to first sale
            <br />
            <span className="text-zinc-400">in three steps.</span>
          </h2>
        </motion.div>

        {/* Animated connector line (desktop) */}
        <div className="hidden md:block relative h-px mb-10" aria-hidden="true">
          <div className="absolute inset-x-8 top-0 h-px bg-zinc-100" />
          <motion.div
            className="absolute inset-x-8 top-0 h-px bg-accent-400 origin-left"
            initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          />
        </div>

        {/* Steps */}
        <motion.div
          className="grid md:grid-cols-3 gap-12 md:gap-8"
          variants={stagger}
          initial={reduce ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {steps.map((step) => {
            const Icon = step.icon;
            const Mock = step.Mock;
            return (
              <motion.div key={step.number} variants={fadeUp} className="group flex flex-col">
                <div className="flex items-start gap-5 mb-6">
                  <span className="font-heading text-sm font-bold text-zinc-300 mt-1 shrink-0 w-8">
                    {step.number}
                  </span>
                  <div className="w-11 h-11 bg-accent-50 ring-1 ring-accent-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-accent-600 group-hover:ring-accent-600 transition-colors duration-300">
                    <Icon className="w-5 h-5 text-accent-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="font-heading text-xl font-bold text-zinc-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-zinc-500 text-base leading-relaxed mb-6">
                  {step.description}
                </p>
                <div className="mt-auto">
                  <Mock />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
