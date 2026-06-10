"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  readStoredTheme,
  resolveTheme,
  THEME_LIGHT_MIGRATION_KEY,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "@/lib/theme";

interface ThemeContextValue {
  preference: ThemePreference;
  resolved: "light" | "dark";
  setPreference: (mode: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeClass(resolved: "light" | "dark") {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("light");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  const setPreference = useCallback((mode: ThemePreference) => {
    setPreferenceState(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    const next = resolveTheme(mode);
    setResolved(next);
    applyThemeClass(next);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(THEME_LIGHT_MIGRATION_KEY)) {
      localStorage.setItem(THEME_STORAGE_KEY, "light");
      localStorage.setItem(THEME_LIGHT_MIGRATION_KEY, "1");
    }
    const stored = readStoredTheme();
    const next = resolveTheme(stored);
    setPreferenceState(stored);
    setResolved(next);
    applyThemeClass(next);
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return ctx;
}
