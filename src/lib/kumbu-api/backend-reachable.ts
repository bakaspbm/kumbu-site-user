import { getKumbuApiClient } from "@/lib/kumbu-api/client";

/** Verifica se a API responde (endpoint público leve, mesmo caminho que o login usa). */
export async function checkBackendReachable(): Promise<boolean> {
  const client = getKumbuApiClient();
  if (!client) return false;
  try {
    await client.request("/auth/oauth/config", { auth: false });
    return true;
  } catch {
    return false;
  }
}
