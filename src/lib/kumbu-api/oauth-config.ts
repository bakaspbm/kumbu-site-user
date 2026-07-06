import { getKumbuApiClient } from "@/lib/kumbu-api/client";

export type OAuthPublicConfig = {
  googleEnabled: boolean;
  facebookEnabled: boolean;
  phoneAuthEnabled: boolean;
  googleClientId: string | null;
  facebookAppId: string | null;
};

const EMPTY_CONFIG: OAuthPublicConfig = {
  googleEnabled: false,
  facebookEnabled: false,
  phoneAuthEnabled: false,
  googleClientId: null,
  facebookAppId: null,
};

export async function fetchOAuthPublicConfig(): Promise<OAuthPublicConfig> {
  const client = getKumbuApiClient();
  if (!client) {
    return EMPTY_CONFIG;
  }

  try {
    const row = await client.request<{
      googleEnabled?: boolean;
      facebookEnabled?: boolean;
      phoneAuthEnabled?: boolean;
      googleClientId?: string | null;
      facebookAppId?: string | null;
    }>("/auth/oauth/config", { auth: false });

    return {
      googleEnabled: Boolean(row.googleEnabled),
      facebookEnabled: Boolean(row.facebookEnabled),
      phoneAuthEnabled: Boolean(row.phoneAuthEnabled),
      googleClientId: row.googleClientId?.trim() || null,
      facebookAppId: row.facebookAppId?.trim() || null,
    };
  } catch {
    return EMPTY_CONFIG;
  }
}
