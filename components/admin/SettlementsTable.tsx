import { CreditCard, Banknote, Receipt } from "lucide-react";
import { format } from "date-fns";
import type { PaymentMethod } from "@prisma/client";
import { formatMoney } from "@/lib/utils";

interface Settlement {
  id: string;
  reference: string;
  storeName: string;
  storeSlug: string;
  total: number;
  platformFee: number;
  merchantReceives: number;
  paymentMethod: PaymentMethod;
  currency: string;
  createdAt: string;
}

export function SettlementsTable({ settlements }: { settlements: Settlement[] }) {
  if (settlements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
          <Receipt className="h-5 w-5 text-zinc-400" />
        </div>
        <p className="text-sm text-zinc-500">No settled orders yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-xs text-zinc-400">
            <th className="py-2.5 pr-4 font-medium">Order</th>
            <th className="py-2.5 pr-4 font-medium">Store</th>
            <th className="py-2.5 pr-4 font-medium">Method</th>
            <th className="py-2.5 pr-4 text-right font-medium">Total</th>
            <th className="py-2.5 pr-4 text-right font-medium">Platform fee</th>
            <th className="py-2.5 text-right font-medium">Merchant receives</th>
          </tr>
        </thead>
        <tbody>
          {settlements.map((s) => (
            <tr key={s.id} className="border-b border-zinc-50 last:border-0">
              <td className="py-3 pr-4">
                <p className="font-medium text-zinc-900">{s.reference}</p>
                <p className="text-xs text-zinc-400">{format(new Date(s.createdAt), "d MMM yyyy")}</p>
              </td>
              <td className="py-3 pr-4 text-zinc-700">{s.storeName}</td>
              <td className="py-3 pr-4">
                <span className="flex items-center gap-1.5 text-zinc-600">
                  {s.paymentMethod === "CASH_ON_DELIVERY" ? (
                    <Banknote className="h-3.5 w-3.5 text-zinc-400" />
                  ) : (
                    <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                  {s.paymentMethod === "CASH_ON_DELIVERY" ? "COD" : "Paystack"}
                </span>
              </td>
              <td className="py-3 pr-4 text-right tabular-nums font-medium text-zinc-900">
                {formatMoney(s.total, s.currency)}
              </td>
              <td className="py-3 pr-4 text-right tabular-nums text-zinc-500">
                {s.platformFee > 0 ? formatMoney(s.platformFee, s.currency) : "—"}
              </td>
              <td className="py-3 text-right tabular-nums font-medium text-emerald-700">
                {formatMoney(s.merchantReceives, s.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
