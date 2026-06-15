import { describe, test, expect } from "vitest";
import { createRateLimiter, icsRateLimiter, registerRateLimiter } from "../../api/_lib/rateLimiter.js";

describe("registerRateLimiter", () => {
  test("allows first request under the 30/min limit", async () => {
    const key = "test-register-allow-1";
    const result = registerRateLimiter.checkAsync
      ? await registerRateLimiter.checkAsync(key)
      : registerRateLimiter.check(key);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(29);
  });

  test("returns numeric remaining count", async () => {
    const key = "test-register-remaining-1";
    const result = registerRateLimiter.checkAsync
      ? await registerRateLimiter.checkAsync(key)
      : registerRateLimiter.check(key);
    expect(typeof result.remaining).toBe("number");
  });

  test("returns epoch resetAt timestamp in the future", async () => {
    const key = "test-register-reset-1";
    const result = registerRateLimiter.checkAsync
      ? await registerRateLimiter.checkAsync(key)
      : registerRateLimiter.check(key);
    expect(typeof result.resetAt).toBe("number");
    expect(result.resetAt).toBeGreaterThan(Date.now() - 1000);
  });

  test("decrements remaining count after each request", async () => {
    const key = "test-register-decrement";
    const first = registerRateLimiter.checkAsync
      ? await registerRateLimiter.checkAsync(key)
      : registerRateLimiter.check(key);
    const second = registerRateLimiter.checkAsync
      ? await registerRateLimiter.checkAsync(key)
      : registerRateLimiter.check(key);
    expect(second.remaining).toBe(first.remaining - 1);
  });

  test("independent keys have independent counters", async () => {
    const keyA = "test-register-indep-A";
    const keyB = "test-register-indep-B";
    const resultA = registerRateLimiter.checkAsync
      ? await registerRateLimiter.checkAsync(keyA)
      : registerRateLimiter.check(keyA);
    const resultB = registerRateLimiter.checkAsync
      ? await registerRateLimiter.checkAsync(keyB)
      : registerRateLimiter.check(keyB);
    expect(resultA.remaining).toBe(resultB.remaining);
  });

  test("handles multiple simultaneous requests", async () => {
    const promises = Array.from({ length: 5 }, (_, i) => {
      const key = `test-register-concurrent-${i}`;
      return registerRateLimiter.checkAsync
        ? registerRateLimiter.checkAsync(key)
        : Promise.resolve(registerRateLimiter.check(key));
    });
    const results = await Promise.all(promises);
    results.forEach(r => expect(r.allowed).toBe(true));
  });

  test("same key counts across calls", async () => {
    const key = "test-register-samekey";
    const calls = [];
    for (let i = 0; i < 3; i++) {
      const r = registerRateLimiter.checkAsync
        ? await registerRateLimiter.checkAsync(key)
        : registerRateLimiter.check(key);
      calls.push(r);
    }
    expect(calls[0].remaining).toBeGreaterThan(calls[1].remaining);
    expect(calls[1].remaining).toBeGreaterThan(calls[2].remaining);
  });

  test("rate limiter is a configured instance", () => {
    expect(registerRateLimiter).toBeDefined();
    expect(typeof registerRateLimiter.check).toBe("function");
  });
});

describe("icsRateLimiter", () => {
  test("allows first request under the 60/min limit", async () => {
    const key = "test-ics-allow-1";
    const result = icsRateLimiter.checkAsync
      ? await icsRateLimiter.checkAsync(key)
      : icsRateLimiter.check(key);
    expect(result.allowed).toBe(true);
  });

  test("has higher limit than register rate limiter", () => {
    const registerFirst = registerRateLimiter.checkAsync
      ? registerRateLimiter.checkAsync("test-compare-register")
      : registerRateLimiter.check("test-compare-register");
    const icsFirst = icsRateLimiter.checkAsync
      ? icsRateLimiter.checkAsync("test-compare-ics")
      : icsRateLimiter.check("test-compare-ics");
    return Promise.all([registerFirst, icsFirst]).then(([reg, ics]) => {
      expect(ics.remaining).toBeGreaterThan(reg.remaining);
    });
  });

  test("returns valid response shape", async () => {
    const key = "test-ics-shape";
    const result = icsRateLimiter.checkAsync
      ? await icsRateLimiter.checkAsync(key)
      : icsRateLimiter.check(key);
    expect(result).toHaveProperty("allowed");
    expect(result).toHaveProperty("remaining");
    expect(result).toHaveProperty("resetAt");
  });

  test("rate limiter is a configured instance", () => {
    expect(icsRateLimiter).toBeDefined();
    expect(typeof icsRateLimiter.check).toBe("function");
  });
});

describe("createRateLimiter factory", () => {
  test("creates a custom limiter with specified window and max", () => {
    const custom = createRateLimiter(10_000, 3);
    expect(custom).toBeDefined();
    expect(typeof custom.check).toBe("function");
  });

  test("custom limiter enforces its max", async () => {
    const custom = createRateLimiter(60_000, 2);
    const key = "test-custom-limit";
    const first = custom.checkAsync ? await custom.checkAsync(key) : custom.check(key);
    expect(first.allowed).toBe(true);
    const second = custom.checkAsync ? await custom.checkAsync(key) : custom.check(key);
    expect(second.allowed).toBe(true);
    const third = custom.checkAsync ? await custom.checkAsync(key) : custom.check(key);
    expect(third.allowed).toBe(false);
  });
});
