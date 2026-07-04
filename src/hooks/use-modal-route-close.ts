"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { registerModalClose } from "@/lib/modal/modal-registry";

/** Fecha o modal ao mudar de rota e regista-o para fecho global. */
export function useModalRouteClose(open: boolean, onClose: () => void) {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    return registerModalClose(() => onCloseRef.current());
  }, [open]);

  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    if (open) onCloseRef.current();
  }, [pathname, open]);
}
