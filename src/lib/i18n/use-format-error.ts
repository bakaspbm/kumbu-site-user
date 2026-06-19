"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { errorMessagesFromTranslations } from "@/lib/i18n/error-messages";
import {
  resolveUserFacingError,
  resolveUserFacingErrorMessage,
  type UserFacingError,
} from "@/lib/user-facing-error";

export function useFormatErrorMessage() {
  const t = useTranslations("errors");

  return useCallback(
    (err: unknown): string => {
      return resolveUserFacingErrorMessage(err, errorMessagesFromTranslations(t));
    },
    [t],
  );
}

export function useResolveUserFacingError() {
  const t = useTranslations("errors");

  return useCallback(
    (err: unknown): UserFacingError => {
      return resolveUserFacingError(err, errorMessagesFromTranslations(t));
    },
    [t],
  );
}

export function useAuthUrlErrorMessage() {
  const t = useTranslations("errors");

  return useCallback(
    (
      error?: string | null,
      code?: string | null,
      description?: string | null,
    ): string | null => {
      if (!error && !code && !description) return null;
      if (description) {
        try {
          return decodeURIComponent(description.replace(/\+/g, " "));
        } catch {
          return description.replace(/\+/g, " ");
        }
      }
      const map: Record<string, string> = {
        otp_expired: t("otpExpired"),
        access_denied: t("accessDenied"),
        invalid_request: t("invalidRequest"),
        server_error: t("oauthServerError"),
        unauthorized_client: t("oauthClient"),
        redirect_uri_mismatch: t("redirectMismatch"),
      };
      if (code && map[code]) return map[code];
      if (error && map[error]) return map[error];
      return error ?? code ?? t("authError");
    },
    [t],
  );
}
