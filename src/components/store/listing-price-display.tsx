"use client";

import { cn } from "@/lib/utils";

interface ListingPriceDisplayProps {
  priceLabel: string;
  oldPriceLabel?: string | null;
  discountPercent?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: { current: "text-sm font-extrabold", old: "text-xs", badge: "text-[10px] px-1.5 py-0.5" },
  md: { current: "text-base font-extrabold", old: "text-sm", badge: "text-xs px-2 py-0.5" },
  lg: { current: "text-3xl font-extrabold md:text-4xl", old: "text-lg", badge: "text-sm px-2.5 py-1" },
};

export function ListingPriceDisplay({
  priceLabel,
  oldPriceLabel,
  discountPercent,
  size = "md",
  className,
}: ListingPriceDisplayProps) {
  const hasPromo =
    oldPriceLabel &&
    oldPriceLabel.trim() &&
    oldPriceLabel.trim() !== priceLabel.trim();
  const styles = sizeClasses[size];

  if (!hasPromo) {
    return (
      <p className={cn(styles.current, "text-kumbu-primary", className)}>
        {priceLabel}
      </p>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <p className={cn(styles.current, "text-kumbu-primary")}>{priceLabel}</p>
      <p className={cn(styles.old, "text-kumbu-muted line-through")}>{oldPriceLabel}</p>
      {discountPercent != null && discountPercent > 0 && (
        <span
          className={cn(
            styles.badge,
            "rounded-full bg-emerald-100 font-bold text-emerald-700",
          )}
        >
          -{discountPercent}%
        </span>
      )}
    </div>
  );
}
