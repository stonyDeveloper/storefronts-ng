"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Rocket, Store, Tag, Palette, Landmark } from "lucide-react";
import confetti from "canvas-confetti";
import type { WizardData } from "../OnboardingWizard";

const CATEGORY_LABELS: Record<string, string> = {
  FASHION: "Fashion",
  FOOD: "Food",
  ELECTRONICS: "Electronics",
  BEAUTY: "Beauty",
  HOME: "Home",
  BOOKS: "Books",
  SPORTS: "Sports",
  GENERAL: "General",
};

interface Props {
  data: WizardData;
  onBack: () => void;
}

export function Step5Review({ data, onBack }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleLaunch() {
    setSubmitting(true);
    setError("");

    try {
      // 1. Create the store
      const storeRes = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          category: data.category,
          description: data.description || undefined,
          primaryColor: data.primaryColor,
          accentColor: data.accentColor,
          heroStyle: data.heroStyle,
          logoUrl: data.logoUrl || undefined,
          codEnabled: true,
          deliveryFee: 0,
        }),
      });

      const storeData = await storeRes.json();

      if (!storeRes.ok) {
        setError(storeData.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      const storeId: string = storeData.data.id;

      // 2. Create Paystack subaccount (non-fatal if fails)
      if (data.bankCode && data.bankAccountNumber) {
        try {
          await fetch(`/api/stores/${storeId}/subaccount`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bankCode: data.bankCode,
              bankAccountNumber: data.bankAccountNumber,
            }),
          });
        } catch {
          // Silently continue — merchant can set up bank later in Settings
        }
      }

      // 3. Confetti + redirect
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#18181b", "#71717a", "#a1a1aa", "#d4d4d8"],
      });

      router.push("/dashboard");
    } catch {
      setError("Network error — please check your connection and try again.");
      setSubmitting(false);
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const sections = [
    {
      icon: Store,
      label: "Store",
      lines: [data.name, `${appUrl}/store/${data.slug}`],
    },
    {
      icon: Tag,
      label: "Category",
      lines: [CATEGORY_LABELS[data.category] ?? data.category, data.description || "No description"],
    },
    {
      icon: Palette,
      label: "Colors",
      lines: [],
      colors: [
        { label: "Brand", value: data.primaryColor },
        { label: "Background", value: data.accentColor },
      ],
    },
    ...(data.bankCode
      ? [
          {
            icon: Landmark,
            label: "Bank",
            lines: [data.bankDisplayName, data.bankAccountName, `···· ${data.bankAccountNumber.slice(-4)}`],
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-zinc-900">You&apos;re ready!</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Review your store details below, then launch when you&apos;re happy.
        </p>
      </div>

      {/* Review card */}
      <div className="border border-zinc-100 rounded-2xl overflow-hidden divide-y divide-zinc-100">
        {sections.map(({ icon: Icon, label, lines, colors }) => (
          <div key={label} className="flex gap-4 px-4 py-4">
            <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-zinc-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">{label}</p>
              {lines?.map((line, i) => (
                <p
                  key={i}
                  className={`text-sm ${i === 0 ? "font-semibold text-zinc-900" : "text-zinc-500 text-xs mt-0.5"} truncate`}
                >
                  {line}
                </p>
              ))}
              {colors && (
                <div className="flex gap-3 mt-1">
                  {colors.map(({ label: cl, value }) => (
                    <div key={cl} className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-md border border-zinc-200"
                        style={{ backgroundColor: value }}
                      />
                      <span className="text-xs text-zinc-500">{cl}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!data.bankCode && (
        <p className="text-xs text-zinc-400 text-center">
          No bank added — Cash on Delivery will be available. Add bank in Settings to enable card payments.
        </p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex-1 py-3 px-4 border border-zinc-200 text-zinc-700 text-sm font-semibold rounded-xl hover:bg-zinc-50 disabled:opacity-40 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleLaunch}
          disabled={submitting}
          className="flex-[2] py-3 px-4 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-60 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Launching…
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              Launch my store!
            </>
          )}
        </button>
      </div>
    </div>
  );
}
