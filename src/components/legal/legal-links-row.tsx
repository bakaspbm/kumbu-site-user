"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function LegalLinksRow({ className }: { className?: string }) {
  const t = useTranslations("legal");

  const links = [
    { href: "/termos", label: t("terms") },
    { href: "/privacidade", label: t("privacy") },
    { href: "/cookies", label: t("cookies") },
    { href: "/como-funciona", label: t("howItWorks") },
    { href: "/regras-publicacao", label: t("publishingRules") },
  ] as const;

  return (
    <nav
      className={
        className ??
        "flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-kumbu-muted"
      }
    >
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="hover:text-kumbu-primary">
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
