"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Package } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Order } from "@/types/store";

interface OrderListProps {
  orders: Order[];
  hrefPrefix: string;
  emptyTitle: string;
  emptyDescription: string;
  counterparty: "seller" | "buyer";
}

export function OrderList({
  orders,
  hrefPrefix,
  emptyTitle,
  emptyDescription,
  counterparty,
}: OrderListProps) {
  const t = useTranslations("orders");

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={t("exploreListings")}
        actionHref="/categorias"
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {orders.map((o) => {
        const party =
          counterparty === "seller"
            ? o.seller?.displayName
            : o.buyer?.displayName;
        return (
          <li key={o.id}>
            <Link href={`${hrefPrefix}/${o.id}`} className="kumbu-card-interactive block p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold tracking-tight text-kumbu-foreground">
                  #{o.id.slice(0, 8).toUpperCase()}
                </span>
                <OrderStatusBadge status={o.status} />
              </div>
              <p className="mt-2.5 text-sm text-kumbu-muted">
                <span className="font-semibold text-kumbu-primary">{o.totalLabel}</span>
                {" · "}
                {o.itemsCount}{" "}
                {o.itemsCount === 1 ? t("itemSingular") : t("itemPlural")}
                {party ? ` · ${party}` : ""}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
