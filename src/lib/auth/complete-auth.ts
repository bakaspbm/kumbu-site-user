import { sanitizeInternalPath } from "@/lib/auth/safe-redirect";
import { readSessionUserSnapshot } from "@/lib/kumbu-api/session-tokens";

/** Após login/registo: recarrega a página de destino para hidratar sessão a partir dos cookies. */
export function completeAuthRedirect(target: string): void {
  const path = sanitizeInternalPath(target, "/");
  if (typeof window === "undefined") return;
  window.location.assign(path);
}

export function hasBrowserSession(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("kumbu_session_present=1");
}

/** Sessão no browser: cookie de presença ou snapshot local (tokens ficam HttpOnly). */
export function hasClientSession(): boolean {
  if (typeof window === "undefined") return false;
  return hasBrowserSession() || Boolean(readSessionUserSnapshot()?.id);
}
