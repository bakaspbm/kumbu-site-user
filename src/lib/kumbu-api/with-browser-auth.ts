import {
  ensureBrowserAccessToken,
  refreshBrowserSessionCookies,
} from "@/lib/kumbu-api/browser-session";
import { ApiError } from "@/lib/kumbu-api/client";
import { isStoreApiUnauthorized } from "@/lib/kumbu-api/store";

/** Runs an authenticated browser API call; refreshes cookies once on 401. */
export async function withBrowserAuthRetry<T>(fn: () => Promise<T>): Promise<T> {
  const run = async () => {
    await ensureBrowserAccessToken();
    return fn();
  };
  try {
    return await run();
  } catch (err) {
    if (isStoreApiUnauthorized(err) || (err instanceof ApiError && err.status === 401)) {
      const renewed = await refreshBrowserSessionCookies();
      if (!renewed) throw err;
      return await run();
    }
    throw err;
  }
}
