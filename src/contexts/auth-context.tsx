"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { hasClientSession, probeHttpOnlySession } from "@/lib/auth/complete-auth";
import { countUnreadNotificationsBackend } from "@/lib/kumbu-api/notifications";
import {
  subscribeNotificationsRealtime,
  disconnectKumbuRealtime,
  type NotificationPushEvent,
} from "@/lib/kumbu-api/notifications-realtime";
import type { KumbuSession, KumbuSessionUser } from "@/lib/kumbu-api/auth-types";
import {
  getBackendSession,
  refreshBackendToken,
} from "@/lib/kumbu-api/auth";
import { bootstrapBrowserAccessToken } from "@/lib/kumbu-api/browser-session";
import { getKumbuApiClient } from "@/lib/kumbu-api/client";
import { touchPresenceBackend } from "@/lib/kumbu-api/presence";
import {
  isAccessTokenExpiringSoon,
  readSessionUserSnapshot,
  saveSessionUserSnapshot,
} from "@/lib/kumbu-api/session-tokens";
import { getStoreUser, countUnreadMessagesForUser } from "@/lib/site-data";
import { playMessageNotificationSound } from "@/lib/chat/notification-sound";
import { promiseWithTimeoutFallback } from "@/lib/promise-timeout";
import {
  getOfflineStoreUser,
  isBrowserOnline,
  setOfflineStoreUser,
} from "@/lib/offline/store";
import {
  getProfileFieldStatuses,
  isProfileComplete,
} from "@/lib/profile-completion";
import type { ProfileFieldStatus } from "@/lib/profile-completion";
import type { StoreUser } from "@/types/store";

