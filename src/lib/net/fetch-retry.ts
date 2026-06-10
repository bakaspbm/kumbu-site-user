const RETRY_DELAYS_MS = [0, 400, 900];

export function isRetryableFetchError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const cause = (err as Error & { cause?: unknown }).cause;
  const causeMsg =
    cause instanceof Error ? `${cause.message} ${(cause as NodeJS.ErrnoException).code ?? ""}` : "";
  const blob = `${err.message} ${causeMsg}`;
  return /fetch failed|econnreset|etimedout|enotfound|aborted|socket hang up/i.test(blob);
}

export async function fetchWithRetry(
  fetchFn: typeof fetch,
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
    const delay = RETRY_DELAYS_MS[attempt];
    if (delay > 0) {
      await new Promise((r) => setTimeout(r, delay));
    }
    try {
      return await fetchFn(input, init);
    } catch (err) {
      lastError = err;
      if (!isRetryableFetchError(err)) throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("fetch failed");
}
