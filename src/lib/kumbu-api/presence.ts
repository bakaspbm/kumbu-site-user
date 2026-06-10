import { getKumbuApiClient, type KumbuApiClient } from "@/lib/kumbu-api/client";

function clientOrThrow(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  return client;
}

/** Actualiza last_seen_at do utilizador actual (heartbeat). */
export async function touchPresenceBackend(): Promise<void> {
  const client = clientOrThrow();
  await client.request<void>("/users/me/presence", { method: "POST" });
}
