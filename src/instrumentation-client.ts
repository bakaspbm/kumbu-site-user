import * as Sentry from "@sentry/nextjs";
import { getBrowserSentryOptions } from "@/lib/monitoring/sentry-init";

Sentry.init(getBrowserSentryOptions());

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
