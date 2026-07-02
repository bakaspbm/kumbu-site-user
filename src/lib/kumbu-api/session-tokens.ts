import {
  bootstrapBrowserAccessToken,
  clearBrowserAccessToken,
  setBrowserAccessToken,
} from "@/lib/kumbu-api/browser-session";
import type { AuthResponse } from "@/lib/kumbu-api/auth-types";

export const ACCESS_TOKEN_COOKIE = "kumbu_access_token";
export const REFRESH_TOKEN_COOKIE = "kumbu_refresh_token";
export const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const SESSION_USER_STORAGE_KEY = "kumbu_session_user_v1";
const REFRESH_BUFFER_SECONDS = 5 * 60;

export type SessionUserSnapshot = {
  id: string;
  email?: string | null;
  displayName?: string | null;
};

let refreshPromise: Promise<AuthResponse | null> | null = null;
let lastRefreshAtMs = 0;
const REFRESH_MIN_INTERVAL_MS = 30_000;

export async function refreshSessionTokens(
  apiBaseUrl: string,
): Promise<AuthResponse | null> {
  if (typeof window !== "undefined") {
    if (refreshPromise) return refreshPromise;
    refreshPromise = (async () => {
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) return null;
        lastRefreshAtMs = Date.now();
        await bootstrapBrowserAccessToken();
        return { accessToken: "", refreshToken: "" } as AuthResponse;
      } finally {
        refreshPromise = null;
      }
    })();
    return refreshPromise;
  }

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await getStoredRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const payload = (await response.json()) as AuthResponse;
      if (!payload.accessToken || !payload.refreshToken) return null;

      await setSessionTokens(payload.accessToken, payload.refreshToken);
      lastRefreshAtMs = Date.now();
      saveSessionUserSnapshot({
        id: String(payload.userId),
        email: payload.email ?? null,
        displayName: payload.displayName ?? null,
      });
      return payload;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function decodeAccessTokenClaims(
  token: string | null | undefined,
): { userId: string; exp?: number; email?: string | null } | null {
  if (!token) return null;
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const json = JSON.parse(
      atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/")),
    ) as Record<string, unknown>;
    const userId = typeof json.sub === "string" ? json.sub : "";
    if (!userId) return null;
    const exp = typeof json.exp === "number" ? json.exp : undefined;
    const email = typeof json.email === "string" ? json.email : null;
    return { userId, exp, email };
  } catch {
    return null;
  }
}

export function isAccessTokenExpiringSoon(
  token: string | null | undefined,
  bufferSeconds = REFRESH_BUFFER_SECONDS,
): boolean {
  if (!token) return true;
  const claims = decodeAccessTokenClaims(token);
  if (!claims?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return claims.exp - now <= bufferSeconds;
}

export function readBrowserCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((part) => part.trim());
  const prefix = `${name}=`;
  for (const item of parts) {
    if (item.startsWith(prefix)) {
      return decodeURIComponent(item.slice(prefix.length));
    }
  }
  return null;
}

export async function readServerCookie(name: string): Promise<string | null> {
  if (typeof window !== "undefined") return null;
  try {
    const mod = await import("next/headers");
    const jar = await mod.cookies();
    return jar.get(name)?.value ?? null;
  } catch {
    return null;
  }
}

export async function readCookie(name: string): Promise<string | null> {
  if (typeof window !== "undefined") return readBrowserCookie(name);
  return readServerCookie(name);
}

function writeBrowserCookie(
  name: string,
  value: string,
  maxAgeSeconds = TOKEN_MAX_AGE_SECONDS,
): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function clearBrowserCookie(name: string): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

function writeSessionPresenceCookie(present: boolean): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = present
    ? `kumbu_session_present=1; Path=/; Max-Age=${TOKEN_MAX_AGE_SECONDS}; SameSite=Lax${secure}`
    : `kumbu_session_present=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export function setSessionTokensSync(accessToken: string, refreshToken?: string | null): void {
  void setSessionTokens(accessToken, refreshToken);
}

export async function setSessionTokens(
  accessToken: string,
  refreshToken?: string | null,
): Promise<void> {
  if (typeof window !== "undefined") {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: window.location.origin,
      },
      credentials: "include",
      body: JSON.stringify({ accessToken, refreshToken }),
    });
    if (!response.ok) {
      throw new Error("Falha ao guardar sessão.");
    }
    setBrowserAccessToken(accessToken);
    writeSessionPresenceCookie(true);
    return;
  }

  try {
    const mod = await import("next/headers");
    const jar = await mod.cookies();
    jar.set(ACCESS_TOKEN_COOKIE, accessToken, {
      path: "/",
      maxAge: TOKEN_MAX_AGE_SECONDS,
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    if (refreshToken) {
      jar.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        path: "/",
        maxAge: TOKEN_MAX_AGE_SECONDS,
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }
  } catch {
    /* server component context without mutable cookies */
  }
}

export async function clearSessionTokens(): Promise<void> {
  if (typeof window !== "undefined") {
    await fetch("/api/auth/session", { method: "DELETE", credentials: "include" });
    clearBrowserAccessToken();
    writeSessionPresenceCookie(false);
    clearSessionUserSnapshot();
    return;
  }

  try {
    const mod = await import("next/headers");
    const jar = await mod.cookies();
    jar.delete(ACCESS_TOKEN_COOKIE);
    jar.delete(REFRESH_TOKEN_COOKIE);
  } catch {
    /* ignore */
  }
}

export function saveSessionUserSnapshot(user: SessionUserSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* quota / private mode */
  }
}

export function readSessionUserSnapshot(): SessionUserSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionUserSnapshot;
    if (!parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSessionUserSnapshot(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_USER_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export async function getStoredRefreshToken(): Promise<string | null> {
  if (typeof window !== "undefined") return null;
  return readCookie(REFRESH_TOKEN_COOKIE);
}

export async function getStoredAccessToken(): Promise<string | null> {
  if (typeof window !== "undefined") return null;
  return readCookie(ACCESS_TOKEN_COOKIE);
}

export async function ensureFreshAccessToken(apiBaseUrl: string): Promise<string | null> {
  const accessToken = await getStoredAccessToken();
  const refreshToken = await getStoredRefreshToken();
  if (!refreshToken) return accessToken;

  const claims = decodeAccessTokenClaims(accessToken);
  const nowSec = Math.floor(Date.now() / 1000);
  const stillValid = Boolean(accessToken && claims?.exp && claims.exp > nowSec);
  const refreshedRecently = Date.now() - lastRefreshAtMs < REFRESH_MIN_INTERVAL_MS;

  if (stillValid && (!isAccessTokenExpiringSoon(accessToken) || refreshedRecently)) {
    return accessToken;
  }

  const refreshed = await refreshSessionTokens(apiBaseUrl);
  return refreshed?.accessToken ?? (await getStoredAccessToken());
}

export async function tryRefreshServerSession(apiBaseUrl: string): Promise<boolean> {
  if (typeof window !== "undefined") return false;
  const result = await refreshSessionTokens(apiBaseUrl);
  return result != null;
}
