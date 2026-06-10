"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface ContaLoginPromptProps {
  title: string;
  nextPath: string;
  icon?: LucideIcon;
}

export function ContaLoginPrompt({ title, nextPath, icon: Icon }: ContaLoginPromptProps) {
  const t = useTranslations("account");
  const tAuth = useTranslations("auth");

  return (
    <div className="kumbu-card-elevated flex flex-col items-center px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-kumbu-primary-soft text-kumbu-primary">
        {Icon ? <Icon className="size-7" strokeWidth={1.75} /> : <LogIn className="size-7" />}
      </span>
      <h2 className="mt-4 text-lg font-bold text-kumbu-foreground">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-kumbu-muted">{t("loginPromptDescription")}</p>
      <Button href={`/login?next=${encodeURIComponent(nextPath)}`} className="mt-6">
        <LogIn className="size-4" />
        {tAuth("login")}
      </Button>
      <p className="mt-3 text-sm">
        <Link href="/registo" className="font-semibold text-kumbu-primary">
          {tAuth("register")}
        </Link>
      </p>
    </div>
  );
}
