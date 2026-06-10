import { getKumbuApiBaseUrl, isKumbuApiEnabled } from "@/lib/kumbu-api/client";

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

/** Endpoint SockJS para STOMP (chat + notificações). */
export function getKumbuWsEndpoint(): string | null {
  if (!isKumbuApiEnabled()) return null;
  if (typeof window === "undefined") return null;

  const dev = process.env.NODE_ENV === "development";
  if (dev) {
    // Em localhost, liga directo ao Spring — o proxy Next quebra SockJS/WebSocket.
    if (isLoopbackHost(window.location.hostname)) {
      return "http://127.0.0.1:8080/ws/chat";
    }
    return `${window.location.origin}/ws-kumbu/chat`;
  }

  const apiBase = getKumbuApiBaseUrl();
  if (!apiBase) return null;

  try {
    const url = new URL(
      apiBase.startsWith("/") ? `${window.location.origin}${apiBase}` : apiBase,
    );
    if (isLoopbackHost(url.hostname) && !isLoopbackHost(window.location.hostname)) {
      url.hostname = window.location.hostname;
    }
    url.pathname = "/ws/chat";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}
