import * as Sentry from "@sentry/nextjs";
import { getServerSentryOptions } from "./src/lib/monitoring/sentry-init";

Sentry.init(getServerSentryOptions());
