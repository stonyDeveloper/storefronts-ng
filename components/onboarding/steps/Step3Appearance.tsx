"use client";

import { useState } from "react";
import type { StoreCategory } from "@prisma/client";
import { HeroStylePicker } from "@/components/storefront/HeroStylePicker";
import type { HeroStyle } from "@/lib/validations";
import type { WizardData } from "../OnboardingWizard";

interface Props {
  data: WizardData;
  onNext: (data: Partial<WizardData>) => void;
  onBack: () => void;
}

function ColorInput({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-0.5">{label}</label>
      <p className="text-xs text-zinc-400 mb-2">{hint}</p>
      <div className="flex items-center gap-3">
        <label className="cursor-pointer">
          <div
            className="w-10 h-10 rounded-xl border-2 border-zinc-200 shadow-sm"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v);
          }}
          maxLength={7}
          className="flex-1 px-3 py-2.5 text-sm border border-zinc-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
          placeholder="#18181B"
        />
      </div>
    </div>
  );
}

export function Step3Appearance({ data, onNext, onBack }: Props) {
  const [primaryColor, setPrimary] = useState(data.primaryColor || "#18181B");
  const [accentColor, setAccent] = useState(data.accentColor || "#F4F4F5");
  const [heroStyle, setHeroStyle] = useState<HeroStyle>(data.heroStyle || "auto");
  const [logoUrl, setLogoUrl] = useState(data.logoUrl || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!/^#[0-9A-Fa-f]{6}$/.test(primaryColor)) e.primary = "Enter a valid hex color";
    if (!/^#[0-9A-Fa-f]{6}$/.test(accentColor)) e.accent = "Enter a valid hex color";
    if (logoUrl && !/^https?:\/\//.test(logoUrl)) e.logo = "Must be a full URL (https://...)";
    return e;
  }

  function handleContinue() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onNext({ primaryColor, accentColor, heroStyle, logoUrl });
  }

  const storeName = data.name || "Your Store";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-zinc-900">Make it yours</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Choose colors that match your brand. Buyers will see these on your storefront.
        </p>
      </div>

      {/* Live preview */}
      <div className="rounded-2xl overflow-hidden border border-zinc-100 shadow-sm">
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="font-heading font-bold text-white text-base">{storeName}</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full opacity-40"
                style={{ backgroundColor: accentColor }}
              />
            ))}
          </div>
        </div>
        <div className="p-4" style={{ backgroundColor: accentColor }}>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-white shadow-sm" />
            ))}
          </div>
          <div
            className="mt-3 rounded-xl py-2.5 text-center text-xs font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Shop now
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <ColorInput
          label="Brand color"
          hint="Used for your header, buttons, and key accents"
          value={primaryColor}
          onChange={setPrimary}
        />
        {errors.primary && <p className="text-xs text-red-500 -mt-2">{errors.primary}</p>}

        <ColorInput
          label="Background color"
          hint="The surface color behind your products"
          value={accentColor}
          onChange={setAccent}
        />
        {errors.accent && <p className="text-xs text-red-500 -mt-2">{errors.accent}</p>}

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-0.5">Hero style</label>
          <p className="text-xs text-zinc-400 mb-2">
            The atmosphere behind your store name on your storefront — you can change this later.
          </p>
          <HeroStylePicker
            slug={data.slug || "your-store"}
            storeName={storeName}
            primaryColor={primaryColor}
            category={(data.category || "GENERAL") as StoreCategory}
            value={heroStyle}
            onChange={setHeroStyle}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-0.5">
            Logo URL <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <p className="text-xs text-zinc-400 mb-2">Paste a direct image link — you can upload one later too</p>
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm transition-shadow"
          />
          {errors.logo && <p className="text-xs text-red-500 mt-1">{errors.logo}</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-4 border border-zinc-200 text-zinc-700 text-sm font-semibold rounded-xl hover:bg-zinc-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-[2] py-3 px-4 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 transition-colors active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
