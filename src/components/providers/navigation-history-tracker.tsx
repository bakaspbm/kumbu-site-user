"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { markInAppNavigation } from "@/lib/navigation/smart-back";

/** Conta navegações internas na sessão para o botão Voltar usar o histórico. */
export function NavigationHistoryTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    markInAppNavigation();
  }, [pathname]);

  return null;
}
