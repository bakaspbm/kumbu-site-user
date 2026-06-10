"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { KumbuLogo } from "@/components/brand/kumbu-logo";
import { NotificationsBellLink } from "@/components/layout/notifications-bell-link";
import { NavLanguageSwitcher } from "@/components/settings/nav-language-switcher";

interface HomeHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
}

export function HomeHeader({
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
}: HomeHeaderProps) {
  const t = useTranslations("home");
  const router = useRouter();

  function goSearch() {
    const q = searchValue.trim();
    router.push(q ? `/procurar?q=${encodeURIComponent(q)}` : "/procurar");
    onSearchSubmit?.();
  }

  return (
    <header className="kumbu-glass sticky top-0 z-40">
      <div className="kumbu-container space-y-3 py-3 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <KumbuLogo height={26} variant="image" />
          <div className="flex shrink-0 items-center gap-2">
            <NavLanguageSwitcher variant="codes" className="w-[7.5rem] md:hidden" />
            <NotificationsBellLink />
          </div>
        </div>

        <div className="kumbu-search-field">
          <Search className="size-4 shrink-0 text-kumbu-primary" aria-hidden />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goSearch()}
            placeholder={t("searchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-kumbu-foreground outline-none placeholder:font-normal placeholder:text-kumbu-muted"
          />
          <button
            type="button"
            onClick={goSearch}
            className="shrink-0 rounded-lg kumbu-gradient-brand px-3 py-1.5 text-[11px] font-semibold text-white transition-all hover:brightness-[1.03] active:scale-[0.99]"
          >
            {t("searchButton")}
          </button>
        </div>
      </div>
    </header>
  );
}
