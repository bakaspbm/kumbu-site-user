import { uploadListingImagesBackendAction } from "@/app/actions/listing-upload";

export async function uploadListingImagesFromBrowser(
  files: File[],
): Promise<{ ok: true; urls: string[] } | { ok: false; error: string }> {
  const formData = new FormData();
  for (const file of files) formData.append("files", file);
  return uploadListingImagesBackendAction(formData);
}
