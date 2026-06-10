"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Calendar, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPropertyPrice } from "@/lib/property/category";
import { usePropertyPublishLabels } from "@/lib/i18n/use-property-labels";
import { nightsBetween, todayIso } from "@/lib/property/dates";
import {
  createPropertyRentalRequest,
  isDailyRangeAvailable,
  listOccupiedDateRanges,
} from "@/lib/site-data";
import { occupiedNightSet } from "@/lib/property/helpers";
import { useAuth } from "@/contexts/auth-context";
import type { CatalogProduct } from "@/types/store";
import type { PropertyMeta } from "@/types/property";

interface PropertyRentalActionsProps {
  product: CatalogProduct;
  meta: PropertyMeta;
}

export function PropertyRentalActions({ product, meta }: PropertyRentalActionsProps) {
  const t = useTranslations("property.rental");
  const tCommon = useTranslations("common");
  const { rentalMessagePlaceholder } = usePropertyPublishLabels();
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [message, setMessage] = useState("");
  const [occupied, setOccupied] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isDaily = meta.rentPeriod === "daily";
  const minNights = meta.minNights ?? 1;
  const messagePlaceholder = rentalMessagePlaceholder(
    meta.propertyType,
    meta.rentPeriod ?? "",
  );

  useEffect(() => {
    if (!isDaily) return;
    void (async () => {
      const ranges = await listOccupiedDateRanges(product.id);
      setOccupied(occupiedNightSet(ranges));
    })();
  }, [isDaily, product.id]);

  async function submitLongTerm() {
    setToast(null);
    if (!isLoggedIn) {
      router.push(`/login?next=/produto/${product.id}`);
      return;
    }
    setBusy(true);
    try {
      await createPropertyRentalRequest({
        productId: product.id,
        ownerId: product.sellerId,
        rentalMode: "long_term",
        guestMessage: message,
        priceSnapshot: formatPropertyPrice(meta) || product.priceLabel,
      });
      setDone(true);
      setToast(t("longTermSuccess"));
    } catch (e) {
      setToast(e instanceof Error ? e.message : t("submitError"));
    } finally {
      setBusy(false);
    }
  }

  async function submitDaily() {
    setToast(null);
    if (!checkIn || !checkOut) {
      setToast(t("selectDates"));
      return;
    }
    const nights = nightsBetween(checkIn, checkOut);
    if (nights < minNights) {
      setToast(t("minNights", { count: minNights }));
      return;
    }
    if (!isLoggedIn) {
      router.push(`/login?next=/produto/${product.id}`);
      return;
    }
    setBusy(true);
    try {
      const ok = await isDailyRangeAvailable(product.id, checkIn, checkOut);
      if (!ok) {
        setToast(t("datesUnavailable"));
        return;
      }
      await createPropertyRentalRequest({
        productId: product.id,
        ownerId: product.sellerId,
        rentalMode: "daily",
        checkIn,
        checkOut,
        guestMessage: message,
        priceSnapshot: formatPropertyPrice(meta) || product.priceLabel,
      });
      setDone(true);
      setToast(t("dailySuccess"));
    } catch (e) {
      setToast(e instanceof Error ? e.message : t("reserveError"));
    } finally {
      setBusy(false);
    }
  }

  if (user?.id === product.sellerId) {
    return (
      <div className="space-y-3">
        <p className="rounded-xl bg-kumbu-secondary px-4 py-3 text-sm text-kumbu-muted">
          {t("ownProperty")}
        </p>
        <Button href="/conta/reservas" fullWidth className="h-12">
          {t("viewRequests")}
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
        <p className="font-bold">{t("requestRegistered")}</p>
        <p>{toast}</p>
        <Button href="/conta/reservas" variant="secondary" fullWidth className="h-11">
          {t("viewMyRequests")}
        </Button>
      </div>
    );
  }

  if (isDaily) {
    return (
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Calendar className="size-4 text-kumbu-primary" />
          {t("bookDates")}
        </h3>
        <p className="text-xs text-kumbu-muted">{t("dailyHint")}</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold">
            {t("checkIn")}
            <input
              type="date"
              min={todayIso()}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="kumbu-input font-normal"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold">
            {t("checkOut")}
            <input
              type="date"
              min={checkIn || todayIso()}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="kumbu-input font-normal"
            />
          </label>
        </div>
        {occupied.size > 0 && (
          <p className="text-xs text-amber-800">{t("occupiedHint")}</p>
        )}
        <label className="flex flex-col gap-1 text-xs font-semibold">
          {t("messageOptional")}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="kumbu-input min-h-[72px] font-normal"
            placeholder={messagePlaceholder}
          />
        </label>
        <Button
          type="button"
          fullWidth
          className="h-12"
          disabled={busy}
          onClick={() => void submitDaily()}
        >
          <Send className="size-4" />
          {busy ? tCommon("sending") : t("requestReservation")}
        </Button>
        {toast && (
          <p className="rounded-xl bg-kumbu-secondary px-3 py-2 text-sm text-kumbu-muted">
            {toast}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold">{t("longTermTitle")}</h3>
      <p className="text-xs text-kumbu-muted">{t("longTermHint")}</p>
      <label className="flex flex-col gap-1 text-xs font-semibold">
        {t("message")}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="kumbu-input min-h-[72px] font-normal"
          placeholder={messagePlaceholder}
        />
      </label>
      <Button
        type="button"
        fullWidth
        className="h-12"
        disabled={busy}
        onClick={() => void submitLongTerm()}
      >
        {busy ? tCommon("sending") : t("requestRental")}
      </Button>
      {toast && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{toast}</p>
      )}
    </div>
  );
}

export function PropertySaleActions({ product }: { product: CatalogProduct }) {
  const t = useTranslations("property.rental");
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-xs text-kumbu-muted">{t("saleHint")}</p>
      <Button
        type="button"
        fullWidth
        variant="secondary"
        className="h-12"
        onClick={() => {
          if (!isLoggedIn) {
            router.push(`/login?next=/produto/${product.id}`);
            return;
          }
          setToast(t("useMessageButton"));
        }}
      >
        <MessageCircle className="size-5" />
        {t("interested")}
      </Button>
      {toast && (
        <p className="rounded-xl bg-kumbu-secondary px-3 py-2 text-sm text-kumbu-muted">
          {toast}
        </p>
      )}
    </div>
  );
}
