"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type LiveStatus = "off" | "connecting" | "live" | "polling";

interface LiveSyncContextValue {
  catalogLive: LiveStatus;
}

const LiveSyncContext = createContext<LiveSyncContextValue>({
  catalogLive: "off",
});

export function LiveSyncProvider({ children }: { children: ReactNode }) {
  const [catalogLive] = useState<LiveStatus>("polling");

  const value = useMemo(() => ({ catalogLive }), [catalogLive]);

  return (
    <LiveSyncContext.Provider value={value}>{children}</LiveSyncContext.Provider>
  );
}

export function useLiveSync() {
  return useContext(LiveSyncContext);
}
