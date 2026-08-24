const STORAGE_KEY = "kumbu_visitor_id_v1";

/** ID anónimo estável no browser (sem PII). */
export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(STORAGE_KEY)?.trim();
    if (existing && /^[A-Za-z0-9_-]{8,64}$/.test(existing)) {
      return existing;
    }
    const id = crypto.randomUUID().replace(/-/g, "");
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return `tmp${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}
