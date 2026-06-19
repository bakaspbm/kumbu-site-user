import * as Sentry from "@sentry/nextjs";
import { getEdgeSentryOptions } from "./src/lib/monitoring/sentry-init";

Sentry.init(getEdgeSentryOptions());
