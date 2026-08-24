const NAV_DEPTH_KEY = "kumbu_nav_depth";

function readDepth(): number {
  try {
    const n = Number(sessionStorage.getItem(NAV_DEPTH_KEY) ?? "0");
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

function writeDepth(value: number): void {
  try {
    sessionStorage.setItem(NAV_DEPTH_KEY, String(Math.max(0, value)));
  } catch {
    /* private mode / quota */
  }
}

/** Chamado em cada navegação interna (exceto a 1.ª entrada). */
export function markInAppNavigation(): void {
  writeDepth(readDepth() + 1);
}

function sameOriginReferrer(): boolean {
  if (typeof document === "undefined" || !document.referrer) return false;
  try {
    return new URL(document.referrer).origin === window.location.origin;
  } catch {
    return false;
  }
}

export function canGoBackInApp(): boolean {
  if (typeof window === "undefined") return false;
  if (readDepth() > 0) return true;
  return sameOriginReferrer();
}

type RouterLike = { back: () => void; push: (href: string) => void };

/** Volta ao ecrã anterior na app; se não houver histórico útil, vai ao fallback. */
export function goSmartBack(router: RouterLike, fallbackHref = "/"): void {
  if (canGoBackInApp()) {
    writeDepth(readDepth() - 1);
    router.back();
    return;
  }
  router.push(fallbackHref);
}
