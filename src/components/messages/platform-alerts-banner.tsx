"use client";

import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

type PlatformAlertsBannerProps = {
  /** Versão compacta para o topo da lista de conversas */
  compact?: boolean;
  className?: string;
};

export function PlatformAlertsBanner({
  compact = false,
  className,
}: PlatformAlertsBannerProps) {
  const { unreadNotifications } = useAuth();

  if (unreadNotifications <= 0) return null;

  const countLabel =
    unreadNotifications === 1
      ? "1 alerta por ver"
      : `${unreadNotifications} alertas por ver`;

  if (compact) {
    return (
      <Link
        href="/conta/notificacoes"
        className={cn(
          "flex items-center gap-2.5 rounded-xl border border-kumbu-primary/25 bg-kumbu-primary/5 px-3 py-2.5 transition-colors hover:border-kumbu-primary/40 hover:bg-kumbu-primary/10",
          className,
        )}
      >
        <Bell className="size-4 shrink-0 text-kumbu-primary" strokeWidth={2} />
        <span className="min-w-0 flex-1 text-sm font-semibold text-kumbu-foreground">
          {countLabel}
        </span>
        <span className="text-xs text-kumbu-muted">Encomendas, reservas…</span>
        <ChevronRight className="size-4 shrink-0 text-kumbu-muted" aria-hidden />
      </Link>
    );
  }

  return (
    <Link
      href="/conta/notificacoes"
      className={cn(
        "kumbu-card flex items-center gap-3 border-kumbu-primary/25 bg-kumbu-primary/5 p-4 transition-colors hover:border-kumbu-primary/40",
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-kumbu-primary-soft">
        <Bell className="size-5 text-kumbu-primary" />
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className="font-bold text-kumbu-foreground">{countLabel}</p>
        <p className="text-sm text-kumbu-muted">
          Encomendas, reservas, candidaturas e outras novidades — não são mensagens de
          chat.
        </p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-kumbu-muted" aria-hidden />
    </Link>
  );
}
