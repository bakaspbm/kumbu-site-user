"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, MessageCircle, ShoppingBag, User } from "lucide-react";
import { BackHeader } from "@/components/layout/back-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { UserFacingErrorAlert } from "@/components/ui/user-facing-error-alert";
import { ActionSuccessNotice } from "@/components/ui/action-success-notice";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { groupCartBySeller } from "@/lib/cart-utils";
import { cn, parsePriceLabel } from "@/lib/utils";
import { useResolveUserFacingError } from "@/lib/i18n/use-format-error";
import type { UserFacingError } from "@/lib/user-facing-error";
import { errorMessagesFromTranslations } from "@/lib/i18n/error-messages";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tLegal = useTranslations("legal");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const resolveError = useResolveUserFacingError();
  const router = useRouter();
  const { isLoggedIn, storeUser, isLoading: authLoading } = useAuth();
  const { items, count, checkout, totalLabel } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ href: string; actionLabel: string } | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<UserFacingError | null>(null);

  const hasAddress = Boolean(
    storeUser?.deliveryAddress?.line1 && storeUser?.deliveryAddress?.city,
  );

  useEffect(() => {
    if (!orderSuccess) return;
    const id = window.setTimeout(() => {
      router.push(orderSuccess.href);
      router.refresh();
    }, 1800);
    return () => window.clearTimeout(id);
  }, [orderSuccess, router]);

  const subtotal = items.reduce(
    (sum, i) => sum + parsePriceLabel(i.priceLabel) * i.quantity,
    0,
  );

  async function handlePlaceOrder() {
    setSubmitError(null);
    if (!isLoggedIn) {
      router.push(`/login?next=/checkout`);
      return;
    }
    if (!hasAddress) {
      router.push("/conta/perfil");
      return;
    }
    setSubmitting(true);
    try {
      const { conversationIds, orderIds } = await checkout();
      let href = "/conta/compras";
      let actionLabel = t("successActionOrders");
      if (conversationIds.length >= 1) {
        const chat = conversationIds[0];
        href =
          orderIds.length > 1 || conversationIds.length > 1
            ? `/mensagens/${chat}?pedidos=${orderIds.length}`
            : `/mensagens/${chat}`;
        actionLabel = t("successActionChat");
      } else if (orderIds.length === 1) {
        href = `/conta/compras/${orderIds[0]}`;
        actionLabel = t("successActionOrder");
      }
      setOrderSuccess({ href, actionLabel });
    } catch (err) {
      const resolved = resolveError(err);
      const m = errorMessagesFromTranslations(tErrors);
      setSubmitError({
        title: m.orderNotCreated,
        message: resolved.message,
        action: m.orderNotCreatedAction,
        fields: resolved.fields,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <>
        <BackHeader title={t("title")} href="/carrinho" />
        <main className="kumbu-container py-8">
          <EmptyState
            icon={ShoppingBag}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            actionLabel={t("viewCart")}
            actionHref="/carrinho"
          />
        </main>
      </>
    );
  }

  const steps = [
    { icon: User, label: t("stepAccount"), done: isLoggedIn },
    { icon: MapPin, label: t("delivery"), done: hasAddress },
    { icon: MessageCircle, label: t("stepMeetup"), done: isLoggedIn && hasAddress },
  ] as const;

  const sellerCount = groupCartBySeller(items).size;

  if (orderSuccess) {
    return (
      <>
        <BackHeader title={t("title")} href="/carrinho" />
        <main className="kumbu-container py-10">
          <ActionSuccessNotice
            title={t("successTitle")}
            message={t("success")}
            actionLabel={orderSuccess.actionLabel}
            actionHref={orderSuccess.href}
            dismissLabel={tCommon("continue")}
            onDismiss={() => {
              router.push(orderSuccess.href);
              router.refresh();
            }}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <BackHeader title={t("title")} href="/carrinho" />
      <main className="kumbu-container pb-10 pt-6">
        <ol className="mb-8 flex gap-2">
          {steps.map((step) => (
            <li
              key={step.label}
              className={cn(
                "flex flex-1 flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-center",
                step.done
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-kumbu-border bg-kumbu-surface",
              )}
            >
              <step.icon
                className={cn(
                  "size-5",
                  step.done ? "text-emerald-600 dark:text-emerald-400" : "text-kumbu-muted",
                )}
              />
              <span className="text-[10px] font-bold uppercase tracking-wide text-kumbu-muted">
                {step.label}
              </span>
            </li>
          ))}
        </ol>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="space-y-4">
            <div className="kumbu-card p-5">
              <h2 className="font-bold text-kumbu-foreground">{t("itemsSummary")}</h2>
              <ul className="mt-4 divide-y divide-kumbu-border">
                {items.map((i) => (
                  <li
                    key={i.productId}
                    className="flex justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="font-semibold text-kumbu-foreground">{i.title}</span>
                      <span className="ml-1 text-kumbu-muted">× {i.quantity}</span>
                    </span>
                    <span className="shrink-0 font-bold text-kumbu-primary">{i.priceLabel}</span>
                  </li>
                ))}
              </ul>
            </div>

            {isLoggedIn && storeUser?.deliveryAddress && (
              <div className="kumbu-card p-5">
                <h2 className="font-bold text-kumbu-foreground">{t("deliveryAddress")}</h2>
                <p className="mt-2 text-sm text-kumbu-muted">
                  {storeUser.deliveryAddress.line1}
                  {storeUser.deliveryAddress.line2
                    ? `, ${storeUser.deliveryAddress.line2}`
                    : ""}
                  <br />
                  {storeUser.deliveryAddress.city}
                  {storeUser.deliveryAddress.zip ? `, ${storeUser.deliveryAddress.zip}` : ""}
                  <br />
                  {storeUser.deliveryAddress.country}
                </p>
                <Link
                  href="/conta/perfil"
                  className="mt-3 inline-block text-sm font-semibold text-kumbu-primary"
                >
                  {t("changeAddress")}
                </Link>
              </div>
            )}

            <div className="kumbu-card p-5">
              <h2 className="font-bold text-kumbu-foreground">{t("meetupTitle")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-kumbu-muted">{t("meetupDescription")}</p>
            </div>
          </section>

          <aside className="kumbu-card h-fit p-5 lg:sticky lg:top-24">
            <h2 className="font-bold text-kumbu-foreground">{tCart("total")}</h2>
            <p className="mt-2 text-3xl font-extrabold text-kumbu-primary">
              {subtotal > 0 ? totalLabel : "—"}
            </p>
            <p className="mt-1 text-xs text-kumbu-muted">
              {count} {count === 1 ? t("itemSingular") : t("itemPlural")}
            </p>

            <p className="mt-4 rounded-xl bg-kumbu-secondary/60 px-3 py-2 text-xs leading-relaxed text-kumbu-muted">
              {t("notice")}{" "}
              <Link href="/termos" className="font-semibold text-kumbu-primary">
                {tLegal("terms")}
              </Link>
            </p>

            {submitError ? (
              <UserFacingErrorAlert
                error={submitError}
                className="mt-4"
                onRetry={() => void handlePlaceOrder()}
                retryLabel={t("confirm")}
              />
            ) : null}

            {submitting ? (
              <LoadingIndicator
                active={submitting}
                label={t("placing")}
                slowHint={tCommon("loadingSlowHint")}
                className="mt-4"
                compact
              />
            ) : null}

            <div className="mt-6 flex flex-col gap-2">
              {!isLoggedIn && !authLoading ? (
                <Button href="/login?next=/checkout" fullWidth className="h-12">
                  {t("loginToCheckout")}
                </Button>
              ) : !hasAddress ? (
                <Button href="/conta/perfil" fullWidth className="h-12">
                  {t("addDeliveryAddress")}
                </Button>
              ) : (
                <Button
                  fullWidth
                  className="h-12"
                  disabled={submitting}
                  onClick={() => void handlePlaceOrder()}
                >
                  {submitting ? t("placing") : t("confirm")}
                </Button>
              )}
              {sellerCount > 1 && (
                <p className="text-xs text-kumbu-muted">
                  {t("multiOrderNotice", { count: sellerCount })}
                </p>
              )}
              <Button href="/conta/perfil" variant="secondary" fullWidth className="h-11">
                {t("deliveryAddress")}
              </Button>
              <Link
                href="/carrinho"
                className="mt-1 text-center text-sm font-semibold text-kumbu-muted hover:text-kumbu-primary"
              >
                {t("backToCart")}
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
