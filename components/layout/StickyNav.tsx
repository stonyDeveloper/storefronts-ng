"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
      animate={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0)",
          backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
          boxShadow: scrolled
            ? "0 1px 0 rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.04)"
            : "none",
          paddingTop: scrolled ? "12px" : "24px",
          paddingBottom: scrolled ? "12px" : "24px",
          borderRadius: scrolled ? "0px" : "0px",
          color: "#18181b",
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      
      >
      <motion.div
        className="flex items-center justify-between px-6  max-w-7xl mx-auto"
        
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 font-heading text-xl font-semibold tracking-tight"
          style={{ color: "inherit" }}
        >
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-400 to-teal-600 flex items-center justify-center shadow-[0_2px_10px_rgba(16,185,129,0.35)]">
            <span className="text-white text-[13px] font-bold font-heading">S</span>
          </span>
          Storefronts
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/sign-in"
            className="text-sm px-4 py-2 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: "inherit" }}
          >
            Sign in
          </Link>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link
              href="/sign-up"
              className="text-sm font-medium px-4 py-2.5 rounded-xl transition-colors duration-300"
              style={{
                backgroundColor: "#059669",
                color: "white",
              }}
            >
              Start free
            </Link>
          </motion.div>
        </nav>
      </motion.div>
      </motion.div>
    </header>
  );
}
