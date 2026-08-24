"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Package } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator";
import { UserFacingErrorAlert } from "@/components/ui/user-facing-error-alert";
import { useAuth } from "@/contexts/auth-context";
import { useResolveUserFacingError } from "@/lib/i18n/use-format-error";
import { getOrderBackend } from "@/lib/kumbu-api/orders";
import { withBrowserAuthRetry } from "@/lib/kumbu-api/with-browser-auth";
import type { Order } from "@/types/store";

interface OrderDetailLoaderProps {
  orderId: string;
  role: "buyer" | "seller";
  backHref: string;
  backLabel: string;
}

export function OrderDetailLoader({
  orderId,
  role,
  backHref,
  backLabel,
}: OrderDetailLoaderProps) {
  const tCommon = useTranslations("common");
  const tOrders = useTranslations("orders");
  const { storeUser } = useAuth();
  const resolveError = useResolveUserFacingError();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ReturnType<typeof resolveError> | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      const row = await withBrowserAuthRetry(() => getOrderBackend(orderId));
      if (!row) {
        setOrder(null);
        setForbidden(true);
        return;
      }
      const userId = storeUser?.id;
      if (userId) {
        const allowed =
          role === "seller" ? row.sellerId === userId : row.userId === userId;
        if (!allowed) {
          setOrder(null);
          setForbidden(true);
          return;
        }
      }
      setOrder(row);
    } catch (err) {
      setError(resolveError(err));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId, resolveError, role, storeUser?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <RequireAuth>
      {loading ? (
        <PageLoadingIndicator label={tCommon("loading")} />
      ) : error ? (
        <div className="mt-8">
          <UserFacingErrorAlert
            error={error}
            onRetry={() => void load()}
            retryLabel={tCommon("retry")}
          />
        </div>
      ) : !order || forbidden ? (
        <EmptyState
          className="mt-8"
          icon={Package}
          title={tOrders("emptyTitle")}
          description={tOrders("emptyDescription")}
          actionLabel={tOrders("exploreListings")}
          actionHref={backHref}
        />
      ) : (
        <OrderDetailView
          order={order}
          backHref={backHref}
          backLabel={backLabel}
          role={role}
        />
      )}
    </RequireAuth>
  );
}
