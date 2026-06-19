"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";
import { isKumbuApiEnabled } from "@/lib/kumbu-api/client";
import {
  getMonetizationCatalogBackend,
  initiateMonetizationPaymentBackend,
  listPaymentProvidersBackend,
  submitPaymentProofBackend,
  type MonetizationPayment,
  type MonetizationProduct,
  type PaymentProvider,
} from "@/lib/kumbu-api/monetization";
import { uploadListingImageBackend } from "@/lib/kumbu-api/files";

function isVipProduct(product: MonetizationProduct): boolean {
  return (product.featureType ?? "").toUpperCase() === "VIP_PLAN";
}

type Props = {
  categoryId?: string | null;
  /** Texto extra quando o limite de anúncios bloqueou a publicação */
  limitReached?: boolean;
};

export function VipUpgradePanel({ categoryId, limitReached = false }: Props) {
  const t = useTranslations("monetization");
  const tCommon = useTranslations("common");
  const formatErrorMessage = useFormatErrorMessage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<MonetizationProduct[]>([]);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [chargingEnabled, setChargingEnabled] = useState(false);
  const [chargingMessage, setChargingMessage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MonetizationProduct | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [payment, setPayment] = useState<MonetizationPayment | null>(null);
  const [proofNote, setProofNote] = useState("");
  const [proofBusy, setProofBusy] = useState(false);

  const resetPayment = useCallback(() => {
    setPayment(null);
    setProofNote("");
  }, []);

  useEffect(() => {
    if (!isKumbuApiEnabled()) {
      setError(t("apiRequired"));
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [catalog, provs] = await Promise.all([
          getMonetizationCatalogBackend(categoryId ?? undefined),
          listPaymentProvidersBackend(),
        ]);
        if (cancelled) return;
        const vipPlans = catalog.products.filter(
          (p) => p.active !== false && isVipProduct(p),
        );
        setProducts(vipPlans);
        setChargingEnabled(catalog.chargingEnabled);
        setChargingMessage(catalog.chargingMessage ?? null);
        setProviders(provs);
      } catch (err) {
        if (!cancelled) setError(formatErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryId, formatErrorMessage, t]);

  async function handleInitiatePayment() {
    if (!selectedProduct || !selectedProvider) return;
    setLoading(true);
    setError(null);
    try {
      const row = await initiateMonetizationPaymentBackend({
        productId: selectedProduct.id,
        providerId: selectedProvider.id,
        targetType: "account",
      });
      setPayment(row);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleProofFile(file: File | null) {
    if (!file || !payment) return;
    setProofBusy(true);
    setError(null);
    try {
      const url = await uploadListingImageBackend(file);
      const updated = await submitPaymentProofBackend(
        payment.id,
        url,
        proofNote.trim() || undefined,
      );
      setPayment(updated);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setProofBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {limitReached ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">{t("vipLimitTitle")}</p>
          <p className="mt-1">{t("vipLimitDescription")}</p>
        </div>
      ) : (
        <p className="text-sm text-kumbu-muted">{t("vipDescription")}</p>
      )}

      {loading && !payment ? (
        <LoadingIndicator
          active={loading}
          label={t("loadingOptions")}
          slowHint={tCommon("loadingSlowHint")}
          compact
        />
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {!chargingEnabled && !payment ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {chargingMessage ?? t("monetizationInactive")}
        </p>
      ) : null}

      {!payment && chargingEnabled ? (
        <>
          <p className="text-sm font-semibold text-kumbu-ink">{t("vipPlanLabel")}</p>
          <div className="space-y-2">
            {products.length === 0 ? (
              <p className="text-sm text-kumbu-muted">{t("noVipPlans")}</p>
            ) : (
              products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProduct(p)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    selectedProduct?.id === p.id
                      ? "border-kumbu-primary bg-kumbu-primary/5"
                      : "border-kumbu-border hover:border-kumbu-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-kumbu-ink">
                    <Crown className="h-4 w-4 text-kumbu-primary" />
                    {p.name}
                  </div>
                  {p.description ? (
                    <p className="mt-1 text-sm text-kumbu-muted">{p.description}</p>
                  ) : null}
                  <p className="mt-1 text-sm font-medium text-kumbu-primary">
                    {p.priceLabel ?? (p.priceAmount != null ? `${p.priceAmount} Kz` : "—")}
                    {p.durationDays ? t("durationDays", { days: p.durationDays }) : ""}
                  </p>
                </button>
              ))
            )}
          </div>

          <p className="mb-2 mt-4 text-sm font-semibold text-kumbu-ink">
            {t("paymentMethodLabel")}
          </p>
          <div className="space-y-2">
            {providers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProvider(p)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                  selectedProvider?.id === p.id
                    ? "border-kumbu-primary bg-kumbu-primary/5"
                    : "border-kumbu-border"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <Button
            className="mt-4 w-full"
            disabled={!selectedProduct || !selectedProvider || loading}
            onClick={() => void handleInitiatePayment()}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {t("continuePayment")}
          </Button>
        </>
      ) : null}

      {payment ? (
        <div className="space-y-3 text-sm">
          <p className="font-semibold text-kumbu-ink">
            {t("paymentStatus", { status: payment.status })}
            {payment.amountLabel ? ` · ${payment.amountLabel}` : ""}
          </p>
          {payment.instructions ? (
            <pre className="whitespace-pre-wrap rounded-lg bg-kumbu-surface p-3 text-kumbu-ink">
              {payment.instructions}
            </pre>
          ) : null}
          {payment.proofUrl ? (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-green-800">
              {t("proofSubmittedNotice")}
            </p>
          ) : (
            <>
              <label className="block text-kumbu-muted">
                {t("referenceOptional")}
                <input
                  className="mt-1 w-full rounded-lg border border-kumbu-border px-3 py-2"
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-kumbu-muted">{t("proofLabel")}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="mt-1 block w-full text-sm"
                  disabled={proofBusy}
                  onChange={(e) => void handleProofFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </>
          )}
          <Button variant="outline" className="w-full" onClick={resetPayment}>
            {t("chooseAnotherPlan")}
          </Button>
        </div>
      ) : null}

      <p className="text-xs text-kumbu-muted">
        {t("vipAfterPayment")}{" "}
        <Link href="/conta/pagamentos" className="font-semibold text-kumbu-primary hover:underline">
          {t("paymentsHistoryLink")}
        </Link>
      </p>
    </div>
  );
}
