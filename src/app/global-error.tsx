"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50 px-4 text-center">
        <h1 className="text-xl font-semibold text-neutral-900">
          Algo correu mal
        </h1>
        <p className="max-w-md text-sm text-neutral-600">
          O erro foi registado. Tente recarregar a página ou volte mais tarde.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
