"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/utils";

interface ChartPoint {
  date: string;
  revenue: number;
}

interface RevenueChartProps {
  data: ChartPoint[];
  currency?: string;
}

function compactMoney(kobo: number): string {
  const major = kobo / 100;
  if (major >= 1_000_000) return `₦${(major / 1_000_000).toFixed(1)}M`;
  if (major >= 1_000) return `₦${(major / 1_000).toFixed(0)}k`;
  return `₦${major.toFixed(0)}`;
}

export function RevenueChart({ data, currency = "NGN" }: RevenueChartProps) {
  const hasData = data.some((d) => d.revenue > 0);

  if (!hasData) {
    return (
      <div className="flex h-[220px] items-center justify-center text-center">
        <div>
          <p className="text-sm font-medium text-zinc-400">No revenue yet</p>
          <p className="mt-1 text-xs text-zinc-300">
            Revenue will appear here once buyers place paid orders.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#18181b" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          tickFormatter={(val: string) =>
            new Date(val).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
          }
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          tickFormatter={compactMoney}
          width={64}
        />
        <Tooltip
          content={({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-xl border border-zinc-100 bg-white p-3 shadow-lg">
                <p className="mb-1 text-xs text-zinc-400">
                  {new Date(label as string).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <p className="text-sm font-semibold text-zinc-900">
                  {formatMoney(payload[0].value ?? 0, currency)}
                </p>
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#18181b"
          strokeWidth={2}
          fill="url(#revenue-gradient)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: "#18181b" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
