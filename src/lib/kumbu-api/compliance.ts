import { getKumbuApiClient, type KumbuApiClient } from "@/lib/kumbu-api/client";
import type { ReportReasonId } from "@/lib/legal/content";
import type { ContentReportTargetType } from "@/lib/legal/content";

function clientOrThrow(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  return client;
}

export async function recordConsentBackend(
  consentType: string,
  userAgent?: string | null,
): Promise<void> {
  const client = clientOrThrow();
  await client.request("/compliance/consents", {
    method: "POST",
    body: JSON.stringify({
      consentType,
      userAgent: userAgent ?? undefined,
    }),
  });
}

export async function submitReportBackend(input: {
  targetType: ContentReportTargetType;
  targetId: string;
  reportedUserId?: string | null;
  reason: ReportReasonId;
  details?: string;
}): Promise<string> {
  const client = clientOrThrow();
  const payload = await client.request<{ id?: string }>("/compliance/reports", {
    method: "POST",
    body: JSON.stringify({
      targetType: input.targetType,
      targetId: input.targetId,
      reportedUserId: input.reportedUserId ?? undefined,
      reason: input.reason,
      details: input.details?.trim() || undefined,
    }),
  });
  return String(payload.id ?? "");
}

export async function exportAccountDataBackend(): Promise<Record<string, unknown>> {
  const client = clientOrThrow();
  return client.request<Record<string, unknown>>("/users/me/export");
}

export async function deleteAccountBackend(): Promise<void> {
  const client = clientOrThrow();
  await client.request<void>("/users/me", { method: "DELETE" });
}
