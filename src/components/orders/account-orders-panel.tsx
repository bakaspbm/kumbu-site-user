"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { RequireAuth } from "@/components/auth/require-auth";
import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel } from "@/components/account/conta-section";
import { OrderList } from "@/components/orders/order-list";
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator";
import { UserFacingErrorAlert } from "@/components/ui/user-facing-error-alert";
import { useResolveUserFacingError } from "@/lib/i18n/use-format-error";
import {
  listPurchaseOrdersBackend,
  listSalesOrdersBackend,
} from "@/lib/kumbu-api/orders";
import { withBrowserAuthRetry } from "@/lib/kumbu-api/with-browser-auth";
import type { Order } from "@/types/store";
import type { LucideIcon } from "lucide-react";

type Mode = "sales" | "purchases";

interface AccountOrdersPanelProps {
  mode: Mode;
  icon: LucideIcon;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  hrefPrefix: string;
}

export function AccountOrdersPanel({
  mode,
  icon,
  title,
  description,
  emptyTitle,
  emptyDescription,
  hrefPrefix,
}: AccountOrdersPanelProps) {
  const tCommon = useTranslations("common");
  const resolveError = useResolveUserFacingError();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ReturnType<typeof resolveError> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await withBrowserAuthRetry(() =>
        mode === "sales" ? listSalesOrdersBackend() : listPurchaseOrdersBackend(),
      );
      setOrders(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(resolveError(err));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [mode, resolveError]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <RequireAuth>
      <ContaPanel>
        <ContaPageHeader icon={icon} title={title} description={description} />
        {loading ? (
          <PageLoadingIndicator label={tCommon("loading")} />
        ) : error ? (
          <UserFacingErrorAlert
            error={error}
            onRetry={() => void load()}
            retryLabel={tCommon("retry")}
          />
        ) : (
          <OrderList
            orders={orders}
            hrefPrefix={hrefPrefix}
            counterparty={mode === "sales" ? "buyer" : "seller"}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
          />
        )}
      </ContaPanel>
    </RequireAuth>
  );
}
