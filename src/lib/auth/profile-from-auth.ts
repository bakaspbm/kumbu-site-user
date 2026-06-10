function displayNameFromPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 9) {
    const local = digits.slice(-9);
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return phone;
}

/** Extrai nome e foto dos metadados Google / Facebook / telefone / Supabase. */
export function profileFromAuthMetadata(
  meta: Record<string, unknown> | undefined,
  email?: string | null,
  phone?: string | null,
): { displayName: string; photoUrl: string | null } {
  const m = meta ?? {};

  let photoUrl: string | null = null;
  const avatar = m.avatar_url ?? m.picture;
  if (typeof avatar === "string" && avatar.trim()) {
    photoUrl = avatar.trim();
  } else if (avatar && typeof avatar === "object") {
    const data = (avatar as { data?: { url?: string } }).data;
    if (typeof data?.url === "string" && data.url.trim()) {
      photoUrl = data.url.trim();
    }
  }

  const name =
    [m.full_name, m.name, m.display_name]
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .find((v) => v.length > 0) ?? "";

  const displayName =
    name ||
    (email ? (email.split("@")[0] || "Utilizador") : null) ||
    (phone?.trim() ? displayNameFromPhone(phone.trim()) : null) ||
    "Utilizador";

  return { displayName, photoUrl };
}
