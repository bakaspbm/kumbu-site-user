export type UserBanFields = {
  banned_at?: string | null;
  banned_until?: string | null;
  ban_reason?: string | null;
  deleted_at?: string | null;
};

export function isUserCurrentlyBanned(user: UserBanFields, now = new Date()): boolean {
  if (user.deleted_at) return false;
  if (!user.banned_at) return false;
  if (!user.banned_until) return true;
  return new Date(user.banned_until) > now;
}

export function getUserBanMessage(user: UserBanFields, now = new Date()): string | null {
  if (!isUserCurrentlyBanned(user, now)) return null;
  const reason = user.ban_reason?.trim();
  if (!user.banned_until) {
    return reason
      ? `A sua conta foi suspensa permanentemente: ${reason}`
      : "A sua conta foi suspensa permanentemente. Contacte o suporte.";
  }
  const until = new Date(user.banned_until).toLocaleString("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
  });
  return reason
    ? `A sua conta está suspensa até ${until}: ${reason}`
    : `A sua conta está suspensa até ${until}.`;
}
