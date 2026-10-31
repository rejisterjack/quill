import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

const limiters = new Map<string, Ratelimit>();

function limiterFor(limit: number, windowMs: number): Ratelimit | null {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  const key = `${limit}:${windowMs}`;
  const existing = limiters.get(key);
  if (existing) return existing;
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const created = new Ratelimit({
    redis: new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    prefix: "quill",
  });
  limiters.set(key, created);
  return created;
}

export async function checkRateLimit(
  identifier: string,
  options: { limit?: number; windowMs?: number } = {},
): Promise<{ success: boolean; remaining: number; resetMs: number }> {
  const limit = options.limit || 30;
  const windowMs = options.windowMs || 60 * 1000;
  const limiter = limiterFor(limit, windowMs);
  if (!limiter) {
    if (env.NODE_ENV === "production") {
      throw new Error("UPSTASH_REDIS_REST_URL is required in production");
    }
    return { success: true, remaining: limit, resetMs: windowMs };
  }
  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    resetMs: Math.max(0, result.reset - Date.now()),
  };
}
