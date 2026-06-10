"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner({ showStale = false }: { showStale?: boolean }) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline && !showStale) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 border-b border-amber-200/80 bg-amber-50 px-3 py-2 text-center text-xs font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <WifiOff className="size-3.5 shrink-0" aria-hidden />
      {offline
        ? "Modo offline — a mostrar dados guardados no dispositivo"
        : "A actualizar em segundo plano…"}
    </div>
  );
}
