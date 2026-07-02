"use client";

import { useRef, useState } from "react";
import { Camera, Star, Video, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { submitProductReviewAction } from "@/app/actions/reviews";
import { uploadReviewMediaBackend } from "@/lib/kumbu-api/files";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";
import {
  getReviewCommentPlaceholder,
  getReviewFormIntro,
  type ListingKindForReview,
} from "@/lib/listing/review-copy";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 5;
const MAX_VIDEOS = 1;

interface ProductReviewFormProps {
  productId: string;
  listingKind?: ListingKindForReview;
  onSubmitted?: () => void;
}

export function ProductReviewForm({
  productId,
  listingKind = "general",
  onSubmitted,
}: ProductReviewFormProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const formatErrorMessage = useFormatErrorMessage();
  const { user } = useAuth();
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function addImages(files: FileList | null) {
    if (!files?.length) return;
    const next = [...imageFiles];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      if (next.length >= MAX_IMAGES) break;
      next.push(f);
    }
    setImageFiles(next);
  }

  function addVideo(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.startsWith("video/") && !f.name.match(/\.(mp4|webm|mov)$/i)) {
      setMessage(t("videoFormatError"));
      return;
    }
    setVideoFile(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setMessage(t("selectRating"));
      return;
    }
    const trimmed = comment.trim();
    if (!trimmed && imageFiles.length === 0 && !videoFile) {
      setMessage(t("commentOrMedia"));
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      void user;
      const media: { type: "image" | "video"; url: string }[] = [];

      for (const file of imageFiles) {
        const url = await uploadReviewMediaBackend(file);
        media.push({ type: "image", url });
      }
      if (videoFile) {
        const url = await uploadReviewMediaBackend(videoFile);
        media.push({ type: "video", url });
      }

      const result = await submitProductReviewAction(
        productId,
        rating,
        trimmed || undefined,
        media,
      );
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setMessage(t("reviewPublished"));
      setComment("");
      setImageFiles([]);
      setVideoFile(null);
      setRating(0);
      onSubmitted?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : formatErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-kumbu-border bg-kumbu-surface p-4">
      <h2 className="text-sm font-bold text-kumbu-foreground">{t("reviewTitle")}</h2>
      <p className="mt-1 text-xs text-kumbu-muted">{getReviewFormIntro(listingKind, t)}</p>
      <div className="mt-3 flex gap-1" role="group" aria-label={t("ratingAria")}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className="rounded p-1 transition-transform hover:scale-110"
            aria-label={t("starsAria", { count: n })}
          >
            <Star
              className={cn(
                "size-7",
                n <= rating ? "fill-amber-400 text-amber-400" : "text-kumbu-border",
              )}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={getReviewCommentPlaceholder(listingKind, t)}
        className="kumbu-input mt-3 min-h-[88px] w-full text-sm"
        maxLength={2000}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addImages(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={videoRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
          className="hidden"
          onChange={(e) => {
            addVideo(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-1.5 text-xs"
          disabled={imageFiles.length >= MAX_IMAGES}
          onClick={() => photoRef.current?.click()}
        >
          <Camera className="size-4" aria-hidden />
          {t("photosCount", { current: imageFiles.length, max: MAX_IMAGES })}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-1.5 text-xs"
          disabled={!!videoFile}
          onClick={() => videoRef.current?.click()}
        >
          <Video className="size-4" aria-hidden />
          {videoFile ? t("videoAdded") : t("videoOne")}
        </Button>
      </div>
      {(imageFiles.length > 0 || videoFile) && (
        <ul className="mt-2 space-y-1 text-xs text-kumbu-muted">
          {imageFiles.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2">
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                className="text-kumbu-primary"
                onClick={() => setImageFiles((prev) => prev.filter((_, j) => j !== i))}
                aria-label={t("removePhoto")}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
          {videoFile && (
            <li className="flex items-center justify-between gap-2">
              <span className="truncate">{videoFile.name}</span>
              <button
                type="button"
                className="text-kumbu-primary"
                onClick={() => setVideoFile(null)}
                aria-label={t("removeVideo")}
              >
                <X className="size-4" />
              </button>
            </li>
          )}
        </ul>
      )}
      {message && (
        <p className="mt-2 text-xs text-kumbu-muted" role="status">
          {message}
        </p>
      )}
      <Button type="submit" className="mt-3 h-10" disabled={busy}>
        {busy ? tCommon("sending") : t("submitReview")}
      </Button>
    </form>
  );
}
