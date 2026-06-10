"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  assessPasswordStrength,
  getPasswordChecks,
  type EmailValidation,
  type PasswordStrengthLevel,
} from "@/lib/auth/validation";

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function useValidateEmail() {
  const t = useTranslations("auth.validation");

  return useCallback(
    (email: string): EmailValidation => {
      const trimmed = email.trim();
      if (!trimmed) return { valid: false, message: t("emailRequired") };
      if (trimmed.length > 254) return { valid: false, message: t("emailTooLong") };
      if (trimmed.includes(" ") || trimmed.includes("..")) {
        return { valid: false, message: t("emailInvalidFormat") };
      }
      const at = trimmed.indexOf("@");
      if (at <= 0 || at !== trimmed.lastIndexOf("@")) {
        return { valid: false, message: t("emailInvalidAt") };
      }
      const domain = trimmed.slice(at + 1);
      if (!domain.includes(".") || domain.endsWith(".")) {
        return { valid: false, message: t("emailInvalidDomain") };
      }
      if (!EMAIL_PATTERN.test(trimmed)) {
        return { valid: false, message: t("emailInvalidExample") };
      }
      return { valid: true };
    },
    [t],
  );
}

export function usePasswordStrengthLabel() {
  const t = useTranslations("auth.validation.strength");

  return useCallback(
    (level: PasswordStrengthLevel) => t(level),
    [t],
  );
}

export function usePasswordCheckLabels() {
  const t = useTranslations("auth.validation.checks");

  return useCallback(
    (password: string) => {
      const checks = getPasswordChecks(password);
      return checks.map((check) => ({
        ...check,
        label: t(check.id),
      }));
    },
    [t],
  );
}

export function useValidatePasswordForLogin() {
  const t = useTranslations("auth.validation");

  return useCallback(
    (password: string): string | null => {
      if (password.length < 8) return t("passwordMinLength");
      return null;
    },
    [t],
  );
}

export function useValidatePasswordForSignup() {
  const t = useTranslations("auth.validation");

  return useCallback(
    (password: string): string | null => {
      const { isAcceptableForSignup } = assessPasswordStrength(password);
      if (!isAcceptableForSignup) return t("passwordWeak");
      return null;
    },
    [t],
  );
}
