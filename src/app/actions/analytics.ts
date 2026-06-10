"use server";

import {
  serverInvalidProductError,
  serverLoginRequiredError,
  serverRegisterViewError,
} from "@/lib/i18n/server-errors";
import { recordProductViewBackend } from "@/lib/kumbu-api/catalog";
import { getServerSessionUserId } from "@/lib/server-auth";

export async function recordProductViewAction(
  productId: string,
): Promise<{ ok: true; viewCount: number | null } | { ok: false; error: string }> {
  if (!productId?.trim()) return { ok: false, error: await serverInvalidProductError() };
  try {
    const viewCount = await recordProductViewBackend(productId);
    return { ok: true, viewCount };
  } catch (e) {
    const msg = e instanceof Error ? e.message : await serverRegisterViewError();
    return { ok: false, error: msg };
  }
}

export async function recordCvViewAction(
  applicationId: string,
): Promise<{ ok: true; notified: boolean } | { ok: false; error: string }> {
  const userId = await getServerSessionUserId();
  if (!userId) return { ok: false, error: await serverLoginRequiredError() };
  try {
    const { recordJobApplicationCvView } = await import("@/lib/site-data");
    const result = await recordJobApplicationCvView(applicationId);
    return { ok: true, notified: result.notified };
  } catch (e) {
    const msg = e instanceof Error ? e.message : await serverRegisterViewError();
    return { ok: false, error: msg };
  }
}
