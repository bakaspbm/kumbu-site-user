"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const TAB_ROUTES = [
  "/",
  "/procurar",
  "/categorias",
  "/publicar",
  "/mensagens",
  "/conta/perfil",
  "/conta/anuncios",
  "/conta/favoritos",
  "/emprego",
  "/conta/cvs",
];

const ACCOUNT_LIGHT_ROUTES = ["/", "/mensagens", "/procurar"];

export function RoutePrefetch() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;

    const routes = pathname.startsWith("/conta")
      ? ACCOUNT_LIGHT_ROUTES
      : TAB_ROUTES;

    let cancelled = false;
    const timers: number[] = [];

    const schedule = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };

    schedule(() => {
      if (cancelled) return;
      routes.forEach((href, index) => {
        schedule(() => {
          if (cancelled) return;
          try {
            router.prefetch(href);
          } catch {
          }
        }, index * 250);
      });
    }, 600);

    return () => {
      cancelled = true;
      for (const id of timers) window.clearTimeout(id);
    };
  }, [router, pathname]);

  return null;
}
