import { fetchWithRetry } from "./fetch-retry";

const GUARD_KEY = "__kumbuFetchGuardInstalled";

export function installFetchGuard(): void {
  if (typeof window === "undefined") return;
  const w = window as Window & { [GUARD_KEY]?: boolean };
  if (w[GUARD_KEY]) return;
  w[GUARD_KEY] = true;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) => fetchWithRetry(nativeFetch, input, init);
}
