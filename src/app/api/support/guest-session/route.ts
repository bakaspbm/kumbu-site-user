import {
  GUEST_SUPPORT_EMAIL_COOKIE,
  GUEST_SUPPORT_NAME_COOKIE,
  GUEST_SUPPORT_PRESENT_COOKIE,
  GUEST_SUPPORT_TOKEN_COOKIE,
  GUEST_SUPPORT_TOKEN_MAX_AGE,
} from "@/lib/support/guest-session-cookies";
import { assertSameOriginRequest } from "@/lib/security/request-origin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function cookieOptions(maxAge = GUEST_SUPPORT_TOKEN_MAX_AGE) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

function presenceOptions(present: boolean) {
  return {
    httpOnly: false as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: present ? GUEST_SUPPORT_TOKEN_MAX_AGE : 0,
  };
}

export async function POST(request: Request) {
  if (!assertSameOriginRequest(request)) {
    return NextResponse.json({ error: "Pedido não autorizado" }, { status: 403 });
  }

  const body = (await request.json()) as {
    accessToken?: string;
    guestName?: string;
    guestEmail?: string;
  };
  if (!body.accessToken?.trim()) {
    return NextResponse.json({ error: "Token em falta" }, { status: 400 });
  }

  const jar = await cookies();
  jar.set(GUEST_SUPPORT_TOKEN_COOKIE, body.accessToken.trim(), cookieOptions());
  if (body.guestName?.trim()) {
    jar.set(GUEST_SUPPORT_NAME_COOKIE, body.guestName.trim(), cookieOptions());
  }
  if (body.guestEmail?.trim()) {
    jar.set(GUEST_SUPPORT_EMAIL_COOKIE, body.guestEmail.trim(), cookieOptions());
  }
  jar.set(GUEST_SUPPORT_PRESENT_COOKIE, "1", presenceOptions(true));

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const jar = await cookies();
  const token = jar.get(GUEST_SUPPORT_TOKEN_COOKIE)?.value;
  return NextResponse.json({
    hasSession: Boolean(token),
    guestName: jar.get(GUEST_SUPPORT_NAME_COOKIE)?.value ?? null,
    guestEmail: jar.get(GUEST_SUPPORT_EMAIL_COOKIE)?.value ?? null,
  });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(GUEST_SUPPORT_TOKEN_COOKIE);
  jar.delete(GUEST_SUPPORT_NAME_COOKIE);
  jar.delete(GUEST_SUPPORT_EMAIL_COOKIE);
  jar.set(GUEST_SUPPORT_PRESENT_COOKIE, "", presenceOptions(false));
  return NextResponse.json({ ok: true });
}
