import { getGlobalRateLimiter } from "./rateLimit";

export async function fetchJsonWithRetry<T>(
  url: string,
  init?: RequestInit,
  options?: { retries?: number; backoffMs?: number; rateLimit?: boolean }
): Promise<T> {
  const retries = options?.retries ?? 3;
  const backoffMs = options?.backoffMs ?? 500;
  const rateLimit = options?.rateLimit ?? true;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (rateLimit) {
        await getGlobalRateLimiter()();
      }

      const res = await fetch(url, {
        ...init,
        headers: {
          Accept: "application/json",
          ...(init?.headers ?? {}),
        },
      });

      if (res.status === 429 || res.status === 503) {
        const retryAfter = res.headers.get("retry-after");
        const wait =
          retryAfter && !Number.isNaN(Number(retryAfter))
            ? Number(retryAfter) * 1000
            : backoffMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
          `HTTP ${res.status} ${res.statusText} — ${url} — ${body.slice(0, 300)}`
        );
      }

      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
      if (attempt >= retries) break;
      const wait = backoffMs * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, wait));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`fetchJsonWithRetry failed for ${url}`);
}

