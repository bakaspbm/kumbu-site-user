/** Remove tokens sensíveis da barra de endereço após leitura (histórico/referrer). */
export function clearSensitiveTokenFromUrl(): void {
  if (typeof window === "undefined" || !window.history.replaceState) return;
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("token")) return;
    url.searchParams.delete("token");
    const search = url.searchParams.toString();
    const next = `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
    window.history.replaceState(null, "", next);
  } catch {
    /* ignore */
  }
}
