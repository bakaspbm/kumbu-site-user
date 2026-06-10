import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { hexToCssColor } from "@/lib/utils";
import type { AppMarketingBlock } from "@/types/store";
import type { CSSProperties } from "react";

export function MarketingHero({ block }: { block: AppMarketingBlock }) {
  const from = hexToCssColor(block.gradientFrom, "#D62828");

  return (
    <div className="kumbu-container py-2 md:py-4">
      <div
        className="relative overflow-hidden rounded-[var(--radius-kumbu-xl)] shadow-[var(--shadow-kumbu-md)]"
        style={
          {
            background: `linear-gradient(135deg, ${from} 0%, color-mix(in srgb, ${from} 68%, #0f172a) 100%)`,
          } as CSSProperties
        }
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />

        <div className="relative z-10 flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="max-w-lg">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/90">
              <Sparkles className="size-3" aria-hidden />
              Marketplace Angola
            </span>
            {block.title && (
              <h2 className="mt-4 text-xl font-bold leading-snug tracking-tight text-white md:text-2xl">
                {block.title}
              </h2>
            )}
            {block.subtitle && (
              <p className="mt-2 max-w-md text-[13px] leading-relaxed text-white/75 md:text-sm">
                {block.subtitle}
              </p>
            )}
          </div>

          <Link
            href="/categorias"
            className="inline-flex h-9 w-fit shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-4 text-[13px] font-semibold text-kumbu-primary shadow-[var(--shadow-kumbu-sm)] transition-all hover:brightness-[1.02] active:scale-[0.99]"
          >
            Explorar
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
