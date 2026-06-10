/** Valores de public.users.signup_auth_method */
export type SignupAuthMethod =
  | "email"
  | "google"
  | "facebook"
  | "phone"
  | "apple"
  | "anonymous"
  | "unknown";

const KNOWN: SignupAuthMethod[] = [
  "email",
  "google",
  "facebook",
  "phone",
  "apple",
  "anonymous",
  "unknown",
];

export function normalizeSignupAuthMethod(raw: unknown): SignupAuthMethod {
  if (typeof raw !== "string" || !raw.trim()) return "unknown";
  const v = raw.trim().toLowerCase();
  if (v === "sms") return "phone";
  return (KNOWN.includes(v as SignupAuthMethod) ? v : "unknown") as SignupAuthMethod;
}

export function signupAuthMethodFromUser(user: {
  user_metadata?: Record<string, unknown>;
  identities?: { provider?: string }[];
  app_metadata?: Record<string, unknown>;
}): SignupAuthMethod {
  const meta = user.user_metadata ?? {};
  const fromMeta = normalizeSignupAuthMethod(
    meta.signup_auth_method ?? meta.auth_method,
  );
  if (fromMeta !== "unknown") return fromMeta;

  const identityProvider = user.identities?.[0]?.provider;
  if (identityProvider) return normalizeSignupAuthMethod(identityProvider);

  const appProvider = user.app_metadata?.provider;
  if (typeof appProvider === "string") return normalizeSignupAuthMethod(appProvider);

  return "unknown";
}
