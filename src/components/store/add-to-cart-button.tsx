"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import type { CatalogProduct } from "@/types/store";

export function AddToCartButton({ product }: { product: CatalogProduct }) {
  const { addProduct } = useCart();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (product.isOutOfStock) {
    return (
      <Button fullWidth disabled variant="secondary">
        Indisponível
      </Button>
    );
  }

  return (
    <>
      <Button
        fullWidth
        className="h-13"
        onClick={() => {
          setError(null);
          if (!addProduct(product)) {
            setError("Não pode comprar o seu próprio anúncio.");
            return;
          }
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        }}
      >
        <ShoppingCart className="size-4" />
        {added ? "Adicionado!" : "Comprar — adicionar ao carrinho"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </>
  );
}
