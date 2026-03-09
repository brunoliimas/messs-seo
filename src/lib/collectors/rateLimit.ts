export type RateLimiter = () => Promise<void>;

export function createRateLimiter(minTimeMs: number): RateLimiter {
  let last = 0;
  let chain = Promise.resolve();

  return async () => {
    chain = chain.then(async () => {
      const now = Date.now();
      const wait = Math.max(0, last + minTimeMs - now);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      last = Date.now();
    });
    await chain;
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __messsRateLimiter: RateLimiter | undefined;
}

export function getGlobalRateLimiter(): RateLimiter {
  if (!globalThis.__messsRateLimiter) {
    globalThis.__messsRateLimiter = createRateLimiter(1000);
  }
  return globalThis.__messsRateLimiter;
}

