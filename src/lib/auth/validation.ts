/** @deprecated Prefer hooks in `@/lib/i18n/use-auth-validation` for localized messages. */
export type PasswordStrengthLevel = "weak" | "fair" | "good" | "strong";

export type PasswordCheck = {
  id: string;
  label: string;
  met: boolean;
};

export type EmailValidation = {
  valid: boolean;
  message?: string;
};

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function validateEmail(email: string): EmailValidation {
  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, message: "Indique o email." };
  }
  if (trimmed.length > 254) {
    return { valid: false, message: "Email demasiado longo." };
  }
  if (trimmed.includes(" ") || trimmed.includes("..")) {
    return { valid: false, message: "Formato de email inválido." };
  }
  const at = trimmed.indexOf("@");
  if (at <= 0 || at !== trimmed.lastIndexOf("@")) {
    return { valid: false, message: "O email deve conter um @ válido." };
  }
  const domain = trimmed.slice(at + 1);
  if (!domain.includes(".") || domain.endsWith(".")) {
    return { valid: false, message: "Domínio de email inválido (ex.: nome@email.com)." };
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return { valid: false, message: "Formato de email inválido (ex.: nome@email.com)." };
  }
  return { valid: true };
}

export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { id: "length", label: "Pelo menos 8 caracteres", met: password.length >= 8 },
    { id: "lower", label: "Uma letra minúscula", met: /[a-záàâãéèêíìîóòôõúùûç]/.test(password) },
    { id: "upper", label: "Uma letra maiúscula", met: /[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]/.test(password) },
    { id: "number", label: "Um número", met: /\d/.test(password) },
    { id: "special", label: "Um símbolo (!@#$…)", met: /[^A-Za-z0-9áàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]/.test(password) },
  ];
}

export function assessPasswordStrength(password: string): {
  level: PasswordStrengthLevel;
  checks: PasswordCheck[];
  metCount: number;
  isAcceptableForSignup: boolean;
} {
  const checks = getPasswordChecks(password);
  const metCount = checks.filter((c) => c.met).length;
  const hasLength = checks[0]?.met ?? false;

  let level: PasswordStrengthLevel = "weak";
  if (metCount >= 5) level = "strong";
  else if (metCount >= 4) level = "good";
  else if (metCount >= 3) level = "fair";

  const isAcceptableForSignup = hasLength && metCount >= 3;

  return { level, checks, metCount, isAcceptableForSignup };
}

export function passwordStrengthLabel(level: PasswordStrengthLevel): string {
  switch (level) {
    case "strong":
      return "Forte";
    case "good":
      return "Boa";
    case "fair":
      return "Razoável";
    default:
      return "Fraca";
  }
}

export function passwordStrengthBarColor(level: PasswordStrengthLevel): string {
  switch (level) {
    case "strong":
      return "bg-emerald-500";
    case "good":
      return "bg-lime-500";
    case "fair":
      return "bg-amber-500";
    default:
      return "bg-red-400";
  }
}

export function validatePasswordForLogin(password: string): string | null {
  if (password.length < 8) {
    return "A palavra-passe deve ter pelo menos 8 caracteres.";
  }
  return null;
}

export function validatePasswordForSignup(password: string): string | null {
  const { isAcceptableForSignup } = assessPasswordStrength(password);
  if (!isAcceptableForSignup) {
    return "Escolha uma palavra-passe mais forte (mínimo 8 caracteres e mais 2 critérios).";
  }
  return null;
}
