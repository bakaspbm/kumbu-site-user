"use client";

import { cn } from "@/lib/utils";

interface ContaSegmentedTabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  className?: string;
}

export function ContaSegmentedTabs<T extends string>({
  value,
  onChange,
  options,
  className,
}: ContaSegmentedTabsProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex w-full max-w-full gap-1 overflow-x-auto rounded-2xl bg-kumbu-surface-muted/80 p-1 ring-1 ring-kumbu-border scrollbar-none",
        className,
      )}
      role="tablist"
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-w-0 flex-1 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 sm:text-[13px]",
              active
                ? "bg-kumbu-surface text-kumbu-foreground shadow-[var(--shadow-kumbu-sm)] ring-1 ring-kumbu-border/80"
                : "text-kumbu-muted hover:bg-kumbu-surface/60 hover:text-kumbu-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
