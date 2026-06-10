import { Package, Receipt } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { resolveServerAuth } from "@/lib/server-page-auth";
import { listOrders } from "@/lib/site-data";
export default async function OrdersPage() {
  const t = await getTranslations("orders");
  const auth = await resolveServerAuth();
  const needsLogin = auth.status !== "logged_in";

  const orders =
    auth.status === "logged_in"
      ? await listOrders().catch(() => [])
      : [];

  return (
    <>
      <SiteHeader subtitle={t("title")} showSearch={false} />
      <main className="kumbu-container max-w-2xl pb-10">
        {needsLogin ? (
          <EmptyState
            className="mt-4"
            icon={Receipt}
            title={t("loginTitle")}
            description={t("loginDescription")}
            actionLabel={t("loginAction")}
            actionHref="/login"
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
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/orders/${o.id}`}
                  className="kumbu-card-interactive block p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-kumbu-foreground">
                      {t("orderRefShort", { id: o.id.slice(0, 8).toUpperCase() })}
                    </span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <p className="mt-2 text-sm text-kumbu-muted">
                    <span className="font-semibold text-kumbu-primary">{o.totalLabel}</span>
                    {" · "}
                    {o.itemsCount} {o.itemsCount === 1 ? t("itemSingular") : t("itemPlural")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
