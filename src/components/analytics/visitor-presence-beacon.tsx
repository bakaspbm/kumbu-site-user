"use client";

import { useEffect } from "react";
import { touchVisitorPresence } from "@/lib/kumbu-api/visitor-presence";

const INTERVAL_MS = 120_000;

/** Envia presença anónima periodicamente (site, com ou sem login). */
export function VisitorPresenceBeacon() {
  useEffect(() => {
    const ping = () => {
      void touchVisitorPresence().catch(() => {});
    };
    ping();
    const interval = window.setInterval(ping, INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
