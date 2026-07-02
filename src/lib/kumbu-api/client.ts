import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearSessionTokens,
  ensureFreshAccessToken,
  readBrowserCookie,
  readServerCookie,
  refreshSessionTokens,
  setSessionTokens,
} from "@/lib/kumbu-api/session-tokens";

export interface ApiClientOptions {
  baseUrl?: string;
}

export interface ApiRequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | null | undefined>;
  auth?: boolean;
  accessToken?: string | null;
  /** Evita loop ao repetir após refresh. */
  _retried?: boolean;
}

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status = 500, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

const DEFAULT_KUMBU_API_URL = "http://localhost:8080/api/v1";
/** Em dev, pedidos do browser passam pelo Next (porta 3000) — funciona no telemóvel sem abrir a 8080. */
const DEV_BROWSER_API_PROXY = "/api/kumbu";
/** Em dev, server actions falam directo com o backend na mesma máquina. */
const DEV_SERVER_API_URL = "http://127.0.0.1:8080/api/v1";

function isDevMode(): boolean {
  return process.env.NODE_ENV === "development";
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

/** No telemóvel (rede local), localhost aponta para o telemóvel — usa o IP do PC. */
function resolveApiBaseUrl(raw: string): string {
  const trimmed = trimTrailingSlash(raw);
  if (typeof window === "undefined") return trimmed;
  try {
    const url = new URL(trimmed);
    if (!isLoopbackHost(url.hostname)) return trimmed;
    if (isLoopbackHost(window.location.hostname)) return trimmed;
    url.hostname = window.location.hostname;
    return trimTrailingSlash(url.toString());
  } catch {
    return trimmed;
  }
}

function isApiUrlConfigured(): boolean {
  const value = process.env.NEXT_PUBLIC_KUMBU_API_URL ?? DEFAULT_KUMBU_API_URL;
  return value.trim().length > 0;
}

export function getKumbuApiBaseUrl(): string | null {
  if (!isApiUrlConfigured()) return null;
  if (typeof window !== "undefined") {
    return DEV_BROWSER_API_PROXY;
  }
  if (isDevMode()) {
    return DEV_SERVER_API_URL;
  }
  const raw = process.env.NEXT_PUBLIC_KUMBU_API_URL ?? DEFAULT_KUMBU_API_URL;
  return resolveApiBaseUrl(raw);
}

/** Converte URLs do backend (porta 8080) para proxy do Next em dev — fotos no telemóvel. */
export function normalizeBackendAssetUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (!isDevMode()) return trimmed;
  if (trimmed.startsWith("/backend-files/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (!parsed.pathname.startsWith("/files/")) return trimmed;
    if (
      isLoopbackHost(parsed.hostname) ||
      parsed.hostname.startsWith("192.168.") ||
      parsed.hostname.startsWith("10.")
    ) {
      return `/backend-files${parsed.pathname.slice("/files".length)}`;
    }
  } catch {
    /* ignore */
  }
  return trimmed;
}

function withQuery(url: string, query?: ApiRequestOptions["query"]): string {
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;
    params.set(key, String(value));
  }
  const encoded = params.toString();
  if (!encoded) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${encoded}`;
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function extractMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const row = payload as Record<string, unknown>;
  if (typeof row.message === "string" && row.message.trim()) return row.message.trim();
  if (typeof row.error === "string" && row.error.trim()) return row.error.trim();
  return fallback;
}

export class KumbuApiClient {
  readonly baseUrl: string;

  constructor(options?: ApiClientOptions) {
    const fallback = getKumbuApiBaseUrl();
    if (!options?.baseUrl && !fallback) {
      throw new ApiError("NEXT_PUBLIC_KUMBU_API_URL não configurado.", 500);
    }
    this.baseUrl = trimTrailingSlash(options?.baseUrl ?? (fallback as string));
  }

  getAccessToken(): string | null {
    if (typeof window !== "undefined") return null;
    return readBrowserCookie(ACCESS_TOKEN_COOKIE);
  }

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") return null;
    return readBrowserCookie(REFRESH_TOKEN_COOKIE);
  }

  setTokens(accessToken: string, refreshToken?: string | null): void {
    void setSessionTokens(accessToken, refreshToken);
  }

  clearTokens(): void {
    void clearSessionTokens();
  }

  async request<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    const useAuth = options?.auth !== false;
    let token: string | null = null;

    if (useAuth) {
      if (options?.accessToken) {
        token = options.accessToken;
      } else if (typeof window === "undefined") {
        token = await readServerCookie(ACCESS_TOKEN_COOKIE);
        if (token) {
          token = await ensureFreshAccessToken(this.baseUrl);
        }
      }
    }

    const url = withQuery(`${this.baseUrl}${path}`, options?.query);
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...options?.headers,
    };

    const hasBody = options?.body != null && !(options.body instanceof FormData);
    if (hasBody && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (token) headers.Authorization = `Bearer ${token}`;

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        credentials: typeof window !== "undefined" ? "include" : options?.credentials,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/failed to fetch|networkerror|load failed|econnrefused|econnreset|etimedout/i.test(msg)) {
        throw new ApiError(
          "Não foi possível ligar ao servidor. Verifique a ligação à internet e tente outra vez.",
          0,
        );
      }
      throw err;
    }

    if (response.status === 401 && useAuth && !options?._retried) {
      if (typeof window !== "undefined") {
        const refreshed = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (refreshed.ok) {
          return this.request<T>(path, { ...options, _retried: true });
        }
      } else {
        const refreshed = await refreshSessionTokens(this.baseUrl);
        if (refreshed?.accessToken) {
          return this.request<T>(path, { ...options, _retried: true });
        }
      }
    }

    if (response.status === 403 && useAuth && !options?._retried) {
      if (typeof window !== "undefined") {
        const refreshed = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (refreshed.ok) {
          return this.request<T>(path, { ...options, _retried: true });
        }
      } else {
        const refreshed = await refreshSessionTokens(this.baseUrl);
        if (refreshed?.accessToken) {
          return this.request<T>(path, { ...options, _retried: true });
        }
      }
    }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

    const payload = await parseJsonSafe(response);
    if (!response.ok) {
      const isProxyFailure =
        response.status >= 500 &&
        (!payload ||
          typeof payload !== "object" ||
          !("code" in (payload as Record<string, unknown>)));
      if (isProxyFailure) {
        throw new ApiError(
          "Serviço temporariamente indisponível. Tente recarregar a página.",
          0,
        );
      }
      const message = extractMessage(payload, `Erro HTTP ${response.status}`);
      throw new ApiError(message, response.status, payload);
    }
    return payload as T;
  }
}

let cachedClient: KumbuApiClient | null = null;

export function getKumbuApiClient(): KumbuApiClient | null {
  const baseUrl = getKumbuApiBaseUrl();
  if (!baseUrl) return null;
  if (!cachedClient || cachedClient.baseUrl !== baseUrl) {
    cachedClient = new KumbuApiClient({ baseUrl });
  }
  return cachedClient;
}

export function isKumbuApiEnabled(): boolean {
  return getKumbuApiBaseUrl() != null;
}

export { decodeAccessTokenClaims } from "@/lib/kumbu-api/session-tokens";
