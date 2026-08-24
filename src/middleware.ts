import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildContentSecurityPolicy } from "@/lib/security/content-security-policy";

const APEX_HOST = "kumbu-market.com";
const CANONICAL_HOST = "www.kumbu-market.com";

function applySecurityHeaders(response: NextResponse): void {
  response.headers.set("Content-Security-Policy", buildContentSecurityPolicy());
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.delete("X-Powered-By");
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";

  if (host === APEX_HOST) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.host = CANONICAL_HOST;
    const redirect = NextResponse.redirect(url, 308);
    applySecurityHeaders(redirect);
    return redirect;
  }

  const response = NextResponse.next();
  applySecurityHeaders(response);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|txt|xml|webmanifest)$).*)",
  ],
};
