"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const KEY = "kumbu_onboarding_done";
const CHECKED_KEY = "kumbu_onboarding_checked";

export function OnboardingRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") || params.get("error_code")) return;
    try {
      if (sessionStorage.getItem(CHECKED_KEY)) return;
      sessionStorage.setItem(CHECKED_KEY, "1");
      if (!localStorage.getItem(KEY)) {
        router.replace("/onboarding");
      }
    } catch {
    }
  }, [pathname, router]);

  return null;
}
