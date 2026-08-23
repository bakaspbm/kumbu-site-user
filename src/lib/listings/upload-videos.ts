import { ApiError } from "@/lib/kumbu-api/client";
import { uploadListingVideoBackend } from "@/lib/kumbu-api/files";
import { MAX_LISTING_VIDEOS } from "@/lib/listings/media-accept";

export async function uploadListingVideosFromBrowser(
  files: File[],
): Promise<{ ok: true; urls: string[] } | { ok: false; error: string }> {
  if (files.length === 0) return { ok: true, urls: [] };
  if (files.length > MAX_LISTING_VIDEOS) {
    return { ok: false, error: `Máximo de ${MAX_LISTING_VIDEOS} vídeos por anúncio.` };
  }

  try {
    const urls: string[] = [];
    for (const file of files) {
      urls.push(await uploadListingVideoBackend(file));
    }
    return { ok: true, urls };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        return { ok: false, error: "Sessão expirada. Inicie sessão e tente outra vez." };
      }
      return { ok: false, error: err.message || "Falha ao enviar vídeos." };
    }
    const msg = err instanceof Error ? err.message : "Falha ao enviar vídeos.";
    return { ok: false, error: msg };
  }
}
