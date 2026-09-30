"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useCartItemCount } from "@/store/cart";

interface StorefrontNavProps {
  storeName: string;
  storeSlug: string;
  logoUrl: string | null;
  primaryColor: string;
}

export function StorefrontNav({
  storeName,
  storeSlug,
  logoUrl,
  primaryColor: _primaryColor,
}: StorefrontNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const openCart = useUIStore((s) => s.openCart);
  const cartCount = useCartItemCount(storeSlug);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        animate={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0)",
          backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
          boxShadow: scrolled
            ? "0 1px 0 rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.04)"
            : "none",
          paddingTop: scrolled ? "12px" : "20px",
          paddingBottom: scrolled ? "12px" : "20px",
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex items-center justify-between px-4 sm:px-6 lg:px-10"
      >
        {/* Store identity */}
        <Link href={`/store/${storeSlug}`} className="flex items-center gap-2.5">
          {logoUrl && (
            <div className="relative h-7 w-7 overflow-hidden rounded-lg">
              <Image
                src={logoUrl}
                alt={storeName}
                fill
                className="object-contain"
                sizes="28px"
              />
            </div>
          )}
          <motion.span
            animate={{ color: scrolled ? "#18181b" : "#ffffff" }}
            transition={{ duration: 0.3 }}
            className="font-heading text-lg font-bold tracking-tight"
          >
            {storeName}
          </motion.span>
        </Link>

        {/* Cart button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          animate={{ color: scrolled ? "#18181b" : "#ffffff" }}
          transition={{ duration: 0.3 }}
          onClick={openCart}
          className="relative p-2 transition-opacity hover:opacity-70"
          aria-label={`Open cart${mounted && cartCount > 0 ? `, ${cartCount} items` : ""}`}
        >
          <ShoppingBag className="h-5 w-5" />

          {/* Badge — only shown after hydration to avoid SSR mismatch */}
          {mounted && cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold leading-none tabular-nums"
              style={{ color: _primaryColor }}
            >
              {cartCount > 9 ? "9+" : cartCount}
            </motion.span>
          )}
        </motion.button>
      </motion.div>
    </header>
  );
}
