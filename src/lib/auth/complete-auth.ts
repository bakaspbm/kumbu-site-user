/** Após login/registo: recarrega a página de destino para hidratar sessão a partir dos cookies. */
export function completeAuthRedirect(target: string): void {
  const path = target.startsWith("/") ? target : `/${target}`;
  if (typeof window === "undefined") return;
  window.location.assign(path);
}

export function hasBrowserSession(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("kumbu_access_token=") || document.cookie.includes("kumbu_refresh_token=");
}
