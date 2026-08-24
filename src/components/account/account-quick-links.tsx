"use client";

import type { ReactNode } from "react";
import {
  ClipboardList,
  FileText,
  Heart,
  HelpCircle,
  Inbox,
  MapPin,
  Megaphone,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Tag,
  UserSearch,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { MenuRow } from "@/components/ui/menu-row";
import { ProfileSignOut } from "@/components/auth/profile-sign-out";
import { cn } from "@/lib/utils";

function MenuSubheading({ children, compact }: { children: ReactNode; compact?: boolean }) {
  return (
    <p
      className={cn(
        "font-semibold uppercase tracking-wider text-kumbu-muted/70",
        compact ? "px-0 pt-2 text-[9px] first:pt-0" : "px-1 pt-3 text-[10px] first:pt-0",
      )}
    >
      {children}
    </p>
  );
}
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
        <MenuSubheading compact={compact}>{t("jobsSeeker")}</MenuSubheading>
        <MenuRow href="/emprego" label={t("exploreJobs")} icon={Search} className={rowClass} />
        <MenuRow
          href="/emprego#cv-matches"
          label={t("jobsForMyCv")}
          icon={Sparkles}
          className={rowClass}
        />
        <MenuRow href="/conta/curriculos" label={t("myCvs")} icon={FileText} className={rowClass} />
        <MenuRow
          href="/conta/candidaturas"
          label={t("myApplications")}
          icon={ClipboardList}
          className={rowClass}
        />

        <MenuSubheading compact={compact}>{t("jobsHire")}</MenuSubheading>
        <MenuRow
          href="/conta/procurar-candidatos"
          label={t("searchCandidates")}
          icon={UserSearch}
          className={rowClass}
        />
        <MenuRow
          href="/conta/vagas-candidaturas"
          label={t("receivedApplications")}
          icon={Inbox}
          className={rowClass}
        />
        <MenuRow href="/publicar" label={t("publishJob")} icon={Megaphone} className={rowClass} />
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
