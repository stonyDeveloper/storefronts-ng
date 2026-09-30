"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import type { StoreCategory } from "@prisma/client";
import { HeroBackground } from "./HeroBackground";
import { HERO_STYLES, type HeroStyle } from "@/lib/validations";
import { isLight } from "@/lib/colors";

const STYLE_COPY: Record<HeroStyle, { name: string; hint: string }> = {
  auto: { name: "Signature", hint: "Generated just for your store" },
  blobs: { name: "Glow", hint: "Soft drifting color" },
  aurora: { name: "Aurora", hint: "Slow sweeping light" },
  geometric: { name: "Texture", hint: "Subtle pattern detail" },
};

interface HeroStylePickerProps {
  slug: string;
  storeName: string;
  primaryColor: string;
  category: StoreCategory;
  value: HeroStyle;
  onChange: (style: HeroStyle) => void;
  disabled?: boolean;
}

/** Grid of live-rendered hero-background previews — the real HeroBackground renderer, scaled down. */
export function HeroStylePicker({
  slug,
  storeName,
  primaryColor,
  category,
  value,
  onChange,
  disabled,
}: HeroStylePickerProps) {
  const light = isLight(primaryColor);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {HERO_STYLES.map((style) => {
        const active = value === style;
        return (
          <motion.button
            key={style}
            type="button"
            onClick={() => onChange(style)}
            disabled={disabled}
            whileTap={disabled ? {} : { scale: 0.98 }}
            aria-pressed={active}
            className={`group overflow-hidden rounded-xl border text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
              active
                ? "border-zinc-900 ring-2 ring-zinc-900 ring-offset-2"
                : "border-zinc-200 hover:border-zinc-300 hover:shadow-md"
            }`}
          >
            <div
              className="relative aspect-[16/9] overflow-hidden"
              style={{ backgroundColor: primaryColor }}
            >
              <HeroBackground
                slug={slug}
                primaryColor={primaryColor}
                category={category}
                heroStyle={style}
                scale={0.3}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`font-heading text-sm font-bold ${
                    light ? "text-zinc-900" : "text-white"
                  }`}
                >
                  {storeName}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between px-3.5 py-2.5">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                  {STYLE_COPY[style].name}
                  {style === "auto" && <Sparkles className="h-3 w-3 text-amber-500" />}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-400">{STYLE_COPY[style].hint}</p>
              </div>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                  active
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 text-transparent"
                }`}
              >
                <Check className="h-3 w-3" />
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
