"use server";

import { revalidateHomeCatalog } from "@/app/actions/revalidate-catalog";
import {
  serverActionError,
  serverListingNotFoundPermissionError,
} from "@/lib/i18n/server-errors";
import { uploadListingImageFile } from "@/lib/site-data";
import { getCatalogProductBackend, updateCatalogProductBackend } from "@/lib/kumbu-api/catalog";
import { normalizeListingImageUrls } from "@/lib/store/product-images";
import { publishDebugFail, publishDebugTimer } from "@/lib/publish/publish-debug";

export type UploadListingImagesResult =
  | { ok: true }
  | { ok: false; error: string };

export async function attachListingImageUrlsToProductAction(
  productId: string,
  newUrls: string[],
): Promise<UploadListingImagesResult> {
  try {
    const product = await getCatalogProductBackend(productId);
    if (!product) {
      return { ok: false, error: await serverListingNotFoundPermissionError() };
    }
    const imageUrls = normalizeListingImageUrls([
      ...newUrls,
      ...(product.imageUrls ?? []),
      product.imageUrl ?? "",
    ]);
    if (imageUrls.length === 0) return { ok: true };
    await updateCatalogProductBackend(productId, { imageUrls });
    await revalidateHomeCatalog();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}

export async function uploadListingImagesForProductAction(
  productId: string,
  formData: FormData,
): Promise<UploadListingImagesResult> {
  const files: File[] = [];
  for (const entry of formData.getAll("files")) {
    if (entry instanceof File && entry.size > 0) files.push(entry);
  }
  if (files.length === 0) return { ok: true };

  try {
    const urls = await Promise.all(files.map((file) => uploadListingImageFile(file)));
    return attachListingImageUrlsToProductAction(productId, urls);
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}
