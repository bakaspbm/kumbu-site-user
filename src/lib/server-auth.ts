import { getKumbuApiBaseUrl } from "@/lib/kumbu-api/client";
import { getStoreUserBackend } from "@/lib/kumbu-api/store";
import {
  getStoredRefreshToken,
  tryRefreshServerSession,
} from "@/lib/kumbu-api/session-tokens";

export async function getServerSessionUserId(): Promise<string | null> {
  try {
    const profile = await getStoreUserBackend();
    if (profile?.id) return profile.id;
  } catch {
    /* token expirado ou rede */
  }

  const refreshToken = await getStoredRefreshToken();
  const baseUrl = getKumbuApiBaseUrl();
  if (refreshToken && baseUrl) {
    const refreshed = await tryRefreshServerSession(baseUrl);
    if (refreshed) {
      try {
        const profile = await getStoreUserBackend();
        return profile?.id ?? null;
      } catch {
        return null;
      }
    }
  }

  return null;
}
