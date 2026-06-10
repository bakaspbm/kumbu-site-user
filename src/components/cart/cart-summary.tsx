"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CartSummaryProps {
  itemCount: number;
  totalLabel: string;
  onClear?: () => void;
  className?: string;
}

export function CartSummary({ itemCount, totalLabel, onClear, className }: CartSummaryProps) {
  return (
    <aside className={cn("kumbu-sticky-summary md:kumbu-card md:p-5", className)}>
      <div className="kumbu-container md:mx-0 md:max-w-none md:px-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-kumbu-muted">
              Subtotal estimado
            </p>
            <p className="text-2xl font-extrabold text-kumbu-primary">{totalLabel}</p>
            <p className="text-xs text-kumbu-muted">
              {itemCount} {itemCount === 1 ? "artigo" : "artigos"}
            </p>
          </div>
          <Button href="/checkout" className="hidden h-12 shrink-0 px-6 md:inline-flex">
            Finalizar
          </Button>
        </div>
        <div className="mt-3 flex flex-col gap-2 md:mt-5">
          <Button href="/checkout" fullWidth className="h-12 md:hidden">
            Finalizar compra
          </Button>
          {onClear && (
            <Button variant="ghost" fullWidth onClick={onClear} className="h-10 text-kumbu-muted">
              Limpar carrinho
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
