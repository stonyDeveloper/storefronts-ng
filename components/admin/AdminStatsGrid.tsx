"use client";

import { motion } from "framer-motion";
import { TrendingUp, Wallet, Store, ShoppingBag } from "lucide-react";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { formatMoney, cn } from "@/lib/utils";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const card = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

interface AdminStatsGridProps {
  gmv: number;
  platformFees: number;
  merchantCount: number;
  storeCount: number;
  suspendedCount: number;
  orderCount: number;
  ordersToday: number;
}

export function AdminStatsGrid({
  gmv,
  platformFees,
  merchantCount,
  storeCount,
  suspendedCount,
  orderCount,
  ordersToday,
}: AdminStatsGridProps) {
  const stats = [
    {
      label: "Total GMV",
      sub: "All paid orders",
      value: gmv,
      format: (v: number) => formatMoney(Math.round(v), "NGN"),
      icon: TrendingUp,
      dark: true,
    },
    {
      label: "Platform fees",
      sub: "Our cut, auto-split",
      value: platformFees,
      format: (v: number) => formatMoney(Math.round(v), "NGN"),
      icon: Wallet,
    },
    {
      label: "Merchants",
      sub: `${storeCount} live stores${suspendedCount ? ` · ${suspendedCount} suspended` : ""}`,
      value: merchantCount,
      icon: Store,
    },
    {
      label: "Orders",
      sub: `${ordersToday} today`,
      value: orderCount,
      icon: ShoppingBag,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            variants={card}
            className={cn(
              "rounded-2xl p-5",
              stat.dark ? "bg-zinc-900" : "border border-zinc-100 bg-white"
            )}
          >
            <div
              className={cn(
                "mb-4 w-fit rounded-xl p-2",
                stat.dark ? "bg-white/10" : "bg-zinc-50"
              )}
            >
              <Icon className={cn("h-4 w-4", stat.dark ? "text-white" : "text-zinc-500")} />
            </div>
            <div
              className={cn(
                "font-heading text-2xl font-bold sm:text-3xl",
                stat.dark ? "text-white" : "text-zinc-900"
              )}
            >
              <AnimatedCounter value={stat.value} format={stat.format} />
            </div>
            <p className={cn("mt-2 text-sm font-medium", stat.dark ? "text-zinc-300" : "text-zinc-900")}>
              {stat.label}
            </p>
            <p className={cn("text-xs", stat.dark ? "text-zinc-500" : "text-zinc-400")}>{stat.sub}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
