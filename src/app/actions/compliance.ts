"use server";

import { headers } from "next/headers";
import {
  deleteAccountBackend,
  exportAccountDataBackend,
  recordConsentBackend,
  submitReportBackend,
} from "@/lib/kumbu-api/compliance";
import { clearSessionTokens } from "@/lib/kumbu-api/session-tokens";
import { CONSENT_TYPES, type ReportReasonId } from "@/lib/legal/content";
import { serverActionError } from "@/lib/i18n/server-errors";
import { serverLoginRequiredError } from "@/lib/i18n/server-errors";
import { getServerSessionUserId } from "@/lib/server-auth";

export type ContentReportTargetType = "product" | "user" | "message" | "review" | "conversation";

type ActionFail = { ok: false; error: string; needsLogin?: boolean };
type ActionOk = { ok: true };

async function userAgentFromHeaders(): Promise<string | null> {
  const h = await headers();
  return h.get("user-agent");
}

async function requireUserId(): Promise<string | ActionFail> {
  const userId = await getServerSessionUserId();
  if (!userId) {
    return { ok: false, error: await serverLoginRequiredError(), needsLogin: true };
  }
  return userId;
}

export async function recordTermsConsentAction(): Promise<ActionOk | ActionFail> {
  const auth = await requireUserId();
  if (typeof auth !== "string") return auth;
  try {
    await recordConsentBackend(CONSENT_TYPES.termsPrivacy, await userAgentFromHeaders());
    return { ok: true };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}

export async function recordPublishConsentAction(): Promise<ActionOk | ActionFail> {
  const auth = await requireUserId();
  if (typeof auth !== "string") return auth;
  try {
    await recordConsentBackend(CONSENT_TYPES.publishRules, await userAgentFromHeaders());
    return { ok: true };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}

export async function recordCookieConsentAction(
  choice: "essential" | "all",
): Promise<ActionOk | ActionFail> {
  const auth = await requireUserId();
  if (typeof auth !== "string") return { ok: true };
  try {
    const consentType =
      choice === "all" ? "cookies_all_v1" : "cookies_essential_v1";
    await recordConsentBackend(consentType, await userAgentFromHeaders());
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

export async function submitReportAction(input: {
  targetType: ContentReportTargetType;
  targetId: string;
  reportedUserId?: string | null;
  reason: ReportReasonId;
  details?: string;
}): Promise<{ ok: true; reportId: string } | ActionFail> {
  const auth = await requireUserId();
  if (typeof auth !== "string") return auth;
  try {
    const reportId = await submitReportBackend(input);
    return { ok: true, reportId };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}

export async function deleteAccountAction(): Promise<ActionOk | ActionFail> {
  const auth = await requireUserId();
  if (typeof auth !== "string") return auth;
  try {
    await deleteAccountBackend();
    await clearSessionTokens();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}

export async function exportAccountDataAction(): Promise<
  { ok: true; json: string } | ActionFail
> {
  const auth = await requireUserId();
  if (typeof auth !== "string") return auth;
  try {
    const data = await exportAccountDataBackend();
    return { ok: true, json: JSON.stringify(data, null, 2) };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}
