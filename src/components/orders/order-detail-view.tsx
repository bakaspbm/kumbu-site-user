"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { BackHeader } from "@/components/layout/back-header";
import { OrderC2cHint } from "@/components/orders/order-c2c-hint";
import { OrderStatusActions } from "@/components/orders/order-status-actions";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { useOrderStatusLabel } from "@/lib/i18n/use-order-labels";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types/store";

interface OrderDetailViewProps {
  order: Order;
  backHref: string;
  backLabel: string;
  role: "buyer" | "seller";
}

export function OrderDetailView({ order, backHref, backLabel, role }: OrderDetailViewProps) {
  const t = useTranslations("orders");
  const statusLabel = useOrderStatusLabel();
  const locale = useLocale();

  const created = order.createdAt
    ? new Date(order.createdAt).toLocaleString(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  const counterparty =
    role === "buyer" ? order.seller?.displayName : order.buyer?.displayName;

  return (
    <>
      <BackHeader
        title={t("orderRef", { id: order.id.slice(0, 8).toUpperCase() })}
        href={backHref}
      />
      <main className="kumbu-container max-w-2xl pb-10 pt-6">
        <div className="kumbu-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-kumbu-muted">{t("statusLabel")}</p>
              <div className="mt-1">
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-2 text-xs text-kumbu-muted">{statusLabel(order.status)}</p>
            </div>
            <p className="text-right text-2xl font-extrabold text-kumbu-primary">
              {order.totalLabel}
            </p>
          </div>

          <dl className="mt-6 space-y-4 border-t border-kumbu-border pt-6 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-kumbu-muted">{t("date")}</dt>
              <dd className="font-semibold text-kumbu-foreground">{created}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-kumbu-muted">{t("items")}</dt>
              <dd className="font-semibold text-kumbu-foreground">
                {order.itemsCount}{" "}
                {order.itemsCount === 1 ? t("itemSingular") : t("itemPlural")}
              </dd>
            </div>
            {counterparty && (
              <div className="flex justify-between gap-4">
                <dt className="text-kumbu-muted">
                  {role === "buyer" ? t("seller") : t("buyer")}
                </dt>
                <dd className="font-semibold text-kumbu-foreground">{counterparty}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-kumbu-muted">{t("reference")}</dt>
              <dd className="font-mono text-xs font-semibold text-kumbu-foreground">
                {order.id}
              </dd>
            </div>
          </dl>

          <OrderC2cHint role={role} />
          {role === "seller" ? (
            <OrderStatusActions order={order} role={role} />
          ) : (
            <p className="mt-4 border-t border-kumbu-border pt-4 text-xs text-kumbu-muted">
              {t.rich("buyerHint", {
                link: (chunks) => (
                  <Link href="/mensagens" className="font-semibold text-kumbu-primary hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          )}
        </div>

        <Button href={backHref} variant="secondary" fullWidth className="mt-6 h-12">
          {backLabel}
        </Button>
        <Link
          href="/"
          className="mt-4 block text-center text-sm font-semibold text-kumbu-primary"
        >
          {t("backHome")}
        </Link>
      </main>
    </>
  );
}
