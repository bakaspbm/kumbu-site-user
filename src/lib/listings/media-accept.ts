/** Fotos de anúncio — MIME + extensão alinhados com o backend. */
export const LISTING_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";

export const LISTING_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const LISTING_IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

/**
 * Vídeos de anúncio — aceitar qualquer ficheiro de vídeo comum do telemóvel.
 * A API valida magic bytes; MIME/extensão de telemóveis é inconsistente.
 */
export const LISTING_VIDEO_ACCEPT =
  "video/*,.mp4,.m4v,.mov,.qt,.webm,.3gp,.3gpp,.mkv,.avi,.mpeg,.mpg,.ts,.m2ts";

export const LISTING_VIDEO_EXT =
  /\.(mp4|m4v|mov|qt|webm|3gp|3gpp|mkv|avi|mpeg|mpg|ts|m2ts)$/i;

export const MAX_LISTING_VIDEOS = 3;
export const MAX_LISTING_VIDEO_BYTES = 40 * 1024 * 1024;
export const MAX_LISTING_VIDEO_SECONDS = 60;
export const MAX_LISTING_IMAGE_BYTES = 10 * 1024 * 1024;

export function isAllowedListingImage(file: File): boolean {
  const mime = (file.type || "").toLowerCase().split(";")[0]?.trim() ?? "";
  const nameOk = LISTING_IMAGE_EXT.test(file.name);
  if (!nameOk) return false;
  if (!mime) return nameOk;
  return LISTING_IMAGE_MIME.has(mime);
}

/** Aceita video/* (ou MIME vazio/octet-stream) com extensão de vídeo, ou só video/*. */
export function isAllowedListingVideo(file: File): boolean {
  const mime = (file.type || "").toLowerCase().split(";")[0]?.trim() ?? "";
  const nameOk = LISTING_VIDEO_EXT.test(file.name || "");
  if (mime.startsWith("video/")) return true;
  if (!mime || mime === "application/octet-stream") return nameOk;
  return false;
}

export function readVideoDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    const timer = window.setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error("timeout"));
    }, 8_000);
    video.onloadedmetadata = () => {
      window.clearTimeout(timer);
      const duration = video.duration;
      URL.revokeObjectURL(url);
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("duration"));
        return;
      }
      resolve(duration);
    };
    video.onerror = () => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(url);
      reject(new Error("load"));
    };
    video.src = url;
  });
}
