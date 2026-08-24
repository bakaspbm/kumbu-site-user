import { getKumbuApiClient } from "@/lib/kumbu-api/client";
import { getOrCreateVisitorId } from "@/lib/analytics/visitor-id";

/** Regista uma visita a uma rota do site (público, sem auth). */
export async function recordPageView(path: string): Promise<void> {
  const client = getKumbuApiClient();
  if (!client) return;
  const trimmed = path?.trim();
  if (!trimmed) return;
  const visitorId = getOrCreateVisitorId();
  const body: Record<string, string> = { path: trimmed, source: "web" };
  if (visitorId) body.visitorId = visitorId;
  await client.request<void>("/platform/page-view", {
    method: "POST",
    auth: false,
    headers: { "X-Kumbu-Client": "web" },
    body: JSON.stringify(body),
  });
}
