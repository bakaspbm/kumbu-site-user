"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/lib/site-data";
import type { Order, OrderStatus } from "@/types/store";

function sellerActions(
  status: string,
  t: ReturnType<typeof useTranslations<"orders.actions">>,
): { status: OrderStatus; label: string; variant?: "secondary" | "outline" }[] {
  const s = status.toLowerCase();
  if (s === "processing") {
    return [
      { status: "shipping", label: t("markShipping") },
      { status: "delivered", label: t("markDelivered"), variant: "secondary" },
      { status: "cancelled", label: t("cancel"), variant: "outline" },
    ];
  }
  if (s === "shipping") {
    return [
      { status: "delivered", label: t("markDelivered") },
      { status: "cancelled", label: t("cancel"), variant: "outline" },
    ];
  }
  return [];
}

export function OrderStatusActions({
  order,
  role,
}: {
  order: Order;
  role: "buyer" | "seller";
}) {
  const t = useTranslations("orders");
  const tActions = useTranslations("orders.actions");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [busy, setBusy] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (role !== "seller") return null;

  const actions = sellerActions(order.status, tActions);
  if (actions.length === 0) return null;

  async function apply(next: OrderStatus) {
    setBusy(next);
    setError(null);
    try {
      await updateOrderStatus(order.id, next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("updateError"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-4 space-y-2 border-t border-kumbu-border pt-4">
      <p className="text-xs font-semibold text-kumbu-muted">{t("updateStatus")}</p>
      <div className="flex flex-col gap-2">
        {actions.map((a) => (
          <Button
            key={a.status}
            type="button"
            variant={a.variant ?? "primary"}
            fullWidth
            className="h-11"
            disabled={busy !== null}
            onClick={() => void apply(a.status)}
          >
            {busy === a.status ? tCommon("saving") : a.label}
          </Button>
        ))}
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
