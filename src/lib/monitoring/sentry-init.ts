import type { BrowserOptions, EdgeOptions, NodeOptions } from "@sentry/nextjs";

export function getSentryDsn(): string | undefined {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  return dsn || undefined;
}

function baseOptions(): Partial<BrowserOptions & NodeOptions & EdgeOptions> {
  const dsn = getSentryDsn();
  if (!dsn) {
    return { enabled: false };
  }

  const isProd = process.env.NODE_ENV === "production";

  return {
    dsn,
    enabled: true,
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT?.trim() ||
      process.env.NODE_ENV ||
      "development",
    tracesSampleRate: isProd ? 0.1 : 1,
    sendDefaultPii: false,
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
    ],
  };
}

export function getBrowserSentryOptions(): BrowserOptions {
  return baseOptions() as BrowserOptions;
}

export function getServerSentryOptions(): NodeOptions {
  return baseOptions() as NodeOptions;
}

export function getEdgeSentryOptions(): EdgeOptions {
  return baseOptions() as EdgeOptions;
}
