export const CATALOG_REFRESH_EVENT = "kumbu:catalog-refresh";

const SESSION_KEY = "kumbu_catalog_bootstrap_v1";

export function clearCatalogSessionCache(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
  }
}

export function requestCatalogRefresh(): void {
  if (typeof window === "undefined") return;
  clearCatalogSessionCache();
  window.dispatchEvent(new Event(CATALOG_REFRESH_EVENT));
}

export function onCatalogRefresh(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CATALOG_REFRESH_EVENT, listener);
  return () => window.removeEventListener(CATALOG_REFRESH_EVENT, listener);
}
