export function isCloudflareBlockBody(text: string): boolean {
  const sample = text.trim().slice(0, 800).toLowerCase();
  if (!sample) return false;
  return (
    sample.startsWith("<!doctype") ||
    sample.startsWith("<html") ||
    sample.includes("just a moment") ||
    sample.includes("cloudflare") ||
    sample.includes("challenges.cloudflare.com")
  );
}

export function sanitizeUpstreamErrorText(text: string, fallback: string): string {
  if (isCloudflareBlockBody(text)) return fallback;
  const trimmed = text.trim();
  if (!trimmed) return fallback;
  if (trimmed.length > 400) return fallback;
  return trimmed;
}
