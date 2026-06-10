"use client";

import { useId, useState, type ReactNode } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  assessPasswordStrength,
  passwordStrengthBarColor,
} from "@/lib/auth/validation";
import {
  usePasswordCheckLabels,
  usePasswordStrengthLabel,
  useValidateEmail,
} from "@/lib/i18n/use-auth-validation";

type AuthEmailFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  onErrorChange?: (message: string | null) => void;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
};

export function AuthEmailField({
  value,
  onChange,
  error,
  onErrorChange,
  label,
  placeholder,
  autoComplete = "email",
}: AuthEmailFieldProps) {
  const t = useTranslations("auth");
  const validateEmail = useValidateEmail();
  const id = useId();
  const [touched, setTouched] = useState(false);

  function handleBlur() {
    setTouched(true);
    const result = validateEmail(value);
    onErrorChange?.(result.valid ? null : (result.message ?? t("invalidEmail")));
  }

  function handleChange(next: string) {
    onChange(next);
    if (touched || error) {
      const result = validateEmail(next);
      onErrorChange?.(result.valid ? null : (result.message ?? t("invalidEmail")));
    }
  }

  const showError = Boolean(error);

  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="text-sm font-medium text-kumbu-foreground">{label ?? t("email")}</span>
      <input
        id={id}
        type="email"
        inputMode="email"
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder ?? t("emailPlaceholder")}
        aria-invalid={showError}
        aria-describedby={showError ? `${id}-error` : undefined}
        className={`kumbu-input h-11 font-normal ${showError ? "ring-2 ring-red-200" : ""}`}
      />
      {showError && (
        <p id={`${id}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </label>
  );
}

type AuthPasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string | null;
  placeholder?: string;
  autoComplete?: string;
  showStrength?: boolean;
  labelExtra?: ReactNode;
};

export function AuthPasswordField({
  value,
  onChange,
  label,
  error,
  placeholder = "••••••••",
  autoComplete = "current-password",
  showStrength = false,
  labelExtra,
}: AuthPasswordFieldProps) {
  const t = useTranslations("auth");
  const tVal = useTranslations("auth.validation");
  const strengthLabel = usePasswordStrengthLabel();
  const passwordChecks = usePasswordCheckLabels();
  const id = useId();
  const [visible, setVisible] = useState(false);
  const strength = assessPasswordStrength(value);
  const checks = passwordChecks(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-kumbu-foreground">
          {label ?? t("password")}
        </label>
        {labelExtra}
      </div>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          minLength={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : showStrength ? `${id}-strength` : undefined}
          className={`kumbu-input h-11 w-full pr-11 font-normal ${error ? "ring-2 ring-red-200" : ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-kumbu-muted transition hover:text-kumbu-foreground"
          aria-label={visible ? tVal("hidePassword") : tVal("showPassword")}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>

      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {showStrength && value.length > 0 && (
        <div id={`${id}-strength`} className="space-y-2 rounded-xl bg-kumbu-secondary/60 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-kumbu-muted">{tVal("strengthLabel")}</span>
            <span
              className={`text-xs font-semibold ${
                strength.level === "weak"
                  ? "text-red-600"
                  : strength.level === "fair"
                    ? "text-amber-700"
                    : strength.level === "good"
                      ? "text-lime-700"
                      : "text-emerald-700"
              }`}
            >
              {strengthLabel(strength.level)}
            </span>
          </div>
          <div className="flex gap-1" aria-hidden>
            {Array.from({ length: 4 }, (_, i) => {
              const filled = Math.max(0, Math.min(4, strength.metCount - 1));
              return (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < filled ? passwordStrengthBarColor(strength.level) : "bg-kumbu-border"
                  }`}
                />
              );
            })}
          </div>
          <ul className="space-y-1">
            {checks.map((check) => (
              <li key={check.id} className="flex items-center gap-1.5 text-xs text-kumbu-muted">
                {check.met ? (
                  <Check className="size-3 shrink-0 text-emerald-600" aria-hidden />
                ) : (
                  <X className="size-3 shrink-0 text-kumbu-muted/70" aria-hidden />
                )}
                <span className={check.met ? "text-kumbu-foreground" : undefined}>{check.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
