"use client";

import { BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className }: { className?: string }) {
  const t = useTranslations("common");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200/90",
        className,
      )}
      title={t("verifiedSeller")}
    >
      <BadgeCheck className="size-3 shrink-0" aria-hidden />
      {t("verifiedSeller")}
    </span>
  );
}
