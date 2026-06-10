export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "kumbu_theme_mode";
export const THEME_LIGHT_MIGRATION_KEY = "kumbu_theme_light_v1";

export function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "dark") return "dark";
  if (preference === "light") return "light";
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function readStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "light";
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  if (raw === "light" || raw === "dark") return raw;
  if (raw === "system") return "light";
  return "light";
}
