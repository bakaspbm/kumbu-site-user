"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { recordPageView } from "@/lib/kumbu-api/page-view";

/** Envia page-view em cada navegação do site (paths agregados na API). */
export function PageViewBeacon() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === lastSent.current) return;
    lastSent.current = pathname;
    void recordPageView(pathname).catch(() => {});
  }, [pathname]);

  return null;
}
