"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Check, MessageCircle, ShoppingBag } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function StoreMockup() {
  const products = [
    { src: "/images/marketing/jewelry-earrings.jpg", alt: "Gold hoop earrings", price: "₦8,500", tag: "New" },
    { src: "/images/marketing/skincare-product.jpg", alt: "Skincare bottle", price: "₦12,000", tag: "" },
    { src: "/images/marketing/leather-handbag.jpg", alt: "Leather handbag", price: "₦24,200", tag: "Sale" },
  ];

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl shadow-zinc-900/10 ring-1 ring-zinc-200/80 w-full max-w-[380px] bg-white">
      {/* Browser chrome */}
      <div className="bg-zinc-50 border-b border-zinc-100 px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          {["bg-red-300", "bg-amber-300", "bg-accent-300"].map((c) => (
            <span key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />
          ))}
        </div>
        <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[11px] text-zinc-400 font-mono truncate ring-1 ring-zinc-100">
          storefronts.com/ada-boutique
        </div>
      </div>

      {/* Store content */}
      <div className="bg-white">
        {/* Store header with merchant's primary color */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: "#c2410c" }}>
          <div>
            <p className="text-[9px] text-orange-200 uppercase tracking-[0.15em] font-medium">Women's Fashion</p>
            <h3 className="font-heading text-white text-base font-bold leading-tight mt-0.5">
              Ada&apos;s Boutique
            </h3>
          </div>
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center ring-2 ring-white/30">
            <span className="text-white text-sm font-bold font-heading">A</span>
          </div>
        </div>

        {/* Products */}
        <div className="p-4">
          <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mb-3">
            New Arrivals
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {products.map((p) => (
              <div key={p.alt} className="group">
                <div className="aspect-square rounded-xl mb-2 relative overflow-hidden ring-1 ring-zinc-100">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="120px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {p.tag && (
                    <span className="absolute top-1.5 left-1.5 bg-white/90 text-zinc-800 text-[8px] font-semibold px-1.5 py-0.5 rounded-md">
                      {p.tag}
                    </span>
                  )}
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full mb-1 w-4/5" />
                <p className="text-[11px] font-bold text-zinc-900">{p.price}</p>
              </div>
            ))}
          </div>

          {/* Add to cart button */}
          <div
            className="mt-3 w-full py-2.5 rounded-xl text-white text-xs font-semibold text-center"
            style={{ backgroundColor: "#c2410c" }}
          >
            Shop collection →
          </div>
        </div>
      </div>
    </div>
  );
}

/** Floating "payment received" toast — top-right of the mockup */
function PaymentToast() {
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl shadow-xl shadow-zinc-900/10 ring-1 ring-zinc-100 px-4 py-3">
      <div className="w-9 h-9 rounded-full bg-accent-100 flex items-center justify-center shrink-0">
        <Check className="w-4.5 h-4.5 text-accent-600" strokeWidth={3} />
      </div>
      <div>
        <p className="text-xs font-semibold text-zinc-900 leading-tight">Payment received</p>
        <p className="text-sm font-bold text-accent-600 leading-tight mt-0.5">₦12,500.00</p>
      </div>
    </div>
  );
}

/** Floating WhatsApp share preview — bottom-left of the mockup */
function WhatsAppCard() {
  return (
    <div className="bg-[#075e54] rounded-2xl shadow-xl shadow-zinc-900/20 p-3 w-[210px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-[#25d366] flex items-center justify-center">
          <MessageCircle className="w-3.5 h-3.5 text-white" />
        </div>
        <p className="text-[10px] text-emerald-100/80 font-medium">Shared on WhatsApp</p>
      </div>
      <div className="bg-[#dcf8c6] rounded-xl rounded-tl-sm p-2">
        <div className="rounded-lg overflow-hidden bg-white relative h-12">
          <Image
            src="/images/marketing/fashion-boutique.jpg"
            alt="Ada's Boutique storefront preview"
            fill
            sizes="200px"
            className="object-cover"
          />
        </div>
        <div className="px-2 py-1.5">
          <p className="text-[9px] font-bold text-zinc-900 leading-tight">Ada&apos;s Boutique</p>
          <p className="text-[8px] text-zinc-500 leading-tight">storefronts.com/ada-boutique</p>
        </div>
        <p className="text-[9px] text-zinc-700 mt-1.5 px-0.5">New collection just dropped 🛍️✨</p>
      </div>
    </div>
  );
}

