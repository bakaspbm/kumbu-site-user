import { extractAuthErrorMessage } from "@/lib/errors";
import {
  sendPhoneOtpBackend,
  verifyPhoneOtpBackend,
} from "@/lib/kumbu-api/auth";
import {
  isValidE164Phone,
  normalizePhoneE164,
  validateNationalForCountry,
} from "@/lib/phone";

export function formatPhoneAuthError(err: unknown): string {
  const msg = extractAuthErrorMessage(err);
  if (msg === "{}" || !msg.trim()) {
    return "Falha ao enviar SMS. Tente novamente ou use email.";
  }
  if (/sms.*n[aã]o configurado|provider|fornecedor/i.test(msg)) {
    return "Login por SMS ainda não está activo no servidor. Configure o fornecedor SMS no backend ou use email.";
  }
  if (/rate limit|too many|over.*sms/i.test(msg)) {
    return "Muitas tentativas. Aguarde alguns minutos antes de pedir um novo código.";
  }
  if (/invalid.*otp|token.*invalid|otp.*invalid|expirado|expired|c[oó]digo/i.test(msg)) {
    return "Código incorrecto ou expirado. Peça um novo código.";
  }
  if (/invalid.*phone|phone.*invalid|telefone/i.test(msg)) {
    return "Número de telefone inválido. Use 9 dígitos (ex.: 923456789).";
  }
  return msg;
}

export function validatePhoneInput(
  nationalDigits: string,
  countryIso: string,
): { phone: string } | { error: string } {
  const trimmed = nationalDigits.trim();
  if (trimmed.startsWith("+") || trimmed.replace(/\D/g, "").length > 12) {
    const phone = normalizePhoneE164(trimmed);
    if (!isValidE164Phone(phone)) {
      return { error: "Indique um número internacional válido (ex.: +351912345678)." };
    }
    return { phone };
  }

  const checked = validateNationalForCountry(countryIso, nationalDigits);
  if (!checked.ok) return { error: checked.error };
  return { phone: checked.phone };
}

export async function sendPhoneLoginOtp(
  _client: unknown,
  nationalDigits: string,
  countryIso: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = validatePhoneInput(nationalDigits, countryIso);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  try {
    await sendPhoneOtpBackend(parsed.phone);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatPhoneAuthError(err) };
  }
}

export async function verifyPhoneLoginOtp(
  _client: unknown,
  nationalDigits: string,
  countryIso: string,
  token: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = validatePhoneInput(nationalDigits, countryIso);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const code = token.trim();
  if (!code) return { ok: false, error: "Introduza o código SMS." };

  try {
    await verifyPhoneOtpBackend(parsed.phone, code);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatPhoneAuthError(err) };
  }
}
