"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { goSmartBack } from "@/lib/navigation/smart-back";

interface BackHeaderProps {
  title: string;
  /** Destino se não houver página anterior na app (ex.: link directo). */
  href?: string;
}

export function BackHeader({ title, href = "/" }: BackHeaderProps) {
  const t = useTranslations("common");
  const router = useRouter();

  return (
    <header className="kumbu-glass sticky top-0 z-30">
      <div className="kumbu-container flex h-14 items-center gap-2.5">
        <button
          type="button"
          className="kumbu-icon-btn"
          aria-label={t("back")}
          onClick={() => goSmartBack(router, href)}
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="line-clamp-1 flex-1 text-base font-bold tracking-tight md:text-lg">
          {title}
        </h1>
      </div>
    </header>
  );
}
