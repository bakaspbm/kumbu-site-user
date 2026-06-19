"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Calendar, Check, Home, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator";
import { RequireAuth } from "@/components/auth/require-auth";
import {
  listMyPropertyRentalRequests,
  respondPropertyRentalRequest,
} from "@/lib/site-data";
import type { PropertyRentalRequest } from "@/types/property";

interface RentalRequestsManagerProps {
  mode: "owner" | "renter";
}

export function RentalRequestsManager({ mode }: RentalRequestsManagerProps) {
  const t = useTranslations("property.rental");
  const router = useRouter();
  const [items, setItems] = useState<PropertyRentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const statusLabels: Record<string, string> = {
    pending: t("statusPending"),
    confirmed: t("statusConfirmed"),
    rejected: t("statusRejected"),
    cancelled: t("statusCancelled"),
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listMyPropertyRentalRequests(mode));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    void load();
  }, [load]);

  async function respond(id: string, action: "confirm" | "reject") {
    setBusyId(id);
    try {
      const updated = await respondPropertyRentalRequest(id, action);
      setItems((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (action === "confirm" && updated.conversationId) {
        router.push(`/mensagens/${updated.conversationId}`);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : t("respondError"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <RequireAuth>
      {loading ? (
        <PageLoadingIndicator label={t("requestsLoading")} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Home}
          title={mode === "owner" ? t("emptyOwnerTitle") : t("emptyRenterTitle")}
          description={mode === "owner" ? t("emptyOwnerDescription") : t("emptyRenterDescription")}
          actionLabel={t("emptyExplore")}
          actionHref="/procurar"
          className="py-10"
        />
      ) : (
        <ul className="kumbu-card-grid mt-4">
          {items.map((r) => (
            <li key={r.id} className="kumbu-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/produto/${r.productId}`}
                    className="font-bold text-kumbu-foreground hover:text-kumbu-primary"
                  >
                    {r.productTitle ?? t("propertyFallback")}
                  </Link>
                  <p className="mt-1 text-xs font-semibold text-kumbu-muted">
                    {statusLabels[r.status] ?? r.status}
                    {r.otherPartyName ? ` · ${r.otherPartyName}` : ""}
                  </p>
                </div>
                {r.priceSnapshot && (
                  <span className="shrink-0 text-sm font-extrabold text-kumbu-primary">
                    {r.priceSnapshot}
                  </span>
                )}
              </div>

              {r.rentalMode === "daily" && r.checkIn && r.checkOut && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-kumbu-muted">
                  <Calendar className="size-3.5" aria-hidden />
                  {r.checkIn} → {r.checkOut}
                  {r.nights ? ` (${t("nightsCount", { count: r.nights })})` : ""}
                </p>
              )}

              {r.guestMessage && (
                <p className="mt-2 text-sm text-kumbu-muted">&ldquo;{r.guestMessage}&rdquo;</p>
              )}

              {mode === "owner" && r.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    className="h-10 flex-1 gap-1"
                    disabled={busyId === r.id}
                    onClick={() => void respond(r.id, "confirm")}
                  >
                    <Check className="size-4" aria-hidden />
                    {t("confirmRequest")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 flex-1 gap-1 border-red-200 text-red-700"
                    disabled={busyId === r.id}
                    onClick={() => void respond(r.id, "reject")}
                  >
                    <X className="size-4" aria-hidden />
                    {t("rejectRequest")}
                  </Button>
                </div>
              )}

              {r.status === "confirmed" && r.conversationId && (
                <Button
                  href={`/mensagens/${r.conversationId}`}
                  variant="secondary"
                  fullWidth
                  className="mt-3 h-10 gap-2"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  {t("openChat")}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </RequireAuth>
  );
}
