"use server";

import {
  serverActionError,
  serverImageTooLargeError,
  serverInvalidPhotoUrlError,
  serverLoginRequiredError,
  serverSelectImageError,
} from "@/lib/i18n/server-errors";
import { updateStoreUser } from "@/lib/site-data";
import { getServerSessionUserId } from "@/lib/server-auth";
import type { StoreUser, StoreUserUpdate } from "@/types/store";

export type UpdateProfileResult =
  | { ok: true; profile: StoreUser }
  | { ok: false; error: string; needsLogin?: boolean };

export async function updateProfileAction(
  update: StoreUserUpdate,
): Promise<UpdateProfileResult> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) {
      return { ok: false, error: await serverLoginRequiredError(), needsLogin: true };
    }
    const profile = await updateStoreUser(update);
    return { ok: true, profile };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}

export async function saveProfilePhotoUrlAction(
  photoUrl: string,
): Promise<UpdateProfileResult> {
  const trimmed = photoUrl.trim();
  if (!trimmed.startsWith("http")) {
    return { ok: false, error: await serverInvalidPhotoUrlError() };
  }

  try {
    const userId = await getServerSessionUserId();
    if (!userId) {
      return { ok: false, error: await serverLoginRequiredError(), needsLogin: true };
    }
    const profile = await updateStoreUser({ photoUrl: trimmed });
    return { ok: true, profile };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}

export async function updateProfilePhotoAction(
  formData: FormData,
): Promise<UpdateProfileResult> {
  const userId = await getServerSessionUserId();
  if (!userId) {
    return { ok: false, error: await serverLoginRequiredError(), needsLogin: true };
  }
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: await serverSelectImageError() };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { ok: false, error: await serverImageTooLargeError() };
  }
  try {
    const { uploadAvatarFile } = await import("@/lib/site-data");
    const photoUrl = await uploadAvatarFile(file);
    const profile = await updateStoreUser({ photoUrl });
    return { ok: true, profile };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}
