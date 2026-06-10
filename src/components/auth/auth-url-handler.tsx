"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatAuthUrlError } from "@/lib/errors";

function AuthUrlHandlerInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const err = searchParams.get("error");
    const code = searchParams.get("error_code");
    const desc = searchParams.get("error_description");
    if (!err && !code && !desc) return;

    const message = formatAuthUrlError(err, code, desc);
    if (!message) return;

    const params = new URLSearchParams({ auth_error: message });
    if (pathname && pathname !== "/") {
      params.set("next", pathname);
    }
    router.replace(`/login?${params.toString()}`);
  }, [searchParams, pathname, router]);

  return null;
}

export function AuthUrlHandler() {
  return (
    <Suspense fallback={null}>
      <AuthUrlHandlerInner />
    </Suspense>
  );
}
