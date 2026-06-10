"use server";

import {
  serverActionError,
  serverInvalidPhotoCountError,
  serverMaxPhotosPerListingError,
  serverUploadPhotosLoginError,
} from "@/lib/i18n/server-errors";
import { getStoreUserBackend } from "@/lib/kumbu-api/store";
import { uploadListingImageFile } from "@/lib/site-data";
import { publishDebugFail, publishDebugTimer } from "@/lib/publish/publish-debug";

export type SignedListingUpload = {
  path: string;
  token: string;
  publicUrl: string;
};

export async function createListingSignedUploadsAction(
  count: number,
): Promise<
  { ok: true; uploads: SignedListingUpload[] } | { ok: false; error: string }
> {
  if (count < 1 || count > 10) {
    return { ok: false, error: await serverInvalidPhotoCountError() };
  }

  const profile = await getStoreUserBackend();
  if (!profile?.id) {
    publishDebugFail("P2A_URLS_ASSINADAS", "sem sessão");
    return { ok: false, error: await serverUploadPhotosLoginError() };
  }
  const timer = publishDebugTimer("P2A_URLS_ASSINADAS", `${count} URL(s)`);

  try {
    const uploads: SignedListingUpload[] = [];
    for (let i = 0; i < count; i++) {
      const objectPath = `listings/${profile.id}/foto_${Date.now()}_${i}.jpg`;
      uploads.push({
        path: objectPath,
        token: "",
        publicUrl: "",
      });
    }
    timer.ok({ count: uploads.length, paths: uploads.map((u) => u.path) });
    return { ok: true, uploads };
  } catch (err) {
    timer.fail("não foi possível criar URLs", err, { count });
    return { ok: false, error: await serverActionError(err) };
  }
}

export async function uploadListingImagesBackendAction(
  formData: FormData,
): Promise<{ ok: true; urls: string[] } | { ok: false; error: string }> {
  const profile = await getStoreUserBackend();
  if (!profile) {
    publishDebugFail("P2C_UPLOAD_SERVIDOR", "sem sessão (API)");
    return { ok: false, error: await serverUploadPhotosLoginError() };
  }

  const rawFiles: File[] = [];
  for (const entry of formData.getAll("files")) {
    if (entry instanceof File && entry.size > 0) rawFiles.push(entry);
  }
  if (rawFiles.length === 0) return { ok: true, urls: [] };
  if (rawFiles.length > 10) {
    return { ok: false, error: await serverMaxPhotosPerListingError() };
  }

  const timer = publishDebugTimer("P2C_UPLOAD_SERVIDOR", `${rawFiles.length} foto(s) → API`);
  try {
    const urls = await Promise.all(rawFiles.map((file) => uploadListingImageFile(file)));
    timer.ok({ urlCount: urls.length });
    return { ok: true, urls };
  } catch (err) {
    timer.fail("upload API pelo servidor falhou", err, { fileCount: rawFiles.length });
    return { ok: false, error: await serverActionError(err) };
  }
}

export async function uploadListingImagesAction(
  formData: FormData,
): Promise<{ ok: true; urls: string[] } | { ok: false; error: string }> {
  return uploadListingImagesBackendAction(formData);
}
