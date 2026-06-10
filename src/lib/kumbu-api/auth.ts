import { getKumbuApiClient, type KumbuApiClient } from "@/lib/kumbu-api/client";
import type {
  AuthResponse,
  KumbuRegisterInput,
  KumbuSession,
  KumbuSessionUser,
  RegisterBackendResult,
} from "@/lib/kumbu-api/auth-types";
import {
  clearSessionTokens,
  decodeAccessTokenClaims,
  readBrowserCookie,
  REFRESH_TOKEN_COOKIE,
  saveSessionUserSnapshot,
  setSessionTokens,
  setSessionTokensSync,
} from "@/lib/kumbu-api/session-tokens";

export type {
  AuthResponse,
  KumbuRegisterInput,
  KumbuSession,
  KumbuSessionUser,
  RegisterBackendResult,
};

function mustClient(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) {
    throw new Error("API backend não configurada.");
  }
  return client;
}

function toSession(payload: AuthResponse): KumbuSession {
  const claims = decodeAccessTokenClaims(payload.accessToken);
  const userId = payload.userId != null ? String(payload.userId) : (claims?.userId ?? "");
  if (!userId) {
    throw new Error("Resposta de login inválida (sem utilizador).");
  }
  return {
    user: {
      id: userId,
      email: payload.email ?? claims?.email ?? null,
      displayName: payload.displayName ?? null,
    },
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  };
}

function persistSession(payload: AuthResponse): void {
  if (!payload.accessToken?.trim() || !payload.refreshToken?.trim()) {
    throw new Error("Resposta de autenticação incompleta (tokens em falta).");
  }
  setSessionTokensSync(payload.accessToken, payload.refreshToken);
  const claims = decodeAccessTokenClaims(payload.accessToken);
  const userId =
    payload.userId != null ? String(payload.userId) : (claims?.userId ?? "");
  if (!userId) {
    throw new Error("Resposta de autenticação inválida (utilizador em falta).");
  }
  saveSessionUserSnapshot({
    id: userId,
    email: payload.email ?? claims?.email ?? null,
    displayName: payload.displayName ?? null,
  });
}

export async function loginWithBackend(email: string, password: string): Promise<KumbuSession> {
  const client = mustClient();
  const payload = await client.request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
    auth: false,
  });
  persistSession(payload);
  return toSession(payload);
}

export async function registerWithBackend(input: KumbuRegisterInput): Promise<RegisterBackendResult> {
  const client = mustClient();
  const payload = await client.request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: input.email.trim(),
      password: input.password,
      fullName: input.fullName.trim(),
      phone: input.phone?.trim() || null,
      signupSource: "WEB",
    }),
    auth: false,
  });
  persistSession(payload);
  return {
    session: toSession(payload),
    emailActionLink: payload.emailActionLink ?? null,
  };
}

export async function refreshBackendToken(): Promise<KumbuSession> {
  const client = mustClient();
  const refreshToken = client.getRefreshToken();
  if (!refreshToken) throw new Error("Sessão expirada. Inicie sessão novamente.");

  const payload = await client.request<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    auth: false,
  });
  persistSession(payload);
  return toSession(payload);
}

export function getBackendSession(): KumbuSession | null {
  const client = getKumbuApiClient();
  if (!client) return null;
  const accessToken = client.getAccessToken();
  const refreshToken = readBrowserCookie(REFRESH_TOKEN_COOKIE);
  if (!accessToken && !refreshToken) return null;

  const claims = decodeAccessTokenClaims(accessToken);
  const snapshotId = claims?.userId;

  return {
    user: {
      id: snapshotId ?? "",
      email: claims?.email ?? null,
      displayName: null,
    },
    accessToken: accessToken ?? "",
    refreshToken: refreshToken ?? "",
  };
}

export function logoutBackend(): void {
  const client = getKumbuApiClient();
  const refreshToken = client?.getRefreshToken();
  if (client && refreshToken) {
    void client
      .request<void>("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
        auth: false,
      })
      .catch(() => undefined);
  }
  void clearSessionTokens();
  client?.clearTokens();
}

export async function forgotPasswordBackend(email: string): Promise<string | null> {
  const client = mustClient();
  const payload = await client.request<{ emailActionLink?: string | null }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: email.trim() }),
    auth: false,
  });
  return payload.emailActionLink ?? null;
}

export async function resetPasswordBackend(token: string, password: string): Promise<void> {
  const client = mustClient();
  await client.request<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: token.trim(), password }),
    auth: false,
  });
}

export async function verifyEmailBackend(token: string): Promise<KumbuSession> {
  const client = mustClient();
  const payload = await client.request<AuthResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token: token.trim() }),
    auth: false,
  });
  persistSession(payload);
  return toSession(payload);
}

export async function resendVerificationBackend(): Promise<string | null> {
  const client = mustClient();
  const payload = await client.request<{ emailActionLink?: string | null }>("/auth/resend-verification", {
    method: "POST",
  });
  return payload.emailActionLink ?? null;
}

export async function resendVerificationEmailBackend(email: string): Promise<string | null> {
  const client = mustClient();
  const payload = await client.request<{ emailActionLink?: string | null }>(
    "/auth/resend-verification-email",
    {
      method: "POST",
      body: JSON.stringify({ email: email.trim() }),
      auth: false,
    },
  );
  return payload.emailActionLink ?? null;
}

export async function sendPhoneOtpBackend(phone: string): Promise<void> {
  const client = mustClient();
  await client.request<void>("/auth/phone/send", {
    method: "POST",
    body: JSON.stringify({ phone: phone.trim() }),
    auth: false,
  });
}

export async function verifyPhoneOtpBackend(phone: string, token: string): Promise<KumbuSession> {
  const client = mustClient();
  const payload = await client.request<AuthResponse>("/auth/phone/verify", {
    method: "POST",
    body: JSON.stringify({ phone: phone.trim(), token: token.trim() }),
    auth: false,
  });
  persistSession(payload);
  return toSession(payload);
}

export async function oauthLoginBackend(
  provider: "google" | "facebook",
  accessToken: string,
  profile?: {
    facebookId?: string;
    googleSub?: string;
    email?: string;
    name?: string;
    photoUrl?: string | null;
  },
): Promise<KumbuSession> {
  const client = mustClient();
  const payload = await client.request<AuthResponse>(`/auth/oauth/${provider}`, {
    method: "POST",
    body: JSON.stringify({
      accessToken,
      signupSource: "web",
      profile: profile
        ? {
            facebookId: profile.facebookId,
            googleSub: profile.googleSub,
            email: profile.email,
            name: profile.name,
            photoUrl: profile.photoUrl ?? undefined,
          }
        : undefined,
    }),
    auth: false,
  });
  persistSession(payload);
  return toSession(payload);
}
