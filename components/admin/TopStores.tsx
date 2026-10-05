import { Trophy } from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface TopStore {
  id: string;
  name: string;
  slug: string;
  revenue: number;
  currency: string;
}

export function TopStores({ stores }: { stores: TopStore[] }) {
  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
          <Trophy className="h-5 w-5 text-zinc-400" />
        </div>
        <p className="text-sm text-zinc-500">No paid orders yet</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {stores.map((store, i) => (
        <li key={store.id} className="flex items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-500">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900">{store.name}</p>
            <p className="truncate text-xs text-zinc-400">/{store.slug}</p>
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
            {formatMoney(store.revenue, store.currency)}
          </p>
        </li>
      ))}
    </ul>
  );
}
