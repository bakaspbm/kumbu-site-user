"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { History, TrendingDown } from "lucide-react";
import { getListingPriceHistoryBackend } from "@/lib/kumbu-api/catalog";
import type { PriceHistoryEntry } from "@/types/store";

function formatChangedAt(value: string): string {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("pt-AO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

interface ListingPriceHistoryPanelProps {
  productId: string;
}

export function ListingPriceHistoryPanel({ productId }: ListingPriceHistoryPanelProps) {
  const t = useTranslations("product.priceHistory");
  const [entries, setEntries] = useState<PriceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void getListingPriceHistoryBackend(productId)
      .then((items) => {
        if (!cancelled) setEntries(items);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <p className="text-sm text-kumbu-muted">{t("loading")}</p>
    );
  }

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="kumbu-card mt-6 p-4 md:p-5">
      <div className="flex items-center gap-2">
        <History className="size-4 text-kumbu-primary" aria-hidden />
        <h2 className="text-sm font-bold text-kumbu-foreground">{t("title")}</h2>
      </div>
      <ul className="mt-3 space-y-2">
        {entries.map((entry, index) => (
          <li
            key={`${entry.changedAt}-${index}`}
            className="flex items-center justify-between gap-3 rounded-xl bg-kumbu-surface-muted px-3 py-2.5 text-sm"
          >
            <div className="min-w-0">
              <p className="font-semibold text-kumbu-foreground">{entry.priceLabel}</p>
              {entry.oldPriceLabel && (
                <p className="text-xs text-kumbu-muted line-through">{entry.oldPriceLabel}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              {entry.discountPercent != null && entry.discountPercent > 0 && (
                <p className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700">
                  <TrendingDown className="size-3" />
                  -{entry.discountPercent}%
                </p>
              )}
              <p className="text-[11px] text-kumbu-muted">
                {formatChangedAt(entry.changedAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
