"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import type { StoreCategory } from "@prisma/client";
import { formatMoney } from "@/lib/utils";
import { isLight } from "@/lib/colors";
import { HeroBackground } from "./HeroBackground";

interface StoreHeroProps {
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  primaryColor: string;
  category: StoreCategory;
  heroStyle: string;
  productCount: number;
  deliveryFee: number;
  currency: string;
}

export function StoreHero({
  name,
  slug,
  description,
  logoUrl,
  primaryColor,
  category,
  heroStyle,
  productCount,
  deliveryFee,
  currency,
}: StoreHeroProps) {
  // Light brand colors get dark ink; dark brand colors get white.
  const light = isLight(primaryColor);
  const ink = light ? "text-zinc-900" : "text-white";
  const inkSoft = light ? "text-zinc-900/70" : "text-white/70";
  const inkFaint = light ? "text-zinc-900/50" : "text-white/50";

  return (
    <section
      className="relative flex min-h-[75vh] items-center overflow-hidden"
      style={{ backgroundColor: primaryColor }}
    >
      <HeroBackground
        slug={slug}
        primaryColor={primaryColor}
        category={category}
        heroStyle={heroStyle}
      />

      <div className="relative mx-auto w-full max-w-2xl px-6 pb-24 pt-36 text-center sm:px-10 sm:pb-28 sm:pt-40">
        {/* Logo */}
        {logoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`mx-auto mb-6 h-20 w-20 overflow-hidden rounded-2xl border-2 shadow-xl ${
              light ? "border-black/10 bg-black/5" : "border-white/20 bg-white/10"
            }`}
          >
            <Image
              src={logoUrl}
              alt={name}
              width={80}
              height={80}
              className="h-full w-full object-contain p-2"
            />
          </motion.div>
        )}

        {/* Store name */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: logoUrl ? 0.1 : 0,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className={`font-heading text-5xl font-bold sm:text-6xl lg:text-7xl ${ink}`}
        >
          {name}
        </motion.h1>

        {/* Description */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`mx-auto mt-4 max-w-md text-base sm:text-lg ${inkSoft}`}
          >
            {description}
          </motion.p>
        )}

        {/* Meta */}
        {productCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className={`mt-5 flex items-center justify-center gap-3 text-sm ${inkFaint}`}
          >
            <span>
              {productCount} {productCount === 1 ? "product" : "products"}
            </span>
            <span>·</span>
            <span>
              {deliveryFee === 0
                ? "Free delivery"
                : `${formatMoney(deliveryFee, currency)} delivery`}
            </span>
          </motion.div>
        )}

        {/* CTA */}
        {productCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8"
          >
            <motion.a
              href={`/store/${slug}/products`}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-xl transition-shadow hover:shadow-2xl"
              style={
                light
                  ? { backgroundColor: "#18181b", color: "#ffffff" }
                  : { backgroundColor: "#ffffff", color: primaryColor }
              }
            >
              <ShoppingBag className="h-4 w-4" />
              Shop collection
            </motion.a>
          </motion.div>
        )}

        {productCount === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`mt-8 text-sm ${light ? "text-zinc-900/40" : "text-white/40"}`}
          >
            Products coming soon
          </motion.p>
        )}
      </div>
    </section>
  );
}
