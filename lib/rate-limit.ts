/**
 * High-performance sliding-window rate limiter for production edge and server routes.
 * Protects against API bill abuse and DDoS attempts.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  memoryStore.forEach((record, key) => {
    const valid = record.timestamps.filter((ts: number) => now - ts < 60000);
    if (valid.length === 0) {
      memoryStore.delete(key);
    } else {
      record.timestamps = valid;
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  limit?: number; // max requests
  windowMs?: number; // time window in milliseconds
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { success: boolean; remaining: number; resetMs: number } {
  const limit = options.limit || 30; // default: 30 requests
  const windowMs = options.windowMs || 60 * 1000; // default: per 1 minute
  const now = Date.now();

  const record = memoryStore.get(identifier) || { timestamps: [] };
  // Filter out timestamps outside the active window
  const activeTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (activeTimestamps.length >= limit) {
    const oldestTimestamp = activeTimestamps[0];
    const resetMs = windowMs - (now - oldestTimestamp);
    return {
      success: false,
      remaining: 0,
      resetMs: Math.max(0, resetMs),
    };
  }

  activeTimestamps.push(now);
  memoryStore.set(identifier, { timestamps: activeTimestamps });

  return {
    success: true,
    remaining: limit - activeTimestamps.length,
    resetMs: windowMs,
  };
}
