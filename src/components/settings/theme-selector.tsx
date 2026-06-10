"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import type { ThemePreference } from "@/lib/theme";

export function ThemeSelector() {
  const t = useTranslations("settings");
  const { preference, setPreference } = useTheme();

  const options: {
    value: ThemePreference;
    label: string;
    icon: typeof Sun;
  }[] = [
    { value: "system", label: t("themeSystem"), icon: Monitor },
    { value: "light", label: t("themeLight"), icon: Sun },
    { value: "dark", label: t("themeDark"), icon: Moon },
  ];

  return (
    <div
      className="grid grid-cols-3 gap-1 rounded-2xl bg-kumbu-secondary p-1"
      role="group"
      aria-label={t("themeLabel")}
    >
      {options.map(({ value, label, icon: Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setPreference(value)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs font-bold transition-all",
              active
                ? "bg-kumbu-surface text-kumbu-primary shadow-sm"
                : "text-kumbu-muted hover:text-kumbu-foreground",
            )}
          >
            <Icon className="size-4" strokeWidth={active ? 2.5 : 2} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
