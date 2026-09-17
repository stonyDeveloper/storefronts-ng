"use client";

import { useState } from "react";
import {
  Shirt,
  UtensilsCrossed,
  Cpu,
  Sparkles,
  Home,
  BookOpen,
  Trophy,
  Store,
} from "lucide-react";
import type { WizardData } from "../OnboardingWizard";

const CATEGORIES = [
  { value: "FASHION", label: "Fashion", icon: Shirt, description: "Clothing & accessories" },
  { value: "FOOD", label: "Food", icon: UtensilsCrossed, description: "Food & drinks" },
  { value: "ELECTRONICS", label: "Electronics", icon: Cpu, description: "Gadgets & tech" },
  { value: "BEAUTY", label: "Beauty", icon: Sparkles, description: "Cosmetics & care" },
  { value: "HOME", label: "Home", icon: Home, description: "Décor & household" },
  { value: "BOOKS", label: "Books", icon: BookOpen, description: "Books & stationery" },
  { value: "SPORTS", label: "Sports", icon: Trophy, description: "Fitness & gear" },
  { value: "GENERAL", label: "General", icon: Store, description: "Mixed products" },
] as const;

interface Props {
  data: WizardData;
  onNext: (data: Partial<WizardData>) => void;
  onBack: () => void;
}

export function Step2Category({ data, onNext, onBack }: Props) {
  const [category, setCategory] = useState(data.category || "GENERAL");
  const [description, setDescription] = useState(data.description || "");
  const [error, setError] = useState("");

  function handleContinue() {
    if (!category) {
      setError("Please pick a category");
      return;
    }
    onNext({ category, description });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-zinc-900">What do you sell?</h2>
        <p className="text-sm text-zinc-500 mt-1">
          This helps buyers discover your store and sets the right vibe.
        </p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {CATEGORIES.map(({ value, label, icon: Icon, description: desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setCategory(value);
              setError("");
            }}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
              category === value
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-100 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Icon className="w-5 h-5" />
            <div>
              <p className="text-xs font-semibold leading-tight">{label}</p>
              <p className={`text-[10px] leading-tight mt-0.5 ${category === value ? "text-zinc-300" : "text-zinc-400"}`}>
                {desc}
              </p>
            </div>
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Store description <span className="text-zinc-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Tell customers what makes your store special..."
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none text-sm transition-shadow"
        />
        <p className="text-xs text-zinc-400 mt-1 text-right">{description.length}/500</p>
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
