"use server";

import { serverActionError } from "@/lib/i18n/server-errors";
import {
  countUnreadMessagesForUser,
  countUnreadNotifications,
  getStoreUser,
} from "@/lib/site-data";
import { getServerSessionUserId } from "@/lib/server-auth";
import type { StoreUser } from "@/types/store";

export type FetchStoreProfileResult =
  | { ok: true; profile: StoreUser }
  | { ok: false; error?: string; needsLogin?: boolean; banned?: boolean };

export type FetchAccountShellResult =
  | {
      ok: true;
      profile: StoreUser;
      unreadNotifications: number;
      unreadMessages: number;
    }
  | { ok: false; error?: string; needsLogin?: boolean; banned?: boolean };

export async function fetchAccountShellAction(): Promise<FetchAccountShellResult> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) return { ok: false, needsLogin: true };
    const profile = await getStoreUser();
    if (!profile) {
      return { ok: false, needsLogin: true };
    }

    const [unreadNotifications, unreadMessages] = await Promise.all([
      countUnreadNotifications(),
      countUnreadMessagesForUser(profile.id),
    ]);

    return { ok: true, profile, unreadNotifications, unreadMessages };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}

export async function fetchStoreProfileAction(): Promise<FetchStoreProfileResult> {
  const shell = await fetchAccountShellAction();
  if (!shell.ok) return shell;
  return { ok: true, profile: shell.profile };
}

export async function countUnreadNotificationsAction(): Promise<number> {
  try {
    return await countUnreadNotifications();
  } catch {
    return 0;
  }
}
