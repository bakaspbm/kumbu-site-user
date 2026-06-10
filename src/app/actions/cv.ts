"use server";

import { serverActionError } from "@/lib/i18n/server-errors";
import { serverLoginRequiredError } from "@/lib/i18n/server-errors";
import {
  createCv,
  deleteCv,
  listMyCvs,
  updateCv,
} from "@/lib/site-data";
import { getServerSessionUserId } from "@/lib/server-auth";
import type { UserCv, UserCvInsert } from "@/types/job";

export type CvListResult =
  | { ok: true; cvs: UserCv[] }
  | { ok: false; error: string; needsLogin?: boolean };

export type CvSaveResult =
  | { ok: true; cv: UserCv }
  | { ok: false; error: string; needsLogin?: boolean };

export async function listMyCvsAction(): Promise<CvListResult> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) return { ok: false, error: await serverLoginRequiredError(), needsLogin: true };
    const cvs = await listMyCvs();
    return { ok: true, cvs };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}

export async function createCvAction(input: UserCvInsert): Promise<CvSaveResult> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) return { ok: false, error: await serverLoginRequiredError(), needsLogin: true };
    const cv = await createCv(input);
    return { ok: true, cv };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}

export async function updateCvAction(
  cvId: string,
  input: Partial<UserCvInsert>,
): Promise<CvSaveResult> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) return { ok: false, error: await serverLoginRequiredError(), needsLogin: true };
    const cv = await updateCv(cvId, input);
    return { ok: true, cv };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}

export async function deleteCvAction(cvId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) return { ok: false, error: await serverLoginRequiredError() };
    await deleteCv(cvId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}
