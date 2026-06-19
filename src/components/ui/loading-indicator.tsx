"use client";

import { Loader2 } from "lucide-react";
import { useLoadingPhase } from "@/hooks/use-loading-phase";
import { cn } from "@/lib/utils";

type Props = {
  active: boolean;
  /** Mensagem principal (ex.: «A guardar…»). Aparece após ~5s. */
  label?: string;
  /** Mensagens que rodam após ~5s para mostrar progresso. */
  rotatingLabels?: string[];
  /** Texto quando passa de 10s (barra de progresso). */
  slowHint?: string;
  className?: string;
  compact?: boolean;
};

export function LoadingIndicator({
  active,
  label,
  rotatingLabels = [],
  slowHint,
  className,
  compact = false,
}: Props) {
  const { phase, rotateIndex, visible } = useLoadingPhase(active);

  if (!visible) return null;

  const displayLabel =
    phase === "rotating" && rotatingLabels.length > 0
      ? rotatingLabels[rotateIndex % rotatingLabels.length]
      : label;

  const showText = phase === "rotating" || phase === "progress";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-kumbu-primary/20 bg-kumbu-primary/5 px-4 py-3.5",
        compact && "px-3 py-2.5",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {phase !== "progress" ? (
        <Loader2
          className={cn("shrink-0 animate-spin text-kumbu-primary", compact ? "size-4 mt-0.5" : "size-5 mt-0.5")}
          aria-hidden
        />
      ) : null}
      <div className="min-w-0 flex-1 space-y-2">
        {showText && displayLabel ? (
          <p className={cn("font-semibold text-kumbu-foreground", compact ? "text-xs" : "text-sm")}>
            {displayLabel}
          </p>
        ) : null}
        {phase === "progress" ? (
          <>
            {label && displayLabel !== label ? (
              <p className="text-xs text-kumbu-muted">{label}</p>
            ) : null}
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-kumbu-border"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={label ?? "A processar"}
            >
              <div className="h-full w-1/3 animate-[kumbu-indeterminate_1.4s_ease-in-out_infinite] rounded-full bg-kumbu-primary" />
            </div>
            {slowHint ? (
              <p className="text-xs leading-relaxed text-kumbu-muted">{slowHint}</p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
