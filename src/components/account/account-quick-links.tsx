"use client";

import type { ReactNode } from "react";
import {
  Briefcase,
  FileText,
  Heart,
  HelpCircle,
  MapPin,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tag,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { MenuRow } from "@/components/ui/menu-row";
import { ProfileSignOut } from "@/components/auth/profile-sign-out";
import { cn } from "@/lib/utils";

function MenuSection({
  title,
  children,
  className,
  compact,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <section className={cn(compact ? "mt-4 first:mt-0" : "mt-5 first:mt-4", className)}>
      <h3
        className={cn(
          "font-semibold uppercase tracking-wider text-kumbu-muted/80",
          compact ? "px-0 text-[9px]" : "px-1 text-[10px]",
        )}
      >
        {title}
      </h3>
      <div className={cn("flex flex-col", compact ? "mt-1.5 gap-1" : "mt-2 gap-2")}>
        {children}
      </div>
    </section>
  );
}

interface AccountQuickLinksProps {
  variant?: "default" | "sidebar";
}

export function AccountQuickLinks({ variant = "default" }: AccountQuickLinksProps) {
  const t = useTranslations("account");
  const compact = variant === "sidebar";
  const rowClass = compact ? "p-2.5" : undefined;

  const content = (
    <>
      <MenuSection title={t("buy")} compact={compact}>
        <MenuRow
          href="/conta/compras"
          label={t("myPurchases")}
          icon={ShoppingBag}
          className={rowClass}
        />
        <div className="md:hidden">
          <MenuRow href="/conta/favoritos" label={t("favorites")} icon={Heart} className={rowClass} />
          <MenuRow href="/carrinho" label={t("cart")} icon={ShoppingCart} className={rowClass} />
        </div>
      </MenuSection>

      <MenuSection title={t("sell")} compact={compact}>
        <MenuRow href="/conta/anuncios" label={t("myListings")} icon={Tag} className={rowClass} />
        <MenuRow href="/conta/vendas" label={t("mySales")} icon={Store} className={rowClass} />
        <MenuRow href="/conta/reservas" label={t("rentals")} icon={MapPin} className={rowClass} />
      </MenuSection>

      <MenuSection title={t("jobs")} compact={compact}>
        <MenuRow href="/emprego" label={t("exploreJobs")} icon={Briefcase} className={rowClass} />
        <MenuRow
          href="/conta/vagas-candidaturas"
          label={t("myJobListings")}
          icon={Users}
          className={rowClass}
        />
        <MenuRow href="/conta/cvs" label={t("myCvs")} icon={FileText} className={rowClass} />
        <MenuRow
          href="/conta/candidaturas"
          label={t("myApplications")}
          icon={Briefcase}
          className={rowClass}
        />
      </MenuSection>

      <MenuSection title={t("accountNav")} compact={compact}>
        <MenuRow
          href="/conta/definicoes"
          label={t("settingsPrivacy")}
          icon={Settings}
          className={rowClass}
        />
        <MenuRow href="/support" label={t("supportLegal")} icon={HelpCircle} className={rowClass} />
        <ProfileSignOut variant="row" className={rowClass} />
      </MenuSection>
    </>
  );

  if (compact) {
    return (
      <nav aria-label={t("shortcuts")} className="kumbu-card p-4">
        <h2 className="text-sm font-bold tracking-tight text-kumbu-foreground">{t("shortcuts")}</h2>
        <p className="mt-0.5 text-xs text-kumbu-muted">{t("shortcutsDesc")}</p>
        {content}
      </nav>
    );
  }

  return <nav aria-label={t("shortcuts")}>{content}</nav>;
}
