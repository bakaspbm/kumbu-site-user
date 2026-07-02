"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { isTechnicalErrorMessage } from "@/lib/user-facing-error";

export function useFormatOAuthError() {
  const t = useTranslations("auth.oauth");

  return useCallback(
    (err: unknown): string => {
      const msg = err instanceof Error ? err.message : String(err);
      if (/provider is not enabled|unsupported provider|validation failed/i.test(msg)) {
        return t("providerNotActive");
      }
      if (/origin_mismatch|origin mismatch/i.test(msg)) {
        return t("googleOriginMismatch");
      }
      if (/redirect_uri|redirect uri|URL blocked|can't load URL|url bloqueado/i.test(msg)) {
        return t("redirectMismatch");
      }
      if (/email.*already|already registered/i.test(msg)) {
        return t("emailAlreadyRegistered");
      }
      if (/facebook.*email|email.*facebook|n[aã]o dispon[ií]vel no facebook/i.test(msg)) {
        return t("facebookEmailMissing");
      }
      if (/google.*inv[aá]lid|token google/i.test(msg)) {
        return t("googleInvalid");
      }
      if (/google.*rede|oauth2\.googleapis|contactar o google/i.test(msg)) {
        return t("googleNetwork");
      }
      if (/n[aã]o configurado/i.test(msg)) return t("facebookNotConfigured");
      if (/cancelado|bloqueado|popup/i.test(msg)) return msg;
      const trimmed = msg.trim();
      if (trimmed && !isTechnicalErrorMessage(trimmed)) return trimmed;
      return t("socialLoginFailed");
    },
    [t],
  );
}

export function useOAuthCallbackError() {
  const t = useTranslations("auth.oauth");

  return useCallback(
    (error: string): string => {
      const map: Record<string, string> = {
        "Callback indisponível.": t("callbackUnavailable"),
        "Sessão de login expirada ou resposta inválida. Tente novamente.": t("sessionExpired"),
        "Token Facebook em falta. Tente novamente.": t("facebookTokenMissing"),
        "Resposta de login incompleta. Tente novamente.": t("incompleteResponse"),
      };
      return map[error] ?? error;
    },
    [t],
  );
}
