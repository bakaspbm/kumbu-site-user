import { getStoreUser } from "@/lib/site-data";
import { getServerSessionUserId } from "@/lib/server-auth";

export type ServerAuthResult =
  | { status: "logged_in"; userId: string }
  | { status: "needs_login" }
  | { status: "no_backend" };

export async function resolveServerAuth(): Promise<ServerAuthResult> {
  const userId = await getServerSessionUserId();
  if (userId) return { status: "logged_in", userId };
  try {
    const profile = await getStoreUser();
    if (profile?.id) return { status: "logged_in", userId: profile.id };
  } catch {
    /* sem sessão ou backend indisponível */
  }
  return { status: "needs_login" };
}
