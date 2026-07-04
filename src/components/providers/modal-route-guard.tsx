"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { resetBodyScrollLock } from "@/lib/modal/body-scroll-lock";
import { closeAllModals } from "@/lib/modal/modal-registry";

/** Garante que modais e scroll-lock não ficam presos após navegação. */
export function ModalRouteGuard() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    closeAllModals();
    resetBodyScrollLock();
  }, [pathname]);

  return null;
}
