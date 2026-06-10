"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, PlusCircle, Search, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { NavBadge } from "@/components/ui/nav-badge";
import { NavIcon } from "@/components/ui/nav-icon";
import { useMessages } from "@/contexts/messages-context";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { unreadCount } = useMessages();

  const links: {
    href: string;
    label: string;
    icon: typeof Home;
    highlight?: boolean;
  }[] = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/procurar", label: t("search"), icon: Search },
    { href: "/publicar", label: t("publish"), icon: PlusCircle, highlight: true },
    { href: "/mensagens", label: t("messages"), icon: MessageCircle },
    { href: "/conta/perfil", label: t("profile"), icon: User },
  ];

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label={t("mainMenu")}
    >
      <div className="kumbu-nav-floating pointer-events-auto mx-auto flex max-w-md items-stretch justify-around rounded-2xl px-0.5 py-1">
        {links.map(({ href, label, icon: Icon, highlight }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              prefetch
              className={cn(
                "relative flex min-w-[3rem] flex-1 flex-col items-center gap-0.5 py-1 text-[9px] font-semibold transition-colors",
                active && !highlight && "text-kumbu-primary",
                !active && !highlight && "text-kumbu-muted",
                highlight && "text-kumbu-primary",
              )}
            >
              <span
                className={cn(
                  "relative flex items-center justify-center rounded-xl transition-all duration-200",
                  highlight
                    ? "size-10 -mt-4 kumbu-gradient-brand text-white shadow-[var(--shadow-kumbu-float)] ring-[3px] ring-kumbu-secondary"
                    : "size-8",
                  active && !highlight && "bg-kumbu-primary-soft",
                )}
              >
                <NavIcon
                  icon={Icon}
                  className={highlight ? "size-[18px]" : "size-[17px]"}
                  strokeWidth={active || highlight ? 2.25 : 1.75}
                />
                {href === "/mensagens" && (
                  <NavBadge
                    count={unreadCount}
                    className="-right-1 -top-1"
                    pulse={unreadCount > 0}
                  />
                )}
              </span>
              <span className={cn("truncate px-0.5", highlight && "mt-0.5")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
