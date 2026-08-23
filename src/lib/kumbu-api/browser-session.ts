let memoryAccessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

const AUTH_FETCH_TIMEOUT_MS = 8_000;
const REFRESH_BUFFER_SECONDS = 5 * 60;

function isTokenExpiringSoon(token: string | null | undefined): boolean {
  if (!token) return true;
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return true;
    const json = JSON.parse(
      atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/")),
    ) as Record<string, unknown>;
    const exp = typeof json.exp === "number" ? json.exp : null;
    if (exp == null) return true;
    return exp - Math.floor(Date.now() / 1000) <= REFRESH_BUFFER_SECONDS;
  } catch {
    return true;
  }
}

async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AUTH_FETCH_TIMEOUT_MS);
  const headers = new Headers(init.headers ?? {});
  if (!headers.has("X-Kumbu-Client")) {
    headers.set("X-Kumbu-Client", "web");
  }
  try {
    return await fetch(input, {
      ...init,
      headers,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export function setBrowserAccessToken(token: string | null | undefined): void {
  memoryAccessToken = token?.trim() || null;
}

export function getBrowserAccessToken(): string | null {
  return memoryAccessToken;
}

export function clearBrowserAccessToken(): void {
  memoryAccessToken = null;
}

/** Renova cookies HttpOnly — um único pedido em voo (evita rotação/revogação em cascata). */
export async function refreshBrowserSessionCookies(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const response = await authFetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) return false;
      await bootstrapBrowserAccessToken();
      return Boolean(getBrowserAccessToken());
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/** Obtém access token do servidor (lê cookies HttpOnly) para pedidos autenticados no browser. */
export async function bootstrapBrowserAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const response = await authFetch("/api/auth/bootstrap", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      if (response.status === 401) clearBrowserAccessToken();
      return null;
    }
    const payload = (await response.json().catch(() => null)) as {
      accessToken?: string;
    } | null;
    const token = payload?.accessToken?.trim() || null;
    setBrowserAccessToken(token);
    return token;
  } catch {
    return null;
  }
}

/** Garante token válido; renova proactivamente se expira em ≤5 min (JWT ~15 min). */
export async function ensureBrowserAccessToken(): Promise<string | null> {
  const current = getBrowserAccessToken();
  if (current && !isTokenExpiringSoon(current)) {
    return current;
  }

  const bootstrapped = await bootstrapBrowserAccessToken();
  const afterBootstrap = getBrowserAccessToken();
  if (afterBootstrap && !isTokenExpiringSoon(afterBootstrap)) {
    return afterBootstrap;
  }

  const refreshed = await refreshBrowserSessionCookies();
  if (refreshed) {
    return getBrowserAccessToken();
  }

  return afterBootstrap ?? current;
}
