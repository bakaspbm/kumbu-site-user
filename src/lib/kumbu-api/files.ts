import {
  ensureBrowserAccessToken,
  refreshBrowserSessionCookies,
} from "@/lib/kumbu-api/browser-session";
import { ApiError, getKumbuApiClient, type KumbuApiClient } from "@/lib/kumbu-api/client";

type UploadUrlDto = {
  url?: string | null;
};

function clientOrThrow(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  return client;
}

function directApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_KUMBU_API_URL?.trim();
  if (!raw) throw new ApiError("API backend não configurada.", 500);
  return raw.replace(/\/+$/, "");
}

function extractUploadMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const row = payload as Record<string, unknown>;
  if (typeof row.message === "string" && row.message.trim()) return row.message.trim();
  return fallback;
}

/** Vídeos/ficheiros grandes: browser → API directo (evita limite ~4,5 MB do proxy Vercel). */
async function uploadMultipartDirect(path: string, file: File): Promise<string> {
  const attempt = async (retried: boolean): Promise<string> => {
    const token = await ensureBrowserAccessToken();
    if (!token) throw new ApiError("Inicie sessão para enviar ficheiros.", 401);

    const formData = new FormData();
    formData.append("file", file);
    let response: Response;
    try {
      response = await fetch(`${directApiBaseUrl()}${path}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ApiError(
        /failed to fetch|networkerror|load failed/i.test(msg)
          ? "Não foi possível enviar o vídeo. Verifique a ligação e tente outra vez."
          : msg,
        0,
      );
    }

    if ((response.status === 401 || response.status === 403) && !retried) {
      // Só renovar sessão em 401 — 403 pode ser Bot Fight (HTML), não logout.
      if (response.status === 401 && (await refreshBrowserSessionCookies())) {
        return attempt(true);
      }
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiError(
        extractUploadMessage(payload, `Erro ao enviar ficheiro (${response.status})`),
        response.status,
        payload,
      );
    }
    const url = (payload as UploadUrlDto | null)?.url?.trim();
    if (!url) throw new ApiError("Upload concluído sem URL de retorno.", 500);
    return url;
  };
  return attempt(false);
}

async function uploadFile(path: "/files/avatar" | "/files/listing" | "/files/listing-video" | "/files/chat" | "/files/review" | `/verification/identity/${string}`, file: File): Promise<string> {
  const client = clientOrThrow();
  const formData = new FormData();
  formData.append("file", file);
  const row = await client.request<UploadUrlDto>(path, {
    method: "POST",
    body: formData,
  });
  const url = row.url?.trim();
  if (!url) throw new Error("Upload concluído sem URL de retorno.");
  return url;
}

async function uploadLargeMediaFile(
  path: "/files/listing-video" | "/files/review",
  file: File,
): Promise<string> {
  if (typeof window !== "undefined") {
    return uploadMultipartDirect(path, file);
  }
  return uploadFile(path, file);
}

export async function uploadAvatarFileBackend(file: File): Promise<string> {
  return uploadFile("/files/avatar", file);
}

export async function uploadListingImageBackend(file: File): Promise<string> {
  // Browser → API directa (evita limite ~4,5 MB do proxy Vercel e 403 Bot Fight no upload).
  if (typeof window !== "undefined") {
    return uploadMultipartDirect("/files/listing", file);
  }
  return uploadFile("/files/listing", file);
}

export async function uploadListingVideoBackend(file: File): Promise<string> {
  return uploadLargeMediaFile("/files/listing-video", file);
}

export async function uploadChatAttachmentBackend(file: File): Promise<string> {
  return uploadFile("/files/chat", file);
}

export async function uploadReviewMediaBackend(file: File): Promise<string> {
  return uploadLargeMediaFile("/files/review", file);
}

export type IdentitySide = "front" | "back" | "selfie";

export type IdentityDocumentReview = {
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
};

export type IdentityStatus = {
  uploaded: Record<IdentitySide, boolean>;
  complete: boolean;
  reviewStatus: string;
  adminNote?: string | null;
  documentReviews?: Partial<Record<IdentitySide, IdentityDocumentReview>>;
};

export async function getIdentityStatusBackend(): Promise<IdentityStatus> {
  const client = clientOrThrow();
  return client.request<IdentityStatus>("/verification/identity/status");
}

export async function uploadIdentityDocumentBackend(
  side: IdentitySide,
  file: File,
): Promise<IdentityStatus> {
  // Browser → API directa (evita proxy Vercel / Bot Fight no upload multipart)
  if (typeof window !== "undefined") {
    const attempt = async (retried: boolean): Promise<IdentityStatus> => {
      const token = await ensureBrowserAccessToken();
      if (!token) throw new ApiError("Inicie sessão para enviar documentos.", 401);

      const formData = new FormData();
      formData.append("file", file);
      let response: Response;
      try {
        response = await fetch(`${directApiBaseUrl()}/verification/identity/${side}`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new ApiError(
          /failed to fetch|networkerror|load failed/i.test(msg)
            ? "Não foi possível enviar o documento. Verifique a ligação e tente outra vez."
            : msg,
          0,
        );
      }

      if ((response.status === 401 || response.status === 403) && !retried) {
        if (response.status === 401 && (await refreshBrowserSessionCookies())) {
          return attempt(true);
        }
      }

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new ApiError(
          extractUploadMessage(payload, `Erro ao enviar documento (${response.status})`),
          response.status,
          payload,
        );
      }
      return payload as IdentityStatus;
    };
    return attempt(false);
  }

  const client = clientOrThrow();
  const formData = new FormData();
  formData.append("file", file);
  return client.request<IdentityStatus>(`/verification/identity/${side}`, {
    method: "POST",
    body: formData,
  });
}

export async function submitIdentityVerificationBackend(): Promise<IdentityStatus> {
  const client = clientOrThrow();
  return client.request<IdentityStatus>("/verification/identity/submit", {
    method: "POST",
  });
}
