"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

interface BackHeaderProps {
  title: string;
  href?: string;
}

export function BackHeader({ title, href = "/" }: BackHeaderProps) {
  const t = useTranslations("common");

  return (
    <header className="kumbu-glass sticky top-0 z-30">
      <div className="kumbu-container flex h-14 items-center gap-2.5">
        <Link href={href} className="kumbu-icon-btn" aria-label={t("back")}>
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="line-clamp-1 flex-1 text-base font-bold tracking-tight md:text-lg">
          {title}
        </h1>
      </div>
    </header>
  );
}
