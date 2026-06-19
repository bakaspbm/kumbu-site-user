"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { changePasswordBackend } from "@/lib/kumbu-api/auth";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";

export function ChangePasswordForm() {
  const t = useTranslations("settings.changePassword");
  const formatErrorMessage = useFormatErrorMessage();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (newPassword.length < 8) {
      setError(t("minLength"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("mismatch"));
      return;
    }
    setBusy(true);
    try {
      await changePasswordBackend(currentPassword, newPassword);
      setMessage(t("success"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">{t("current")}</span>
        <input
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="kumbu-input font-normal"
          required
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">{t("new")}</span>
        <input
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="kumbu-input font-normal"
          required
          minLength={8}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">{t("confirm")}</span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="kumbu-input font-normal"
          required
          minLength={8}
        />
      </label>
      {message ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      <Button type="submit" disabled={busy} className="h-11">
        {busy ? t("saving") : t("submit")}
      </Button>
    </form>
  );
}
