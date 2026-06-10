import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRateLimiter } from "../api/middleware/rateLimiter.js";

describe("middleware rateLimiter", () => {
  it("should rate limit requests exceeding max limit", async () => {
    const limiter = createRateLimiter({ windowMs: 50, max: 2 });
    let callCount = 0;
    const mockHandler = async (req, res) => {
      callCount++;
      res.status(200).json({ ok: true });
    };

    const rateLimitedHandler = limiter(mockHandler);

    const makeReq = (ip) => ({
      method: "POST",
      headers: { "x-real-ip": ip },
    });

    const makeRes = () => {
      const res = {
        _status: null,
        _body: null,
        _headers: {},
        status(code) {
          this._status = code;
          return this;
        },
        json(body) {
          this._body = body;
          return this;
        },
        setHeader(key, val) {
          this._headers[key] = val;
        },
      };
      return res;
    };

    // Request 1
    const res1 = makeRes();
    await rateLimitedHandler(makeReq("1.2.3.4"), res1);
    assert.equal(res1._status, 200);

    // Request 2
    const res2 = makeRes();
    await rateLimitedHandler(makeReq("1.2.3.4"), res2);
    assert.equal(res2._status, 200);

    // Request 3 (should block)
    const res3 = makeRes();
    await rateLimitedHandler(makeReq("1.2.3.4"), res3);
    assert.equal(res3._status, 429);
    assert.equal(res3._body.error, "Too many authentication attempts. Please try again later.");
    assert.equal(callCount, 2);
  });

  it("should evict stale entries to prevent memory leaks", async () => {
    const limiter = createRateLimiter({ windowMs: 10, max: 1 });
    const mockHandler = async (req, res) => {
      res.status(200).json({ ok: true });
    };

    const rateLimitedHandler = limiter(mockHandler);

    const makeReq = (ip) => ({
      method: "POST",
      headers: { "x-real-ip": ip },
    });

    const makeRes = () => ({
      status: () => ({ json: () => {} }),
      setHeader: () => {},
    });

    // Make request from IP A
    await rateLimitedHandler(makeReq("1.1.1.1"), makeRes());

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Make request from IP B (this should trigger evictStale and clean up IP A)
    await rateLimitedHandler(makeReq("2.2.2.2"), makeRes());

    // Now request from IP A should be allowed again without triggering 429
    const res = {
      _status: null,
      status(code) {
        this._status = code;
        return this;
      },
      json() {},
      setHeader() {},
    };
    await rateLimitedHandler(makeReq("1.1.1.1"), res);
    assert.equal(res._status, 200);
  });
});
