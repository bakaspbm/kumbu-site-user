"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CreditCard, MapPin, ShoppingBag, User } from "lucide-react";
import { BackHeader } from "@/components/layout/back-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { listPaymentMethods } from "@/lib/site-data";
import type { AppPaymentMethod } from "@/types/store";
import { groupCartBySeller } from "@/lib/cart-utils";
import { cn, parsePriceLabel } from "@/lib/utils";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tLegal = useTranslations("legal");
  const router = useRouter();
  const { isLoggedIn, storeUser, isLoading: authLoading } = useAuth();
  const { items, count, checkout, totalLabel } = useCart();
  const [paymentMethods, setPaymentMethods] = useState<AppPaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAddress = Boolean(
    storeUser?.deliveryAddress?.line1 && storeUser?.deliveryAddress?.city,
  );

  useEffect(() => {
    void (async () => {
      try {
        const methods = await listPaymentMethods();
        setPaymentMethods(methods);
        const def = methods.find((m) => m.isDefault) ?? methods[0];
        if (def) setSelectedPayment(def.id);
      } catch {
        setPaymentMethods([]);
      }
    })();
  }, []);

  const subtotal = items.reduce(
    (sum, i) => sum + parsePriceLabel(i.priceLabel) * i.quantity,
    0,
  );

  async function handlePlaceOrder() {
    setError(null);
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
      if (conversationIds.length >= 1) {
        const chat = conversationIds[0];
        if (orderIds.length > 1 || conversationIds.length > 1) {
          router.push(
            `/mensagens/${chat}?pedidos=${orderIds.length}`,
          );
        } else {
          router.push(`/mensagens/${chat}`);
        }
      } else if (orderIds.length === 1) {
        router.push(`/conta/compras/${orderIds[0]}`);
      } else {
        router.push("/conta/compras");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("orderFailed"));
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
    { icon: CreditCard, label: t("payment"), done: !!selectedPayment || paymentMethods.length === 0 },
  ] as const;

  const sellerCount = groupCartBySeller(items).size;

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

            {paymentMethods.length > 0 && (
              <div className="kumbu-card p-5">
                <h2 className="font-bold text-kumbu-foreground">{t("paymentMethod")}</h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {paymentMethods.map((m) => (
                    <li key={m.id}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-kumbu-border px-4 py-3 has-[:checked]:border-kumbu-primary has-[:checked]:bg-kumbu-primary/5">
                        <input
                          type="radio"
                          name="payment"
                          value={m.id}
                          checked={selectedPayment === m.id}
                          onChange={() => setSelectedPayment(m.id)}
                          className="accent-kumbu-primary"
                        />
                        <span className="text-sm font-semibold">{m.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2">
              {!isLoggedIn && !authLoading ? (
                <Button href="/login?next=/checkout" fullWidth className="h-12">
                  {t("loginToPay")}
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
