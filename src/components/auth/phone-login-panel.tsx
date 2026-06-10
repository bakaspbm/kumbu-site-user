"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  PhoneNumberInput,
  phoneInputHint,
  readStoredPhoneCountryIso,
  storePhoneCountryIso,
} from "@/components/auth/phone-number-input";
import { sendPhoneLoginOtp, verifyPhoneLoginOtp } from "@/lib/auth/phone-auth";

type Props = {
  disabled?: boolean;
  onSuccess: () => void;
};

export function PhoneLoginPanel({ disabled = false, onSuccess }: Props) {
  const t = useTranslations("auth.phone");
  const tCommon = useTranslations("common");
  const [countryIso, setCountryIso] = useState(readStoredPhoneCountryIso);
  const [nationalNumber, setNationalNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCountryChange(iso: string) {
    setCountryIso(iso);
    storePhoneCountryIso(iso);
  }

  async function handleSendOtp() {
    setError(null);
    setLoading(true);
    const result = await sendPhoneLoginOtp(null, nationalNumber, countryIso);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOtpSent(true);
  }

  async function handleVerify() {
    setError(null);
    setLoading(true);
    const result = await verifyPhoneLoginOtp(null, nationalNumber, countryIso, otp);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {t("mobile")}
        <PhoneNumberInput
          countryIso={countryIso}
          onCountryIsoChange={handleCountryChange}
          nationalNumber={nationalNumber}
          onNationalNumberChange={setNationalNumber}
          disabled={disabled || loading || otpSent}
        />
        <span className="text-xs font-normal text-kumbu-muted">
          {phoneInputHint(countryIso)}
        </span>
      </label>

      {otpSent && (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {t("smsCode")}
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="kumbu-input font-normal tracking-[0.3em]"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            disabled={disabled || loading}
          />
        </label>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {!otpSent ? (
        <Button
          type="button"
          fullWidth
          className="h-12"
          disabled={disabled || loading || !nationalNumber.trim()}
          onClick={() => void handleSendOtp()}
        >
          {loading ? tCommon("sending") : t("sendSms")}
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            fullWidth
            className="h-12"
            disabled={disabled || loading || otp.length < 4}
            onClick={() => void handleVerify()}
          >
            {loading ? t("verifying") : t("confirmCode")}
          </Button>
          <button
            type="button"
            className="text-xs font-semibold text-kumbu-primary"
            disabled={loading}
            onClick={() => {
              setOtpSent(false);
              setOtp("");
              setError(null);
            }}
          >
            {t("changeNumber")}
          </button>
        </div>
      )}
    </div>
  );
}
