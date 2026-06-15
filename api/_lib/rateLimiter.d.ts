export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  error?: string;
}

export class InMemoryRateLimiter {
  windowMs: number;
  maxRequests: number;
  store: Map<string, { start: number; count: number }>;

  constructor(windowMs: number, maxRequests: number);
  check(key: string): RateLimitResult;
  checkAsync(key: string): Promise<RateLimitResult>;
}

export class DistributedRateLimiter {
  windowMs: number;
  maxRequests: number;

  constructor(windowMs: number, maxRequests: number);
  check(key: string): never; // Always throws sync check error
  checkAsync(key: string): Promise<RateLimitResult>;
}

export interface FailClosedLimiter {
  check(): never;
  checkAsync(): never;
}

export function createRateLimiter(
  windowMs: number,
  maxRequests: number
): InMemoryRateLimiter | DistributedRateLimiter | FailClosedLimiter;

export const loginRateLimiter: InMemoryRateLimiter | DistributedRateLimiter | FailClosedLimiter;
export const signupRateLimiter: InMemoryRateLimiter | DistributedRateLimiter | FailClosedLimiter;
export const registerRateLimiter: InMemoryRateLimiter | DistributedRateLimiter | FailClosedLimiter;
export const icsRateLimiter: InMemoryRateLimiter | DistributedRateLimiter | FailClosedLimiter;

export function enforceRateLimit(
  limiter: InMemoryRateLimiter | DistributedRateLimiter | FailClosedLimiter,
  key: string
): Promise<RateLimitResult>;

export function validateRateLimitConfig(): boolean;

export function closeRateLimitStorage(): Promise<void>;
