"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { recordInAppPath, registerBackHandler } from "@/lib/navigation/smart-back";

/** Guarda a pilha de rotas internas para o botão Voltar não sair da app. */
export function NavigationHistoryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    recordInAppPath(pathname);
  }, [pathname]);

  return null;
}

/** Intercepta o voltar do header enquanto houver um passo local (wizard). */
export function useRegisterBackHandler(handler: () => boolean, enabled = true): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;
    return registerBackHandler(() => handlerRef.current());
  }, [enabled]);
}
