"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  /** When set to an image already in `images`, the gallery crossfades to it (e.g. a selected variant's photo). */
  focusImage?: string | null;
}

export function ProductGallery({ images, productName, focusImage }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!focusImage) return;
    const idx = images.indexOf(focusImage);
    if (idx !== -1) setActiveIndex(idx);
  }, [focusImage, images]);

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-zinc-100 flex items-center justify-center">
        <ImageOff className="h-12 w-12 text-zinc-200" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image — crossfade on index change */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex]}
              alt={`${productName} — image ${activeIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={activeIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails — only shown when there are multiple images */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <motion.button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                i === activeIndex
                  ? "border-zinc-900 opacity-100 shadow-sm"
                  : "border-transparent opacity-50 hover:opacity-75"
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
