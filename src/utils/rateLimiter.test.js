import { createRateLimiter, withRateLimit } from "./rateLimiter";

describe("createRateLimiter", () => {
  describe("construction validation", () => {
    it("throws RangeError when refillRate is 0", () => {
      expect(() => createRateLimiter({ maxTokens: 5, refillRate: 0 })).toThrow(
        RangeError
      );
      expect(() => createRateLimiter({ maxTokens: 5, refillRate: 0 })).toThrow(
        /refillRate/
      );
    });

    it("throws RangeError when refillRate is negative", () => {
      expect(() =>
        createRateLimiter({ maxTokens: 5, refillRate: -1 })
      ).toThrow(RangeError);
    });

    it("throws RangeError when refillRate is Infinity", () => {
      expect(() =>
        createRateLimiter({ maxTokens: 5, refillRate: Infinity })
      ).toThrow(RangeError);
    });

    it("throws RangeError when refillRate is NaN", () => {
      expect(() =>
        createRateLimiter({ maxTokens: 5, refillRate: NaN })
      ).toThrow(RangeError);
    });

    it("throws RangeError when maxTokens is 0", () => {
      expect(() => createRateLimiter({ maxTokens: 0, refillRate: 1 })).toThrow(
        RangeError
      );
      expect(() => createRateLimiter({ maxTokens: 0, refillRate: 1 })).toThrow(
        /maxTokens/
      );
    });

    it("throws RangeError when maxTokens is negative", () => {
      expect(() =>
        createRateLimiter({ maxTokens: -5, refillRate: 1 })
      ).toThrow(RangeError);
    });

    it("creates a limiter successfully with valid options", () => {
      expect(() =>
        createRateLimiter({ maxTokens: 10, refillRate: 2 })
      ).not.toThrow();
    });
  });

  describe("tryConsume", () => {
    it("returns true and consumes a token when available", () => {
      const limiter = createRateLimiter({ maxTokens: 3, refillRate: 1 });
      expect(limiter.tryConsume()).toBe(true);
      expect(limiter.getTokens()).toBe(2);
    });

    it("returns false when the bucket is empty", () => {
      const limiter = createRateLimiter({
        maxTokens: 1,
        refillRate: 1,
        initialTokens: 0,
      });
      expect(limiter.tryConsume()).toBe(false);
    });

    it("exhausts all tokens then rejects", () => {
      const limiter = createRateLimiter({
        maxTokens: 3,
        refillRate: 1,
        initialTokens: 3,
      });
      expect(limiter.tryConsume()).toBe(true);
      expect(limiter.tryConsume()).toBe(true);
      expect(limiter.tryConsume()).toBe(true);
      expect(limiter.tryConsume()).toBe(false);
    });

    it("throws RangeError when cost is 0", () => {
      const limiter = createRateLimiter({ maxTokens: 5, refillRate: 1 });
      expect(() => limiter.tryConsume(0)).toThrow(RangeError);
    });

    it("throws RangeError when cost is negative", () => {
      const limiter = createRateLimiter({ maxTokens: 5, refillRate: 1 });
      expect(() => limiter.tryConsume(-1)).toThrow(RangeError);
    });
  });

  describe("getRetryAfterMs", () => {
    it("returns 0 when tokens are available", () => {
      const limiter = createRateLimiter({ maxTokens: 5, refillRate: 2 });
      expect(limiter.getRetryAfterMs()).toBe(0);
    });

    it("returns a positive finite number when bucket is empty", () => {
      const limiter = createRateLimiter({
        maxTokens: 1,
        refillRate: 1,
        initialTokens: 0,
      });
      const ms = limiter.getRetryAfterMs();
      expect(ms).toBeGreaterThan(0);
      expect(Number.isFinite(ms)).toBe(true);
      // With refillRate=1 token/s and deficit=1, should be ~1000ms
      expect(ms).toBeLessThanOrEqual(1100);
    });

    it("never returns Infinity even when bucket is empty", () => {
      const limiter = createRateLimiter({
        maxTokens: 5,
        refillRate: 0.001, // very slow refill
        initialTokens: 0,
      });
      const ms = limiter.getRetryAfterMs();
      expect(ms).not.toBe(Infinity);
      expect(Number.isFinite(ms)).toBe(true);
    });

    it("returns a value consistent with refillRate", () => {
      // refillRate=2 tokens/s, 1 deficit → ~500ms
      const limiter = createRateLimiter({
        maxTokens: 5,
        refillRate: 2,
        initialTokens: 0,
      });
      const ms = limiter.getRetryAfterMs();
      expect(ms).toBeGreaterThan(0);
      expect(ms).toBeLessThanOrEqual(600); // allow small scheduling variance
    });
  });

  describe("reset", () => {
    it("restores the bucket to maxTokens", () => {
      const limiter = createRateLimiter({ maxTokens: 3, refillRate: 1 });
      limiter.tryConsume();
      limiter.tryConsume();
      limiter.reset();
      expect(limiter.getTokens()).toBe(3);
    });
  });
});

describe("withRateLimit", () => {
  it("throws TypeError when first argument is not a function", () => {
    expect(() => withRateLimit("not a function")).toThrow(TypeError);
  });

  it("allows calls within the rate limit", async () => {
    const fn = jest.fn().mockResolvedValue("ok");
    const limited = withRateLimit(fn, { maxTokens: 3, refillRate: 1 });
    await expect(limited()).resolves.toBe("ok");
    await expect(limited()).resolves.toBe("ok");
  });

  it("throws an error with a finite seconds value when rate limited", async () => {
    const fn = jest.fn().mockResolvedValue("ok");
    const limited = withRateLimit(fn, {
      maxTokens: 1,
      refillRate: 1,
      initialTokens: 1,
    });
    await limited(); // consume the one token
    await expect(limited()).rejects.toThrow(/Please wait/);
    await expect(limited()).rejects.toThrow(/second/);
    // Must NOT contain "Infinity"
    try {
      await limited();
    } catch (err) {
      expect(err.message).not.toContain("Infinity");
    }
  });

  it("rejects construction when refillRate is 0", () => {
    expect(() =>
      withRateLimit(jest.fn(), { maxTokens: 5, refillRate: 0 })
    ).toThrow(RangeError);
  });
});
