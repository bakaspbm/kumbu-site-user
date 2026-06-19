export type GuestSupportSession = {
  id: string;
  accessToken: string;
  guestName: string;
  guestEmail: string;
  supportStatus: string;
  welcomeMessage: string;
  quickActions: { id: string; label: string; escalate?: boolean }[];
  updatedAt: string;
};

export function hasGuestSupportPresentCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => part.trim().startsWith("kumbu_guest_support_present=1"));
}

export async function readGuestSupportSession(): Promise<{
  hasSession: boolean;
  name: string | null;
  email: string | null;
}> {
  if (typeof window === "undefined") {
    return { hasSession: false, name: null, email: null };
  }
  if (!hasGuestSupportPresentCookie()) {
    return { hasSession: false, name: null, email: null };
  }
  try {
    const response = await fetch("/api/support/guest-session", {
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      return { hasSession: false, name: null, email: null };
    }
    const payload = (await response.json()) as {
      hasSession?: boolean;
      guestName?: string | null;
      guestEmail?: string | null;
    };
    return {
      hasSession: Boolean(payload.hasSession),
      name: payload.guestName ?? null,
      email: payload.guestEmail ?? null,
    };
  } catch {
    return { hasSession: false, name: null, email: null };
  }
}

export async function saveGuestSupportSession(session: GuestSupportSession): Promise<void> {
  if (typeof window === "undefined") return;
  const response = await fetch("/api/support/guest-session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accessToken: session.accessToken,
      guestName: session.guestName,
      guestEmail: session.guestEmail,
    }),
  });
  if (!response.ok) {
    throw new Error("Falha ao guardar sessão de convidado.");
  }
}

export async function clearGuestSupportSession(): Promise<void> {
  if (typeof window === "undefined") return;
  await fetch("/api/support/guest-session", {
    method: "DELETE",
    credentials: "include",
  });
}
