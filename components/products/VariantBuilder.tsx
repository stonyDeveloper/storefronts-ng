"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, ImageIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  generateCombos,
  variantLabel,
  type VariantAttributeInput,
  type VariantComboInput,
} from "@/lib/variants";

const MAX_ATTRIBUTES = 3;
const SUGGESTED_NAMES = ["Size", "Color", "Material"];

export interface VariantBuilderValue {
  attributes: VariantAttributeInput[];
  combos: VariantComboInput[];
}

interface Props {
  value: VariantBuilderValue;
  onChange: (value: VariantBuilderValue) => void;
  images: string[];
  basePriceNaira: number;
}

export function VariantBuilder({ value, onChange, images, basePriceNaira }: Props) {
  const { attributes, combos } = value;
  const [valueDrafts, setValueDrafts] = useState<Record<number, string>>({});
  const [openImagePicker, setOpenImagePicker] = useState<number | null>(null);

  function updateAttributes(next: VariantAttributeInput[]) {
    onChange({ attributes: next, combos: generateCombos(next, combos) });
  }

  function addAttribute(name = "") {
    if (attributes.length >= MAX_ATTRIBUTES) return;
    updateAttributes([...attributes, { name, values: [] }]);
  }

  function removeAttribute(i: number) {
    updateAttributes(attributes.filter((_, idx) => idx !== i));
  }

  function renameAttribute(i: number, name: string) {
    updateAttributes(attributes.map((a, idx) => (idx === i ? { ...a, name } : a)));
  }

  function addValue(i: number) {
    const raw = (valueDrafts[i] ?? "").trim();
    if (!raw) return;
    const attr = attributes[i];
    if (!attr.values.some((v) => v.toLowerCase() === raw.toLowerCase())) {
      updateAttributes(
        attributes.map((a, idx) => (idx === i ? { ...a, values: [...a.values, raw] } : a))
      );
    }
    setValueDrafts((d) => ({ ...d, [i]: "" }));
  }

  function removeValue(i: number, val: string) {
    updateAttributes(
      attributes.map((a, idx) =>
        idx === i ? { ...a, values: a.values.filter((v) => v !== val) } : a
      )
    );
  }

  function updateCombo(i: number, patch: Partial<VariantComboInput>) {
    onChange({ attributes, combos: combos.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });
  }

  const suggested = SUGGESTED_NAMES.filter(
    (n) => !attributes.some((a) => a.name.trim().toLowerCase() === n.toLowerCase())
  );
  const inStockCount = combos.filter((c) => c.stock > 0).length;

  return (
    <div className="space-y-3">
      {attributes.map((attr, i) => (
        <div key={i} className="space-y-2.5 rounded-xl border border-zinc-200 p-3.5">
          <div className="flex items-center gap-2">
            <input
              value={attr.name}
              onChange={(e) => renameAttribute(i, e.target.value)}
              placeholder="Option name (e.g. Color)"
              className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium transition-shadow focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <button
              type="button"
              onClick={() => removeAttribute(i)}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {attr.values.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {attr.values.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => removeValue(i, v)}
                  className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200"
                >
                  {v}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={valueDrafts[i] ?? ""}
              onChange={(e) => setValueDrafts((d) => ({ ...d, [i]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addValue(i);
                }
              }}
              placeholder="Add a value, e.g. Blue"
              className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <button
              type="button"
              onClick={() => addValue(i)}
              disabled={!(valueDrafts[i] ?? "").trim()}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-30"
            >
              Add
            </button>
          </div>
        </div>
      ))}

      {attributes.length < MAX_ATTRIBUTES && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => addAttribute()}
            className="flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <Plus className="h-4 w-4" />
            Add option type
          </button>
          {suggested.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {suggested.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => addAttribute(name)}
                  className="rounded-lg border border-dashed border-zinc-200 px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700"
                >
                  + {name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {combos.length > 0 && (
        <div className="space-y-2.5 border-t border-zinc-100 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-700">Price &amp; stock per combination</p>
            <span className="text-xs text-zinc-400">
              {inStockCount} of {combos.length} in stock
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Leave quantity at 0 for combinations you don&apos;t have — buyers see those as{" "}
            <span className="font-medium text-zinc-500">out of stock</span>.
          </p>

          <div className="space-y-2">
            {combos.map((combo, i) => (
              <ComboRow
                key={variantLabel(combo.options)}
                combo={combo}
                images={images}
                basePriceNaira={basePriceNaira}
                imagePickerOpen={openImagePicker === i}
                onToggleImagePicker={() => setOpenImagePicker(openImagePicker === i ? null : i)}
                onCloseImagePicker={() => setOpenImagePicker(null)}
                onChange={(patch) => updateCombo(i, patch)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ComboRow({
  combo,
  images,
  basePriceNaira,
  imagePickerOpen,
  onToggleImagePicker,
  onCloseImagePicker,
  onChange,
}: {
  combo: VariantComboInput;
  images: string[];
  basePriceNaira: number;
  imagePickerOpen: boolean;
  onToggleImagePicker: () => void;
  onCloseImagePicker: () => void;
  onChange: (patch: Partial<VariantComboInput>) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const oos = combo.stock === 0;
  const activeImage = combo.image ?? images[0] ?? null;

  useEffect(() => {
    if (!imagePickerOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) onCloseImagePicker();
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [imagePickerOpen, onCloseImagePicker]);

  return (
    <div
      ref={rowRef}
      className={cn(
        "relative flex items-center gap-2.5 rounded-xl border p-2.5",
        oos ? "border-amber-100 bg-amber-50/50" : "border-zinc-100"
      )}
    >
      <button
        type="button"
        onClick={onToggleImagePicker}
        disabled={images.length === 0}
        className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 disabled:cursor-not-allowed"
      >
        {activeImage ? (
          <Image src={activeImage} alt="" fill className="object-cover" sizes="40px" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-3.5 w-3.5 text-zinc-300" />
          </div>
        )}
      </button>

      <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-700">
        {variantLabel(combo.options)}
      </span>

      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
          ₦
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={combo.price != null ? String(combo.price / 100) : ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d.]/g, "");
            onChange({ price: raw ? Math.round(Number(raw) * 100) : null });
          }}
          placeholder={basePriceNaira ? basePriceNaira.toFixed(2) : "Price"}
          className="w-24 rounded-lg border border-zinc-200 py-1.5 pl-6 pr-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <input
        type="text"
        inputMode="numeric"
        value={combo.stock ? String(combo.stock) : ""}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, "");
          onChange({ stock: raw ? Number(raw) : 0 });
        }}
        placeholder="0"
        className="w-14 rounded-lg border border-zinc-200 px-2 py-1.5 text-center text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-zinc-900"
      />

      <AnimatePresence>
        {imagePickerOpen && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-10 mt-2 grid grid-cols-4 gap-1.5 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg"
          >
            <button
              type="button"
              onClick={() => {
                onChange({ image: null });
                onCloseImagePicker();
              }}
              className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-zinc-200 text-[9px] font-medium text-zinc-400 hover:border-zinc-300 hover:text-zinc-600"
            >
              None
            </button>
            {images.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => {
                  onChange({ image: url });
                  onCloseImagePicker();
                }}
                className="relative h-12 w-12 overflow-hidden rounded-lg border-2 transition-colors"
                style={{ borderColor: combo.image === url ? "#18181b" : "transparent" }}
              >
                <Image src={url} alt="" fill className="object-cover" sizes="48px" />
                {combo.image === url && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Check className="h-4 w-4 text-white" />
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
