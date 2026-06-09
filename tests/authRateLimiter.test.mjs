import assert from "node:assert/strict";

const { createRateLimiter, enforceRateLimit } = await import(
  "../api/lib/rateLimiter.js"
);

// --- createRateLimiter: allows up to maxRequests then blocks ---
{
  const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 3 });

  const r1 = limiter.check("1.1.1.1");
  const r2 = limiter.check("1.1.1.1");
  const r3 = limiter.check("1.1.1.1");
  const r4 = limiter.check("1.1.1.1");

  assert.equal(r1.allowed, true, "first request allowed");
  assert.equal(r2.allowed, true, "second request allowed");
  assert.equal(r3.allowed, true, "third request allowed");
  assert.equal(r4.allowed, false, "fourth request blocked");
  assert.ok(r4.retryAfter >= 1, "blocked response includes retryAfter seconds");
  assert.equal(r4.remaining, 0, "no remaining requests when blocked");
}

// --- separate keys are tracked independently ---
{
  const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 1 });

  assert.equal(limiter.check("a").allowed, true, "key a first allowed");
  assert.equal(limiter.check("a").allowed, false, "key a second blocked");
  assert.equal(
    limiter.check("b").allowed,
    true,
    "key b unaffected by key a"
  );
}

// --- reset clears a single key ---
{
  const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 1 });

  limiter.check("x");
  assert.equal(limiter.check("x").allowed, false, "x blocked after limit");
  limiter.reset("x");
  assert.equal(
    limiter.check("x").allowed,
    true,
    "x allowed again after reset"
  );
}

// --- missing key falls back to a stable identifier ---
{
  const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 1 });
  assert.equal(limiter.check(undefined).allowed, true, "undefined key allowed once");
  assert.equal(
    limiter.check(undefined).allowed,
    false,
    "undefined key blocked on second call (stable bucket)"
  );
}

// --- enforceRateLimit writes 429 with headers when blocked ---
{
  const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 1 });

  function makeRes() {
    return {
      statusCode: null,
      headers: {},
      body: null,
      setHeader(name, value) {
        this.headers[name] = value;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };
  }

  const okRes = makeRes();
  const allowed = enforceRateLimit(limiter, "9.9.9.9", okRes);
  assert.equal(allowed, true, "first call permitted");
  assert.equal(okRes.statusCode, null, "no error status on allowed request");
  assert.equal(
    okRes.headers["X-RateLimit-Limit"],
    "1",
    "limit header set on allowed request"
  );

  const blockedRes = makeRes();
  const blocked = enforceRateLimit(limiter, "9.9.9.9", blockedRes);
  assert.equal(blocked, false, "second call blocked");
  assert.equal(blockedRes.statusCode, 429, "blocked request returns 429");
  assert.ok(
    blockedRes.headers["Retry-After"],
    "Retry-After header present when blocked"
  );
  assert.equal(
    blockedRes.body.error,
    "Too many requests",
    "blocked body reports error"
  );
}

console.log("auth rate limiter tests passed ✓");
