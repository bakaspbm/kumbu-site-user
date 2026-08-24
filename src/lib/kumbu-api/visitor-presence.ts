import { getKumbuApiClient } from "@/lib/kumbu-api/client";
import { getOrCreateVisitorId } from "@/lib/analytics/visitor-id";

/** Heartbeat anónimo — conta visitantes mesmo sem login. */
export async function touchVisitorPresence(): Promise<void> {
  const client = getKumbuApiClient();
  if (!client) return;
  const visitorId = getOrCreateVisitorId();
  if (!visitorId) return;
  await client.request<void>("/platform/visitor-presence", {
    method: "POST",
    auth: false,
    headers: { "X-Kumbu-Client": "web" },
    body: JSON.stringify({ visitorId, source: "web" }),
  });
}
