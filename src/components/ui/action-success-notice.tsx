"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  onDismiss?: () => void;
  dismissLabel?: string;
};

export function ActionSuccessNotice({
  title,
  message,
  actionLabel,
  actionHref,
  className,
  onDismiss,
  dismissLabel = "Continuar",
}: Props) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-4",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm font-bold text-kumbu-foreground">{title}</p>
        {message ? (
          <p className="text-sm leading-relaxed text-kumbu-muted">{message}</p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-1">
          {actionLabel && actionHref ? (
            <Button href={actionHref} className="h-9 px-4 text-sm">
              {actionLabel}
            </Button>
          ) : null}
          {onDismiss ? (
            <Button type="button" variant="secondary" className="h-9 px-4 text-sm" onClick={onDismiss}>
              {dismissLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
