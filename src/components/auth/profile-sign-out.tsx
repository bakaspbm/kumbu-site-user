"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/auth-context";
import { logoutBackend } from "@/lib/kumbu-api/auth";
import { disconnectKumbuRealtime } from "@/lib/kumbu-api/kumbu-realtime";
import { cn } from "@/lib/utils";

type SignOutVariant = "card" | "row" | "nav";

interface ProfileSignOutProps {
  variant?: SignOutVariant;
  className?: string;
}

export function ProfileSignOut({ variant = "card", className }: ProfileSignOutProps) {
  const router = useRouter();
  const t = useTranslations("auth");
  const { refresh } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    if (busy) return;
    setBusy(true);
    try {
      disconnectKumbuRealtime();
      await logoutBackend();
      await refresh();
      router.replace("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (variant === "row") {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => void handleSignOut()}
        className={cn(
          "kumbu-card-interactive group flex w-full items-center gap-3 p-3.5 text-left transition-colors",
          "hover:border-red-200/80 hover:bg-red-50/60",
          className,
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white">
          <LogOut className="size-4" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1 text-[13px] font-semibold text-red-700 group-hover:text-red-800">
          {busy ? t("loading") : t("logout")}
        </span>
      </button>
    );
  }

  if (variant === "nav") {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => void handleSignOut()}
        className={cn(
          "flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-kumbu-border",
          "text-[13px] font-semibold text-kumbu-muted transition-colors",
          "hover:border-red-200 hover:bg-red-50 hover:text-red-700",
          className,
        )}
      >
        <LogOut className="size-4" />
        {busy ? t("loading") : t("logout")}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void handleSignOut()}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-xl border border-red-200/80 bg-red-50/50 px-4 py-3.5",
        "text-sm font-semibold text-red-700 transition-colors hover:bg-red-50",
        className,
      )}
    >
      <LogOut className="size-4" />
      {busy ? t("loading") : t("logout")}
    </button>
  );
}
