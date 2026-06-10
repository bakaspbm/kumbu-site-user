"use client";

import { ShoppingCart } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyState } from "@/components/ui/empty-state";
import { useCart } from "@/contexts/cart-context";
import { parsePriceLabel } from "@/lib/utils";

function formatTotal(total: number) {
  if (total <= 0) return "—";
  return `${total.toLocaleString("pt-AO")} Kz`;
}

export default function CartPage() {
  const { items, setQuantity, removeProduct, clear, count } = useCart();

  const subtotal = items.reduce(
    (sum, i) => sum + parsePriceLabel(i.priceLabel) * i.quantity,
    0,
  );

  return (
    <>
      <SiteHeader subtitle="O seu carrinho" showSearch={false} />
      <main className="kumbu-container pb-36 md:pb-10">
        {items.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={ShoppingCart}
            title="Carrinho vazio"
            description="Explore categorias e adicione produtos. O carrinho sincroniza quando inicia sessão."
            actionLabel="Explorar produtos"
            actionHref="/search"
          />
        ) : (
          <div className="mt-4 md:grid md:grid-cols-[1fr_320px] md:items-start md:gap-8">
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
