const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.78;
const COMPRESS_ABOVE_BYTES = 120_000;

export async function compressListingImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < COMPRESS_ABOVE_BYTES) {
    return file;
  }

  if (typeof createImageBitmap !== "function") return file;

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);
    if (longest <= MAX_EDGE_PX && file.size < 800_000) {
      return file;
    }

    const scale = Math.min(1, MAX_EDGE_PX / longest);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", JPEG_QUALITY);
    });
    if (!blob || blob.size >= file.size * 0.95) return file;

    const base = file.name.replace(/\.[^.]+$/, "") || "foto";
    return new File([blob], `${base}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}
