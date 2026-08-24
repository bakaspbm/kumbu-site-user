const NAV_STACK_KEY = "kumbu_nav_stack";

function normalizePath(path: string): string {
  const p = path.trim() || "/";
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

function readStack(): string[] {
  try {
    const raw = sessionStorage.getItem(NAV_STACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is string => typeof p === "string").map(normalizePath);
  } catch {
    return [];
  }
}

function writeStack(stack: string[]): void {
  try {
    sessionStorage.setItem(NAV_STACK_KEY, JSON.stringify(stack.slice(-40)));
  } catch {
    /* private mode / quota */
  }
}

/** Sincroniza a pilha com o pathname actual (push, replace ou browser-back). */
export function recordInAppPath(pathname: string): void {
  const path = normalizePath(pathname);
  const stack = readStack();
  if (stack[stack.length - 1] === path) return;
  if (stack.length >= 2 && stack[stack.length - 2] === path) {
    writeStack(stack.slice(0, -1));
    return;
  }
  writeStack([...stack, path]);
}

type BackHandler = () => boolean;
const backHandlers: BackHandler[] = [];

/** Passos locais (formulário, onboarding). Devolve true se consumiu o voltar. */
export function registerBackHandler(handler: BackHandler): () => void {
  backHandlers.push(handler);
  return () => {
    const i = backHandlers.lastIndexOf(handler);
    if (i >= 0) backHandlers.splice(i, 1);
  };
}

function consumeBackHandler(): boolean {
  for (let i = backHandlers.length - 1; i >= 0; i--) {
    if (backHandlers[i]()) return true;
  }
  return false;
}

type RouterLike = { replace: (href: string) => void };

/**
 * Volta um ecrã na app. Nunca usa history.back() — em WebViews isso
 * saltava para o site anterior (Instagram, Google) de uma vez.
 */
export function goSmartBack(router: RouterLike, fallbackHref = "/"): void {
  if (consumeBackHandler()) return;

  const fallback = normalizePath(fallbackHref);
  const stack = readStack();
  const current = stack[stack.length - 1];
  const prev = stack.length >= 2 ? stack[stack.length - 2] : null;

  if (prev && prev !== current) {
    writeStack(stack.slice(0, -1));
    router.replace(prev);
    return;
  }

  if (current === fallback) return;
  writeStack([fallback]);
  router.replace(fallback);
}