/** Floating order notification — mid-left */
function OrderPill() {
  return (
    <div className="flex items-center gap-2.5 bg-zinc-900/95 backdrop-blur-md rounded-full shadow-xl shadow-zinc-900/20 ring-1 ring-white/10 pl-2 pr-4 py-2">
      <div className="w-7 h-7 rounded-full bg-accent-500 flex items-center justify-center shrink-0">
        <ShoppingBag className="w-3.5 h-3.5 text-white" />
      </div>
      <p className="text-[11px] font-medium text-white whitespace-nowrap">
        New order <span className="text-accent-400 font-semibold">#SF-1042</span>
      </p>
    </div>
  );
}

const avatars = [
  { initials: "AO", gradient: "from-orange-400 to-rose-500" },
  { initials: "NC", gradient: "from-violet-400 to-fuchsia-500" },
  { initials: "KE", gradient: "from-accent-400 to-teal-500" },
  { initials: "SD", gradient: "from-sky-400 to-indigo-500" },
];

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative bg-white overflow-hidden flex items-center pt-32 pb-20 px-4 sm:px-6">
      {/* One soft, deliberate glow behind the mockup — not a full-bleed aurora wash */}
      <div
        className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-accent-100/60 blur-[110px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl w-full grid lg:grid-cols-2 gap-16 items-center">
        {/* Left — text */}
        <div className="max-w-xl">
          <motion.div
            variants={fadeUp}
            initial={reduce ? "visible" : "hidden"}
            animate="visible"
            custom={0}
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium text-accent-700 border border-accent-100 bg-accent-50 rounded-full px-3.5 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
              Free for small businesses · No credit card needed
            </span>
          </motion.div>

          <motion.h1
            className="font-heading text-5xl sm:text-6xl lg:text-[4.25rem] font-bold text-zinc-900 leading-[1.04] tracking-tight mb-6"
            variants={fadeUp}
            initial={reduce ? "visible" : "hidden"}
            animate="visible"
            custom={0.1}
          >
            Open your store.
            <br />
            <span className="text-zinc-400">Share the link.</span>
            <br />
            <span className="text-accent-600">Start selling.</span>
          </motion.h1>

          <motion.p
            className="text-zinc-500 text-lg leading-relaxed mb-10 max-w-md"
            variants={fadeUp}
            initial={reduce ? "visible" : "hidden"}
            animate="visible"
            custom={0.2}
          >
            Storefronts gives Nigerian small business owners a beautiful,
            Paystack-powered online store in minutes — no tech skills needed.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3"
            variants={fadeUp}
            initial={reduce ? "visible" : "hidden"}
            animate="visible"
            custom={0.3}
          >
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 bg-accent-500 text-white text-sm font-semibold px-6 py-3.5 rounded-xl hover:bg-accent-600 transition-colors shadow-[0_8px_30px_rgba(16,185,129,0.25)]"
              >
                Create your store — it&apos;s free
                <span aria-hidden="true">→</span>
              </Link>
            </motion.div>

            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 text-zinc-600 text-sm font-medium px-6 py-3.5 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-all"
              >
                See how it works
              </Link>
            </motion.div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="flex items-center gap-3 mt-8"
            variants={fadeUp}
            initial={reduce ? "visible" : "hidden"}
            animate="visible"
            custom={0.4}
          >
            <div className="flex -space-x-2.5">
              {avatars.map((a) => (
                <div
                  key={a.initials}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${a.gradient} ring-2 ring-white flex items-center justify-center`}
                >
                  <span className="text-[9px] font-bold text-white">{a.initials}</span>
                </div>
              ))}
            </div>
            <p className="text-zinc-500 text-xs leading-snug">
              <span className="text-zinc-900 font-semibold">Nigerian sellers</span> are
              already building on Storefronts
            </p>
          </motion.div>
        </div>

        {/* Right — store mockup with floating UI cards */}
        <motion.div
          className="hidden lg:block relative justify-self-center"
          initial={reduce ? false : { opacity: 0, x: 40, rotate: 3 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <StoreMockup />

          <motion.div
            className="absolute -top-8 -right-14 animate-float-slow"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <PaymentToast />
          </motion.div>

          <motion.div
            className="absolute -bottom-10 -left-16 animate-float-slow [animation-delay:1.2s]"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <WhatsAppCard />
          </motion.div>

          <motion.div
            className="absolute top-[38%] -left-24 animate-float-slow [animation-delay:2.4s]"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <OrderPill />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
