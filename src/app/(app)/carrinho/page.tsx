"use client";

import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { SiteHeader } from "@/components/layout/site-header";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyState } from "@/components/ui/empty-state";
import { UserFacingErrorAlert } from "@/components/ui/user-facing-error-alert";
import { useCart } from "@/contexts/cart-context";
import { groupCartBySeller } from "@/lib/cart-utils";
import { parsePriceLabel } from "@/lib/utils";

function formatTotal(total: number) {
  if (total <= 0) return "—";
  return `${total.toLocaleString("pt-AO")} Kz`;
}

export default function CarrinhoPage() {
  const t = useTranslations("cart");
  const { items, setQuantity, removeProduct, clear, count, syncError } = useCart();
  const sellerGroups = groupCartBySeller(items);

  const subtotal = items.reduce(
    (sum, i) => sum + parsePriceLabel(i.priceLabel) * i.quantity,
    0,
  );

  return (
    <>
      <SiteHeader subtitle={t("subtitle")} showSearch={false} />
      <main className="kumbu-container pb-36 md:pb-10">
        {items.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={ShoppingCart}
            title={t("empty")}
            description={t("emptyDescription")}
            actionLabel={t("exploreListings")}
            actionHref="/categorias"
          />
        ) : (
          <div className="mt-4 md:grid md:grid-cols-[1fr_320px] md:items-start md:gap-8">
            {syncError ? (
              <UserFacingErrorAlert
                error={syncError}
                className="md:col-span-2"
              />
            ) : null}
            <div className="space-y-4">
              {sellerGroups.size > 1 && (
                <p className="rounded-xl bg-kumbu-secondary px-4 py-3 text-sm text-kumbu-muted">
                  {t("multiSellerNotice", { count: sellerGroups.size })}
                </p>
              )}
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <CartLineItem
                    key={item.productId}
                    item={item}
                    onDecrease={() => setQuantity(item.productId, item.quantity - 1)}
                    onIncrease={() => setQuantity(item.productId, item.quantity + 1)}
                    onRemove={() => removeProduct(item.productId)}
                  />
                ))}
              </ul>
            </div>

            <CartSummary
              itemCount={count}
              totalLabel={formatTotal(subtotal)}
              onClear={clear}
              className="md:sticky md:top-24"
            />
          </div>
        )}
      </main>
    </>
  );
}
