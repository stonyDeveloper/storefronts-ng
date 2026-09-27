"use client";

import { useState } from "react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X, Loader2 } from "lucide-react";

interface BrandingSectionProps {
  storeId: string;
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
}

type Status = "idle" | "saving" | "saved" | "error";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "storefronts";
const cloudinaryReady = !!cloudName && cloudName !== "placeholder";

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
      <label className="mb-0.5 block text-sm font-medium text-zinc-700">{label}</label>
      <p className="mb-2 text-xs text-zinc-400">{hint}</p>
      <div className="flex items-center gap-3">
        <label className="cursor-pointer">
          <div
            className="h-10 w-10 rounded-xl border-2 border-zinc-200 shadow-sm transition-transform hover:scale-105"
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
          placeholder="#18181B"
          className="flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
        />
      </div>
    </div>
  );
}

export function BrandingSection({
  storeId,
  storeName,
  logoUrl: initialLogo,
  primaryColor: initialPrimary,
  accentColor: initialAccent,
}: BrandingSectionProps) {
  const [logoUrl, setLogoUrl] = useState(initialLogo ?? "");
  const [primaryColor, setPrimary] = useState(initialPrimary);
  const [accentColor, setAccent] = useState(initialAccent);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^#[0-9A-Fa-f]{6}$/.test(primaryColor) || !/^#[0-9A-Fa-f]{6}$/.test(accentColor)) {
      setStatus("error");
      setErrorMsg("Enter valid hex colors (e.g. #18181B)");
      return;
    }
    setStatus("saving");
    setErrorMsg("");

    const res = await fetch(`/api/stores/${storeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logoUrl: logoUrl.trim() || null,
        primaryColor,
        accentColor,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setStatus("error");
      setErrorMsg(json.error ?? "Something went wrong");
    } else {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
      <div className="border-b border-zinc-50 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-900">Branding</h2>
        <p className="mt-0.5 text-xs text-zinc-400">Logo and colors that appear on your storefront.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        {/* Logo */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">Logo</label>
          {logoUrl ? (
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
                <Image src={logoUrl} alt="Store logo" fill className="object-contain p-1" sizes="64px" />
              </div>
              <button
                type="button"
                onClick={() => setLogoUrl("")}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              {cloudinaryReady ? (
                <CldUploadWidget
                  uploadPreset={uploadPreset}
                  options={{ multiple: false, maxFiles: 1, resourceType: "image" }}
                  onSuccess={(results) => {
                    const info = results.info as Record<string, unknown> | undefined;
                    const url = info?.secure_url as string | undefined;
                    if (url) setLogoUrl(url);
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <ImagePlus className="h-4 w-4" />
                      Upload logo
                    </button>
                  )}
                </CldUploadWidget>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-200 px-4 py-2.5 text-sm text-zinc-400">
                  <ImagePlus className="h-4 w-4" />
                  Add Cloudinary keys to enable upload
                </div>
              )}
            </div>
          )}
        </div>

        {/* Color pickers */}
        <ColorInput
          label="Brand color"
          hint="Header, buttons, and key accents"
          value={primaryColor}
          onChange={setPrimary}
        />
        <ColorInput
          label="Background color"
          hint="The surface color behind your products"
          value={accentColor}
          onChange={setAccent}
        />

        {/* Live preview */}
        <div>
          <p className="mb-2 text-xs font-medium text-zinc-400">Preview</p>
          <div className="overflow-hidden rounded-xl border border-zinc-100 shadow-sm">
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ backgroundColor: primaryColor }}
            >
              <span className="font-heading text-sm font-bold text-white">{storeName}</span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-5 w-5 rounded-full opacity-50"
                    style={{ backgroundColor: accentColor }}
                  />
                ))}
              </div>
            </div>
            <div className="p-3" style={{ backgroundColor: accentColor }}>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-lg bg-white shadow-sm" />
                ))}
              </div>
              <div
                className="mt-3 rounded-lg py-2 text-center text-xs font-semibold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Shop now
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={status === "saving"}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
          >
            {status === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {status === "saving" ? "Saving…" : "Save changes"}
          </button>
          {status === "saved" && <span className="text-xs text-emerald-600">Saved!</span>}
          {status === "error" && <span className="text-xs text-red-500">{errorMsg}</span>}
        </div>
      </form>
    </section>
  );
}
