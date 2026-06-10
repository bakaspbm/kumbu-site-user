"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/types/store";

interface CartLineItemProps {
  item: CartItem;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}

export function CartLineItem({ item, onDecrease, onIncrease, onRemove }: CartLineItemProps) {
  const t = useTranslations("cart");

  return (
    <li className="kumbu-card p-4">
      <div className="flex gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-kumbu-primary/10 text-sm font-extrabold text-kumbu-primary">
          {item.quantity}
        </span>
        <div className="min-w-0 flex-1">
          <Link
            href={`/produto/${item.productId}`}
            className="line-clamp-2 font-bold leading-snug text-kumbu-foreground hover:text-kumbu-primary"
          >
            {item.title}
          </Link>
          <p className="mt-1 text-base font-extrabold text-kumbu-primary">{item.priceLabel}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-kumbu-muted transition-colors hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/15"
          aria-label={t("removeItem")}
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-kumbu-border pt-3">
        <span className="text-xs font-semibold text-kumbu-muted">{t("quantity")}</span>
        <div className="ml-auto flex items-center gap-1 rounded-xl bg-kumbu-secondary p-1">
          <button
            type="button"
            onClick={onDecrease}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg transition-colors",
              "hover:bg-kumbu-surface hover:text-kumbu-primary",
            )}
            aria-label={t("decrease")}
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-[2ch] text-center text-sm font-bold">{item.quantity}</span>
          <button
            type="button"
            onClick={onIncrease}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg transition-colors",
              "hover:bg-kumbu-surface hover:text-kumbu-primary",
            )}
            aria-label={t("increase")}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
