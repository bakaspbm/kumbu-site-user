"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const host = window.location.hostname;
    const isLocalHost =
      host === "localhost" ||
      host === "127.0.0.1" ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);

    if (process.env.NODE_ENV === "development" || isLocalHost) {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const r of regs) void r.unregister();
      });
      return;
    }

    void navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {
      });
  }, []);

  return null;
}
