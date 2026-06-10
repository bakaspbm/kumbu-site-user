"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Receipt, Settings, Store, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function AccountNav() {
  const pathname = usePathname();
  const t = useTranslations("account");

  const links = [
    { href: "/conta/perfil", label: t("navProfile"), icon: Settings },
    { href: "/conta/anuncios", label: t("navListings"), icon: Tag },
    { href: "/conta/compras", label: t("navPurchases"), icon: Receipt },
    { href: "/conta/vendas", label: t("navSales"), icon: Store },
  ] as const;

  return (
    <nav
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-kumbu-surface-muted/80 p-1 ring-1 ring-kumbu-border scrollbar-none"
      aria-label={t("navAriaLabel")}
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-200",
              active
                ? "bg-kumbu-surface text-kumbu-foreground shadow-[var(--shadow-kumbu-sm)] ring-1 ring-kumbu-border/80"
                : "text-kumbu-muted hover:bg-kumbu-surface/60 hover:text-kumbu-foreground",
            )}
          >
            <Icon
              className={cn("size-3.5", active ? "text-kumbu-primary" : "")}
              strokeWidth={active ? 2.25 : 1.75}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
