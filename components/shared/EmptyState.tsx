import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-white py-16 text-center sm:py-20",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
        <Icon className="h-7 w-7 text-zinc-400" />
      </div>
      <h2 className="font-heading text-base font-bold text-zinc-900">{title}</h2>
      {description && <p className="mt-1 max-w-xs px-4 text-sm text-zinc-500">{description}</p>}
      {action &&
        (action.href ? (
          <Link
            href={action.href}
            className="mt-5 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-5 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            {action.label}
          </button>
        ))}
    </div>
  );
}
