"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";

export function MultiAccountHint() {
  const { user } = useAuth();
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!user) return;
    let hideTimer: number | undefined;

    const onStorage = (e: StorageEvent) => {
      if (!e.key?.includes("auth-token")) return;
      setFlash(true);
      if (hideTimer) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setFlash(false), 6000);
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [user]);

  if (!flash) return null;

  return (
    <div
      role="status"
      className="fixed left-3 right-3 top-3 z-[100] mx-auto max-w-lg rounded-xl border border-kumbu-border bg-kumbu-surface px-4 py-3 text-center text-[13px] shadow-[var(--shadow-kumbu-md)] md:left-auto md:right-6"
    >
      <span className="font-semibold text-kumbu-foreground">Sessão actualizada.</span>{" "}
      <span className="text-kumbu-muted">
        Para usar duas contas em simultâneo, use janelas anónimas ou browsers diferentes.
      </span>
    </div>
  );
}
