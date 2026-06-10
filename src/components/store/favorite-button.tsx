"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { FAVORITES_LOGIN_ERROR, useFavorites } from "@/hooks/use-favorites";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md";
}

export function FavoriteButton({ productId, className, size = "md" }: FavoriteButtonProps) {
  const t = useTranslations("product");
  const tErrors = useTranslations("errors");
  const formatErrorMessage = useFormatErrorMessage();
  const { isLoggedIn } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = isFavorite(productId);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await toggleFavorite(productId);
    } catch (err) {
      setError(
        err instanceof Error && err.message === FAVORITES_LOGIN_ERROR
          ? tErrors("favoritesLoginRequired")
          : formatErrorMessage(err),
      );
    } finally {
      setBusy(false);
    }
  }

  const iconSize = size === "sm" ? "size-4" : "size-5";
  const btnSize = size === "sm" ? "size-8" : "size-10";

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={(e) => void handleClick(e)}
        disabled={busy}
        aria-label={active ? t("removeFromFavorites") : t("addToFavorites")}
        title={error ?? undefined}
        className={cn(
          "flex items-center justify-center rounded-xl border border-kumbu-border bg-kumbu-surface transition-colors",
          btnSize,
          active && "border-kumbu-primary/30 bg-kumbu-primary/10 text-kumbu-primary",
          error && "border-red-300",
        )}
      >
        <Heart
          className={cn(iconSize, active && "fill-kumbu-primary text-kumbu-primary")}
        />
      </button>
    </span>
  );
}
