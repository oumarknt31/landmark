import type { MiddlewareHandler } from 'hono';

/**
 * In-memory token-bucket rate limiter. One bucket per identifier (typically
 * the caller's IP). Survives only the process lifetime — fine for a single
 * Render instance; would need a shared store (Redis) for horizontal scale.
 */

interface Bucket {
  tokens: number;
  lastRefill: number;
}

interface BucketConfig {
  capacity: number;       // max tokens
  refillPerHour: number;  // tokens added per hour
}

const buckets = new Map<string, Bucket>();

function take(key: string, cfg: BucketConfig, cost: number): boolean {
  const now = Date.now();
  const ratePerMs = cfg.refillPerHour / 3_600_000;
  const existing = buckets.get(key);
  const bucket: Bucket = existing
    ? { ...existing }
    : { tokens: cfg.capacity, lastRefill: now };

  const elapsed = now - bucket.lastRefill;
  bucket.tokens = Math.min(cfg.capacity, bucket.tokens + elapsed * ratePerMs);
  bucket.lastRefill = now;

  if (bucket.tokens < cost) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.tokens -= cost;
  buckets.set(key, bucket);
  return true;
}

/** Hono middleware factory. Keys on `x-forwarded-for` (Render sets this). */
export function rateLimit(cfg: BucketConfig, cost = 1): MiddlewareHandler {
  return async (c, next) => {
    const fwd = c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip');
    const key = (fwd ?? 'unknown').split(',')[0].trim();
    if (!take(key, cfg, cost)) {
      return c.json(
        { error: 'Rate limit exceeded. Try again later.' },
        429,
      );
    }
    await next();
    return;
  };
}
