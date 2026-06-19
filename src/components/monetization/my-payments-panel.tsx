"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { isKumbuApiEnabled } from "@/lib/kumbu-api/client";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator";
import {
  listMyMonetizationPaymentsBackend,
  type MonetizationPayment,
} from "@/lib/kumbu-api/monetization";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";

export function MyMonetizationPaymentsPanel() {
  const t = useTranslations("monetization");
  const formatErrorMessage = useFormatErrorMessage();
  const [items, setItems] = useState<MonetizationPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusLabel = useCallback(
    (status: string) => {
      const key = status.toLowerCase();
      if (key in { pending: 1, pending_proof: 1, submitted: 1, confirmed: 1, rejected: 1, cancelled: 1 }) {
        return t(`status.${key as "pending"}`);
      }
      return status;
    },
    [t],
  );

  const load = useCallback(async () => {
    if (!isKumbuApiEnabled()) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await listMyMonetizationPaymentsBackend();
      setItems(rows);
    } catch (err) {
      setError(formatErrorMessage(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [formatErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isKumbuApiEnabled()) {
    return (
      <p className="rounded-2xl bg-kumbu-surface-muted/50 px-4 py-3 text-sm text-kumbu-muted ring-1 ring-kumbu-border/60">
        {t("apiRequired")}
      </p>
    );
  }

  if (loading) {
    return <PageLoadingIndicator label={t("loading")} />;
  }

  if (error) {
    return (
      <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-100" role="alert">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        actionLabel={t("emptyAction")}
        actionHref="/conta/anuncios"
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((p) => (
        <li key={p.id} className="kumbu-card-interactive p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-kumbu-primary-soft text-kumbu-primary">
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-kumbu-foreground">
                {p.productName ?? t("defaultPlan")}
              </p>
              <p className="mt-1 text-sm text-kumbu-muted">
                {p.amountLabel ?? (p.amount != null ? `${p.amount} Kz` : "—")}
                {" · "}
                {statusLabel(p.status)}
              </p>
              {p.targetId ? (
                <p className="mt-1 text-xs text-kumbu-muted">{t("listingRef", { id: p.targetId })}</p>
              ) : null}
              {p.proofUrl ? (
                <p className="mt-1 text-xs font-semibold text-emerald-700">{t("proofSubmitted")}</p>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
