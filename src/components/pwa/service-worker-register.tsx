"use client";

import { useEffect } from "react";

/** Service worker desactivado — causava páginas presas em cache/navegação. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const r of regs) void r.unregister();
    });
  }, []);

  return null;
}