interface AuthContextValue {
  user: KumbuSessionUser | null;
  storeUser: StoreUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isProfileComplete: boolean;
  profileFields: ProfileFieldStatus[];
  applyStoreUser: (profile: StoreUser) => void;
  establishSession: (session: KumbuSession) => void;
  refresh: () => Promise<void>;
  unreadNotifications: number;
  unreadMessages: number;
  refreshNotifications: () => Promise<void>;
  markNotificationReadLocal: (notificationId?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<KumbuSessionUser | null>(null);
  const [storeUser, setStoreUser] = useState<StoreUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const activeUserIdRef = useRef<string | null>(null);
  const profileLoadAtRef = useRef(0);

  const applySessionUser = useCallback((u: KumbuSessionUser | null) => {
    const nextId = u?.id ?? null;
    if (activeUserIdRef.current !== nextId) {
      if (!nextId) disconnectKumbuRealtime();
      activeUserIdRef.current = nextId;
      setStoreUser(null);
      setUnreadNotifications(0);
      setUnreadMessages(0);
    }
    setUser(u);
  }, []);

  const applyStoreUser = useCallback((profile: StoreUser) => {
    if (activeUserIdRef.current && activeUserIdRef.current !== profile.id) return;
    activeUserIdRef.current = profile.id;
    setStoreUser(profile);
    void setOfflineStoreUser(profile.id, profile);
  }, []);

  const refreshNotifications = useCallback(async () => {
    const uid = activeUserIdRef.current ?? user?.id ?? storeUser?.id;
    if (!uid) {
      setUnreadNotifications(0);
      setUnreadMessages(0);
      return;
    }
    try {
      const [notifications, messages] = await promiseWithTimeoutFallback(
        Promise.all([
          countUnreadNotificationsBackend(),
          countUnreadMessagesForUser(undefined, uid),
        ]),
        10_000,
        [0, 0] as const,
      );
      setUnreadNotifications(notifications);
      setUnreadMessages(messages);
    } catch {
      /* mantém contadores actuais em falha de rede */
    }
  }, [user?.id, storeUser?.id]);

  const applyNotificationPush = useCallback((event: NotificationPushEvent) => {
    if (event.type === "sync" && event.unreadCount != null && Number.isFinite(event.unreadCount)) {
      setUnreadNotifications(Math.max(0, Number(event.unreadCount)));
    } else if (event.type === "new") {
      if (event.unreadCount != null && Number.isFinite(event.unreadCount)) {
        setUnreadNotifications(Math.max(0, Number(event.unreadCount)));
      } else {
        setUnreadNotifications((prev) => prev + 1);
      }

      const actionUrl = event.notification?.actionUrl ?? "";
      if (actionUrl.includes("/support/chat")) {
        playMessageNotificationSound();
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("kumbu:support-message", {
              detail: event.notification,
            }),
          );
        }
      }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("kumbu:notification-push", { detail: event }),
      );
    }
  }, []);

  const markNotificationReadLocal = useCallback((_notificationId?: string) => {
    setUnreadNotifications((prev) => Math.max(0, prev - 1));
  }, []);

  const loadStoreUser = useCallback(
    async (userId: string) => {
      const cached = await getOfflineStoreUser(userId);
      if (activeUserIdRef.current === userId && cached) {
        setStoreUser(cached);
      }

      if (!isBrowserOnline()) return;

      const now = Date.now();
      if (now - profileLoadAtRef.current < 8_000) return;
      profileLoadAtRef.current = now;

      const profile = await promiseWithTimeoutFallback(getStoreUser(), 14_000, null);

      if (activeUserIdRef.current !== userId) return;

      if (profile) {
        setStoreUser(profile);
        const [notifications, messages] = await promiseWithTimeoutFallback(
          Promise.all([
            countUnreadNotificationsBackend(),
            countUnreadMessagesForUser(undefined, userId),
          ]),
          10_000,
          [0, 0] as const,
        );
        setUnreadNotifications(notifications);
        setUnreadMessages(messages);
        saveSessionUserSnapshot({
          id: profile.id,
          email: profile.email,
          displayName: profile.displayName,
        });
        await setOfflineStoreUser(userId, profile);
      }
    },
    [],
  );

  const establishSession = useCallback((session: KumbuSession) => {
    applySessionUser(session.user);
    activeUserIdRef.current = session.user.id;
    saveSessionUserSnapshot(session.user);
  }, [applySessionUser]);

  const restoreSessionFromStorage = useCallback(async (): Promise<KumbuSessionUser | null> => {
    if (typeof window !== "undefined" && !hasClientSession()) {
      return null;
    }

    const session = getBackendSession();
    const snapshot = readSessionUserSnapshot();
    const userId = snapshot?.id ?? session?.user.id ?? null;
    if (!userId) return null;

    const offline = await getOfflineStoreUser(userId);
    if (offline) {
      return {
        id: offline.id,
        email: offline.email,
        displayName: offline.displayName,
      };
    }

    if (snapshot?.id === userId) {
      return {
        id: snapshot.id,
        email: snapshot.email ?? null,
        displayName: snapshot.displayName ?? null,
      };
    }

    return {
      id: userId,
      email: snapshot?.email ?? session?.user.email ?? null,
      displayName: snapshot?.displayName ?? session?.user.displayName ?? null,
    };
  }, []);

  const refresh = useCallback(async () => {
    const client = getKumbuApiClient();
    const cookieSession =
      typeof window !== "undefined" &&
      (hasClientSession() || (await probeHttpOnlySession()));
    const browserSession = cookieSession;
    const existingUserId = activeUserIdRef.current;

    if (typeof window !== "undefined" && !browserSession) {
      applySessionUser(null);
      activeUserIdRef.current = null;
      setStoreUser(null);
      setUnreadNotifications(0);
      setUnreadMessages(0);
      return;
    }

    const storedUser = await restoreSessionFromStorage();
    if (storedUser) {
      applySessionUser(storedUser);
      activeUserIdRef.current = storedUser.id;
      const offline = await getOfflineStoreUser(storedUser.id);
      if (offline) setStoreUser(offline);
    }

    if (browserSession) {
      try {
        await bootstrapBrowserAccessToken();
        await refreshBackendToken();
      } catch {
        /* tenta carregar perfil na mesma */
      }
    } else if (client) {
      const accessToken = client.getAccessToken();
      if (client.getRefreshToken() && isAccessTokenExpiringSoon(accessToken)) {
        try {
          await refreshBackendToken();
        } catch {
          /* tenta carregar perfil na mesma */
        }
      }
    }

    try {
      const profile = await promiseWithTimeoutFallback(getStoreUser(), 12_000, null);
      if (profile) {
        const authUser: KumbuSessionUser = {
          id: profile.id,
          email: profile.email,
          displayName: profile.displayName,
        };
        applySessionUser(authUser);
        activeUserIdRef.current = profile.id;
        setStoreUser(profile);
        saveSessionUserSnapshot(authUser);
        void setOfflineStoreUser(profile.id, profile);
        void refreshNotifications();
        return;
      }

      if (browserSession || storedUser || existingUserId) {
        void refreshNotifications();
        return;
      }

      applySessionUser(null);
      activeUserIdRef.current = null;
      setStoreUser(null);
      setUnreadNotifications(0);
      setUnreadMessages(0);
    } catch {
      if (browserSession || storedUser || existingUserId) return;
      applySessionUser(null);
      activeUserIdRef.current = null;
      setStoreUser(null);
    }
  }, [applySessionUser, refreshNotifications, restoreSessionFromStorage]);

  useEffect(() => {
    if (!user?.id) return;

    const keepAlive = window.setInterval(() => {
      void (async () => {
        if (!(hasClientSession() || (await probeHttpOnlySession()))) return;
        void refreshBackendToken().catch(() => {});
      })();
    }, 4 * 60_000);

    const touchPresence = () => {
      void touchPresenceBackend().catch(() => {});
    };
    touchPresence();
    const presenceInterval = window.setInterval(touchPresence, 60_000);

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      void (async () => {
        if (!(hasClientSession() || (await probeHttpOnlySession()))) return;
        void refreshBackendToken().catch(() => {});
      })();
      touchPresence();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(keepAlive);
      window.clearInterval(presenceInterval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    void refreshNotifications();

    const unsubscribe = subscribeNotificationsRealtime({
      onEvent: applyNotificationPush,
    });

    const poll = window.setInterval(() => {
      void refreshNotifications();
    }, 30_000);

    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshNotifications();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      unsubscribe();
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user?.id, refreshNotifications, applyNotificationPush]);

  useEffect(() => {
    const session = getBackendSession();
    if (!session?.user.id) return;

    const snapshot = readSessionUserSnapshot();
    applySessionUser({
      id: session.user.id,
      email: snapshot?.email ?? session.user.email ?? null,
      displayName: snapshot?.displayName ?? session.user.displayName ?? null,
    });
  }, [applySessionUser]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (typeof window !== "undefined" && (hasClientSession() || (await probeHttpOnlySession()))) {
        await bootstrapBrowserAccessToken();
      }
      await promiseWithTimeoutFallback(refresh(), 10_000, undefined);
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    if (!user?.id) return;
    void loadStoreUser(user.id);
  }, [user?.id, loadStoreUser]);

  const profileFields = useMemo(
    () => getProfileFieldStatuses(storeUser),
    [storeUser],
  );

  const value = useMemo(
    () => ({
      user,
      storeUser,
      isLoading,
      isLoggedIn: Boolean(user?.id),
      isProfileComplete: isProfileComplete(storeUser),
      applyStoreUser,
      establishSession,
      profileFields,
      refresh,
      unreadNotifications,
      unreadMessages,
      refreshNotifications,
      markNotificationReadLocal,
    }),
    [
      user,
      storeUser,
      isLoading,
      applyStoreUser,
      establishSession,
      profileFields,
      refresh,
      unreadNotifications,
      unreadMessages,
      refreshNotifications,
      markNotificationReadLocal,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
