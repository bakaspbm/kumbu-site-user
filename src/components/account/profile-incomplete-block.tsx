"use client";

import { AlertCircle, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { profileFieldLabel, type ProfileFieldStatus } from "@/lib/profile-completion";

interface ProfileIncompleteBlockProps {
  fields: ProfileFieldStatus[];
  title?: string;
  description?: string;
}

export function ProfileIncompleteBlock({
  fields,
  title,
  description,
}: ProfileIncompleteBlockProps) {
  const t = useTranslations("account");
  const missing = fields.filter((f) => !f.complete);

  return (
    <div className="kumbu-card-elevated mt-0 border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-kumbu-surface p-5 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-kumbu-surface">
      <div className="flex gap-3">
        <AlertCircle
          className="size-6 shrink-0 text-amber-700 dark:text-amber-300"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <h2 className="font-extrabold text-amber-950 dark:text-amber-50">
            {title ?? t("incompleteTitle")}
          </h2>
          <p className="mt-1 text-sm text-amber-900/90 dark:text-amber-100/90">
            {description ?? t("incompleteDescription")}
          </p>
          {missing.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm font-semibold text-amber-950 dark:text-amber-50">
              {missing.map((f) => (
                <li key={f.key} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-kumbu-primary" aria-hidden />
                  {profileFieldLabel(f.key, t)}
                </li>
              ))}
            </ul>
          )}
          <Button href="/conta/perfil" className="mt-4 h-11">
            <User className="size-4" />
            {t("completeProfileBtn")}
          </Button>
          <p className="mt-3 text-xs text-amber-800/80 dark:text-amber-200/80">
            {t("incompleteAfterSave")}
          </p>
        </div>
      </div>
    </div>
  );
}
