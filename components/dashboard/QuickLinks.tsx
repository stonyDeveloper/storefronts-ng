"use client";

import Link from "next/link";
import { Plus, ExternalLink, Share2, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickLinksProps {
  storeUrl: string;
  storeSlug: string;
  paystackEnabled: boolean;
  codEnabled: boolean;
  productCount: number;
}

export function QuickLinks({
  storeUrl,
  storeSlug,
  paystackEnabled,
  codEnabled,
  productCount,
}: QuickLinksProps) {
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`Shop from my store: ${storeUrl}`)}`;

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Store health
        </p>
        <div className="space-y-2.5">
          <HealthRow
            label="Paystack payments"
            ok={paystackEnabled}
            note={paystackEnabled ? undefined : "Set up in Settings"}
          />
          <HealthRow label="Cash on delivery" ok={codEnabled} />
          <HealthRow
            label="Products listed"
            ok={productCount > 0}
            note={
              productCount > 0
                ? `${productCount} product${productCount !== 1 ? "s" : ""}`
                : "Add your first"
            }
          />
        </div>
      </div>

      <div className="flex-1">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Quick actions
        </p>
        <div className="space-y-0.5">
          <ActionLink href="/products/new" icon={Plus} label="Add product" />
          <ActionLink
            href={`/store/${storeSlug}`}
            icon={ExternalLink}
            label="View your store"
            external
          />
          <ActionLink href={waUrl} icon={Share2} label="Share on WhatsApp" external />
        </div>
      </div>
    </div>
  );
}

function HealthRow({
  label,
  ok,
  note,
}: {
  label: string;
  ok: boolean;
  note?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-zinc-200" />
      )}
      <span className="flex-1 text-sm text-zinc-600">{label}</span>
      {note && (
        <span className={cn("text-xs", ok ? "text-zinc-400" : "text-amber-500")}>{note}</span>
      )}
    </div>
  );
}

function ActionLink({
  href,
  icon: Icon,
  label,
  external,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
    >
      <Icon className="h-4 w-4 shrink-0 text-zinc-400" />
      {label}
    </Link>
  );
}
