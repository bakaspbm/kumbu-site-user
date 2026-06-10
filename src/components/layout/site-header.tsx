"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Search, ShoppingCart } from "lucide-react";
import { KumbuLogo } from "@/components/brand/kumbu-logo";
import { NotificationsBellLink } from "@/components/layout/notifications-bell-link";
import { NavLanguageSwitcher } from "@/components/settings/nav-language-switcher";
import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  subtitle?: string;
  showSearch?: boolean;
  searchHref?: string;
  className?: string;
}

export function SiteHeader({
  subtitle,
  showSearch = true,
  searchHref = "/categorias",
  className,
}: SiteHeaderProps) {
  const t = useTranslations("header");
  const { count } = useCart();

  return (
    <header className={cn("kumbu-glass sticky top-0 z-40", className)}>
      <div className="kumbu-container space-y-3 py-3 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <KumbuLogo height={26} variant="image" />
            <p className="mt-0.5 truncate text-[12px] font-medium text-kumbu-muted">
              {subtitle ?? t("tagline")}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <NavLanguageSwitcher variant="codes" className="w-[7.5rem] md:hidden" />
            <Link href="/carrinho" className="kumbu-icon-btn md:hidden" aria-label={t("cartAria")}>
              <ShoppingCart className="size-[18px]" strokeWidth={1.75} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-[16px] items-center justify-center rounded-full bg-kumbu-primary px-1 text-[8px] font-bold text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
            <NotificationsBellLink />
          </div>
        </div>

        {showSearch && (
          <Link href={searchHref} className="kumbu-search-bar group">
            <span className="flex size-8 items-center justify-center rounded-lg bg-kumbu-primary-soft text-kumbu-primary">
              <Search className="size-4" strokeWidth={2} />
            </span>
            <span className="flex-1 text-[13px] font-medium text-kumbu-muted group-hover:text-kumbu-foreground">
              {t("searchPrompt")}
            </span>
            <span className="hidden rounded-lg kumbu-gradient-brand px-3 py-1.5 text-[11px] font-semibold text-white sm:inline">
              {t("searchButton")}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
