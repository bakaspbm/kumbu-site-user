import { getKumbuApiClient, type KumbuApiClient } from "@/lib/kumbu-api/client";

type UploadUrlDto = {
  url?: string | null;
};

function clientOrThrow(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  return client;
}

async function uploadFile(path: "/files/avatar" | "/files/listing" | `/verification/identity/${string}`, file: File): Promise<string> {
  const client = clientOrThrow();
  const formData = new FormData();
  formData.append("file", file);
  const row = await client.request<UploadUrlDto>(path, {
    method: "POST",
    body: formData,
    headers: {},
  });
  const url = row.url?.trim();
  if (!url) throw new Error("Upload concluído sem URL de retorno.");
  return url;
}

export async function uploadAvatarFileBackend(file: File): Promise<string> {
  return uploadFile("/files/avatar", file);
}

export async function uploadListingImageBackend(file: File): Promise<string> {
  return uploadFile("/files/listing", file);
}

export type IdentitySide = "front" | "back" | "selfie";

export type IdentityStatus = {
  uploaded: Record<IdentitySide, boolean>;
  complete: boolean;
  reviewStatus: string;
};

export async function getIdentityStatusBackend(): Promise<IdentityStatus> {
  const client = clientOrThrow();
  return client.request<IdentityStatus>("/verification/identity/status");
}

export async function uploadIdentityDocumentBackend(
  side: IdentitySide,
  file: File,
): Promise<IdentityStatus> {
  const client = clientOrThrow();
  const formData = new FormData();
  formData.append("file", file);
  return client.request<IdentityStatus>(`/verification/identity/${side}`, {
    method: "POST",
    body: formData,
    headers: {},
  });
}

export async function submitIdentityVerificationBackend(): Promise<IdentityStatus> {
  const client = clientOrThrow();
  return client.request<IdentityStatus>("/verification/identity/submit", {
    method: "POST",
  });
}
