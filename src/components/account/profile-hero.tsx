"use client";

import { Camera, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProfileEmailVerificationStatus } from "@/components/auth/profile-email-verification-status";
import { cn } from "@/lib/utils";

interface ProfileHeroProps {
  displayName: string;
  email: string;
  photoUrl?: string | null;
  initials: string;
  avatarBusy: boolean;
  completionPct: number;
  profileComplete: boolean;
  signupDevEmailLink: string | null;
  onAvatarChange: (file: File | null) => void;
}

export function ProfileHero({
  displayName,
  email,
  photoUrl,
  initials,
  avatarBusy,
  completionPct,
  profileComplete,
  signupDevEmailLink,
  onAvatarChange,
}: ProfileHeroProps) {
  const t = useTranslations("account");

  return (
    <div className="kumbu-card-elevated overflow-hidden">
      <div
        className="relative h-28 sm:h-32"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-kumbu-primary/[0.12] via-kumbu-accent-soft/80 to-kumbu-surface-muted/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(214,40,40,0.14),transparent_55%)]" />
      </div>

      <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
            <label className="-mt-14 block w-fit cursor-pointer sm:-mt-16">
              <span className="relative flex size-24 items-center justify-center overflow-hidden rounded-2xl border-[3px] border-kumbu-surface bg-kumbu-primary text-2xl font-extrabold text-white shadow-[var(--shadow-kumbu-md)] ring-1 ring-kumbu-border/50 sm:size-28">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="" className="size-full object-cover" />
                ) : (
                  initials
                )}
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-kumbu-foreground/55 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                  <Camera className="size-3" aria-hidden />
                  {avatarBusy ? t("avatarUploading") : t("changeAvatar")}
                </span>
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={avatarBusy}
                onChange={(e) => onAvatarChange(e.target.files?.[0] ?? null)}
              />
            </label>

            <div className="min-w-0 pb-0.5">
              <h2 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">
                {displayName || t("defaultUserName")}
              </h2>
              {email ? (
                <p className="mt-0.5 truncate text-sm text-kumbu-muted">{email}</p>
              ) : null}
              {profileComplete ? (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
                  <CheckCircle2 className="size-3.5" aria-hidden />
                  {t("profileCompleteBadge")}
                </span>
              ) : null}
              {email ? (
                <ProfileEmailVerificationStatus initialDevLink={signupDevEmailLink} />
              ) : null}
            </div>
          </div>

          <div
            className="flex shrink-0 items-center gap-3 self-start rounded-2xl bg-kumbu-surface-muted/70 px-4 py-3 ring-1 ring-kumbu-border/70 sm:self-auto"
            aria-label={t("progressAria", { pct: completionPct })}
          >
            <div className="relative size-11">
              <svg className="size-11 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  className="stroke-kumbu-border"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  className={cn(
                    "stroke-kumbu-primary transition-all duration-500",
                    profileComplete && "stroke-emerald-500",
                  )}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${completionPct} 100`}
                  pathLength={100}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-kumbu-foreground">
                {completionPct}%
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-kumbu-muted">
                {t("progress")}
              </p>
              <p className="text-sm font-bold text-kumbu-foreground">
                {profileComplete ? t("readyToSell") : t("completeProfile")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
