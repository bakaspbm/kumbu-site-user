/**
 * Valida caminhos internos para evitar open redirect (ex.: //evil.com).
 */
export function sanitizeInternalPath(
  value: string | null | undefined,
  fallback = "/",
): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  if (trimmed.includes("\0")) return fallback;
  try {
    const decoded = decodeURIComponent(trimmed);
    if (decoded.startsWith("//") || decoded.includes("\\")) return fallback;
  } catch {
    return fallback;
  }
  return trimmed;
}
