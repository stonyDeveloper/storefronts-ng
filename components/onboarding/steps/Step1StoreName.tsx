"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2, XCircle, Globe } from "lucide-react";
import { slugify } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import type { WizardData } from "../OnboardingWizard";

const schema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters").max(80),
  slug: z
    .string()
    .min(2, "Must be at least 2 characters")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  data: WizardData;
  onNext: (data: Partial<WizardData>) => void;
}

export function Step1StoreName({ data, onNext }: Props) {
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: data.name, slug: data.slug },
  });

  const name = watch("name");
  const slug = watch("slug");
  const debouncedSlug = useDebounce(slug, 350);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugEdited && name) {
      setValue("slug", slugify(name), { shouldValidate: true });
    }
  }, [name, slugEdited, setValue]);

  // Check slug availability
  useEffect(() => {
    if (!debouncedSlug || debouncedSlug.length < 2) {
      setSlugStatus("idle");
      return;
    }

    setSlugStatus("checking");
    fetch(`/api/stores/check-slug?slug=${encodeURIComponent(debouncedSlug)}`)
      .then((r) => r.json())
      .then((d) => setSlugStatus(d.available ? "available" : "taken"))
      .catch(() => setSlugStatus("idle"));
  }, [debouncedSlug]);

  function onSubmit(values: FormValues) {
    if (slugStatus === "taken") return;
    onNext({ name: values.name, slug: values.slug });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-zinc-900">Name your store</h2>
        <p className="text-sm text-zinc-500 mt-1">Pick something memorable — this is what customers will see.</p>
      </div>

      <div className="space-y-4">
        {/* Store name */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Store name</label>
          <input
            {...register("name")}
            placeholder="e.g. Ada's Boutique"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow text-base"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Store URL</label>
          <div className="relative">
            <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900 transition-shadow">
              <span className="pl-4 pr-1 text-sm text-zinc-400 whitespace-nowrap shrink-0">/store/</span>
              <input
                {...register("slug")}
                onChange={(e) => {
                  setSlugEdited(true);
                  setValue("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""), {
                    shouldValidate: true,
                  });
                }}
                placeholder="ada-boutique"
                className="flex-1 py-3 pr-10 bg-transparent text-zinc-900 placeholder:text-zinc-400 focus:outline-none text-sm font-mono"
              />
              <div className="absolute right-3">
                {slugStatus === "checking" && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />}
                {slugStatus === "available" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {slugStatus === "taken" && <XCircle className="w-4 h-4 text-red-500" />}
              </div>
            </div>
          </div>
          {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
          {slugStatus === "taken" && !errors.slug && (
            <p className="text-xs text-red-500 mt-1">This URL is already taken</p>
          )}
          {slugStatus === "available" && !errors.slug && (
            <p className="text-xs text-emerald-600 mt-1">Available!</p>
          )}
        </div>

        {/* URL preview */}
        {slug && !errors.slug && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
            <Globe className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="text-xs text-zinc-500 font-mono break-all">
              {appUrl}/store/<span className="text-zinc-900 font-semibold">{slug}</span>
            </span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={slugStatus === "taken" || slugStatus === "checking"}
        className="w-full py-3 px-4 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
      >
        Continue
      </button>
    </form>
  );
}
