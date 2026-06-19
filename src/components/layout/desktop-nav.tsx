"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Home,
  LogIn,
  MessageCircle,
  PlusCircle,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { KumbuLogo } from "@/components/brand/kumbu-logo";
import { NavIcon } from "@/components/ui/nav-icon";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useMessages } from "@/contexts/messages-context";
import { NavLanguageSwitcher } from "@/components/settings/nav-language-switcher";
import { ProfileSignOut } from "@/components/auth/profile-sign-out";

export function DesktopNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { count } = useCart();
  const { isLoggedIn } = useAuth();
  const { unreadCount } = useMessages();

  const mainLinks: {
    href: string;
    label: string;
    icon: typeof Home;
  }[] = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/procurar", label: t("search"), icon: Search },
    { href: "/publicar", label: t("publish"), icon: PlusCircle },
    { href: "/mensagens", label: t("messages"), icon: MessageCircle },
    { href: "/conta/perfil", label: t("profile"), icon: User },
  ];

  const extraLinks: { href: string; label: string; icon: typeof Heart }[] = [
    { href: "/conta/favoritos", label: t("favorites"), icon: Heart },
    { href: "/carrinho", label: t("cart"), icon: ShoppingCart },
  ];

  return (
    <aside className="hidden w-[240px] shrink-0 border-r border-kumbu-border bg-kumbu-surface xl:w-[252px] md:flex md:flex-col">
      <div className="flex h-full flex-col p-5">
        <KumbuLogo height={28} variant="image" href="/" />
        <p className="mt-2 text-[11px] font-medium text-kumbu-muted">Marketplace Angola</p>

        <NavLanguageSwitcher className="mt-4" variant="labels" />

        <nav className="mt-6 flex flex-1 flex-col gap-0.5" aria-label={t("mainMenu")}>
          {mainLinks.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                prefetch
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors",
                  active
                    ? "bg-kumbu-primary text-white shadow-[var(--shadow-kumbu-xs)]"
                    : "text-kumbu-muted hover:bg-kumbu-secondary hover:text-kumbu-foreground",
                )}
              >
                <span className="relative shrink-0">
                  <NavIcon
                    icon={Icon}
                    className="size-4 shrink-0"
                    strokeWidth={active ? 2.25 : 1.75}
                  />
                  {href === "/mensagens" && unreadCount > 0 && (
                    <span
                      className={cn(
                        "absolute -right-1 -top-1 size-2 rounded-full ring-2",
                        active
                          ? "bg-white ring-kumbu-primary"
                          : "bg-kumbu-primary ring-kumbu-surface",
                      )}
                      aria-hidden
                    />
                  )}
                </span>
                <span className="flex-1">{label}</span>
                {href === "/mensagens" && unreadCount > 0 && (
                  <span
                    className={cn(
                      "min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[9px] font-bold",
                      active
                        ? "bg-white text-kumbu-primary"
                        : "bg-kumbu-primary text-white",
                    )}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          <p className="mb-1.5 mt-6 px-3 text-[10px] font-semibold uppercase tracking-wider text-kumbu-muted/70">
            {t("shopping")}
          </p>
          {extraLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            const isCart = href === "/carrinho";
            return (
              <Link
                key={href}
                href={href}
                prefetch
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-kumbu-primary-soft text-kumbu-primary"
                    : "text-kumbu-muted hover:bg-kumbu-secondary hover:text-kumbu-foreground",
                )}
              >
                <NavIcon icon={Icon} className="size-4 shrink-0" strokeWidth={1.75} />
                <span className="flex-1">{label}</span>
                {isCart && count > 0 && (
                  <span className="min-w-[1.125rem] rounded-full bg-kumbu-primary px-1.5 py-0.5 text-center text-[9px] font-bold text-white">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {!isLoggedIn ? (
          <Link
            href="/login"
            className="flex h-10 items-center justify-center gap-2 rounded-xl kumbu-gradient-brand text-[13px] font-semibold text-white shadow-[var(--shadow-kumbu-xs)] transition-all hover:brightness-[1.02] active:scale-[0.99]"
          >
            <NavIcon icon={LogIn} className="size-4" />
            {t("login")}
          </Link>
        ) : (
          <ProfileSignOut variant="nav" />
        )}
      </div>
    </aside>
  );
}
