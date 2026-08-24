"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { SiteHeader } from "@/components/layout/site-header";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator";
import { UserFacingErrorAlert } from "@/components/ui/user-facing-error-alert";
import { useResolveUserFacingError } from "@/lib/i18n/use-format-error";
import { listPurchaseOrdersBackend } from "@/lib/kumbu-api/orders";
import { withBrowserAuthRetry } from "@/lib/kumbu-api/with-browser-auth";
import type { Order } from "@/types/store";

export function OrdersListPage() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const resolveError = useResolveUserFacingError();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ReturnType<typeof resolveError> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await withBrowserAuthRetry(() => listPurchaseOrdersBackend());
      setOrders(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(resolveError(err));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [resolveError]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <SiteHeader subtitle={t("title")} showSearch={false} />
      <main className="kumbu-container max-w-2xl pb-10">
        <RequireAuth>
          {loading ? (
            <PageLoadingIndicator label={tCommon("loading")} />
          ) : error ? (
            <UserFacingErrorAlert
              error={error}
              className="mt-4"
              onRetry={() => void load()}
              retryLabel={tCommon("retry")}
            />
          ) : orders.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={Package}
              title={t("emptyTitle")}
              description={t("emptyDescription")}
              actionLabel={t("emptyAction")}
              actionHref="/search"
            />
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {orders.map((o) => {
                const id = String(o.id ?? "");
                return (
                  <li key={id}>
                    <Link
                      href={`/orders/${id}`}
                      className="kumbu-card-interactive block p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-kumbu-foreground">
                          {t("orderRefShort", {
                            id: id.slice(0, 8).toUpperCase() || "—",
                          })}
                        </span>
                        <OrderStatusBadge status={o.status} />
                      </div>
                      <p className="mt-2 text-sm text-kumbu-muted">
                        <span className="font-semibold text-kumbu-primary">
                          {o.totalLabel}
                        </span>
                        {" · "}
                        {o.itemsCount}{" "}
                        {o.itemsCount === 1 ? t("itemSingular") : t("itemPlural")}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </RequireAuth>
      </main>
    </>
  );
}
