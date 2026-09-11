import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { COUNTRY_CONFIG } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(minor: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(minor / 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateRef(): string {
  return `SF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

/**
 * Build a wa.me deep link to a phone number. Local numbers ("0803…") are
 * converted to international form using the country's dial code.
 */
export function waMeLink(phone: string, country: string, text?: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const dialCode = COUNTRY_CONFIG[country]?.dialCode;
  if (dialCode && digits.startsWith("0")) {
    digits = dialCode + digits.slice(1);
  }
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}
