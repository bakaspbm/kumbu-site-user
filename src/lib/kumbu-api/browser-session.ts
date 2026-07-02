let memoryAccessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

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
      const response = await fetch("/api/auth/refresh", {
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
    const response = await fetch("/api/auth/bootstrap", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      if (response.status === 401) clearBrowserAccessToken();
      return null;
    }
    const payload = (await response.json()) as { accessToken?: string };
    const token = payload.accessToken?.trim() || null;
    setBrowserAccessToken(token);
    return token;
  } catch {
    return null;
  }
}

export async function ensureBrowserAccessToken(): Promise<string | null> {
  const current = getBrowserAccessToken();
  if (current) return current;

  const bootstrapped = await bootstrapBrowserAccessToken();
  if (bootstrapped) return bootstrapped;

  const refreshed = await refreshBrowserSessionCookies();
  if (!refreshed) return null;
  return getBrowserAccessToken();
}
