"use client";

import { useOrderStatusLabel } from "@/lib/i18n/use-order-labels";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({ status }: { status: string }) {
  const label = useOrderStatusLabel();
  const s = status.toLowerCase();

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-bold capitalize",
        s === "delivered" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        s === "cancelled" && "bg-red-500/10 text-red-700 dark:text-red-400",
        s === "shipping" && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        (s === "processing" || s === "completed") && "bg-kumbu-primary/10 text-kumbu-primary",
      )}
    >
      {label(status)}
    </span>
  );
}

export function useOrderStatusLabelText() {
  return useOrderStatusLabel();
}
