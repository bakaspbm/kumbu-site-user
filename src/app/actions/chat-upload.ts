"use server";

import {
  serverActionError,
  serverImageTooLargeError,
  serverLoginRequiredError,
  serverSelectImageError,
} from "@/lib/i18n/server-errors";
import { getServerSessionUserId } from "@/lib/server-auth";
import { uploadChatAttachmentBackend } from "@/lib/kumbu-api/files";

const MAX_BYTES = 10 * 1024 * 1024;

export async function uploadChatAttachmentAction(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) {
      return { ok: false, error: await serverLoginRequiredError() };
    }

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: await serverSelectImageError() };
    }
    if (file.size > MAX_BYTES) {
      return { ok: false, error: await serverImageTooLargeError() };
    }

    const url = await uploadChatAttachmentBackend(file);
    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: await serverActionError(e) };
  }
}
