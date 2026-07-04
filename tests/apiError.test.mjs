import assert from "node:assert/strict";
import { ApiError, RateLimitError, CSRFError, normalizeApiError } from "../src/config/api/errors.js";

try {
  // --- ApiError construction ---
  const err1 = new ApiError("Something went wrong");
  assert.equal(err1.message, "Something went wrong");
  assert.equal(err1.name, "ApiError");
  assert.equal(err1.status, null);
  assert.equal(err1.data, null);
  assert.equal(err1.isTimeout, false);
  assert.equal(err1.isNetworkError, false);
  assert.ok(err1 instanceof Error);

  const err2 = new ApiError("Not found", { status: 404, data: { detail: "missing" } });
  assert.equal(err2.status, 404);
  assert.deepEqual(err2.data, { detail: "missing" });

  const err3 = new ApiError("Timed out", { isTimeout: true, isNetworkError: false });
  assert.equal(err3.isTimeout, true);
  assert.equal(err3.isNetworkError, false);

  const err4 = new ApiError("Network down", { isNetworkError: true });
  assert.equal(err4.isNetworkError, true);

  // --- RateLimitError ---
  const rateErr = new RateLimitError("Too fast");
  assert.equal(rateErr.name, "RateLimitError");
  assert.equal(rateErr.status, 429);
  assert.ok(rateErr instanceof ApiError);

  const rateErr2 = new RateLimitError("Custom", { data: { retryAfter: 30 } });
  assert.equal(rateErr2.status, 429);
  assert.deepEqual(rateErr2.data, { retryAfter: 30 });

  // --- CSRFError ---
  const csrfErr = new CSRFError("Invalid token");
  assert.equal(csrfErr.name, "CSRFError");
  assert.equal(csrfErr.status, 403);
  assert.ok(csrfErr instanceof ApiError);

  // --- normalizeApiError: timeout detection ---
  const timeoutErr = { code: "ECONNABORTED", config: { method: "get", url: "/events", timeout: 5000 } };
  const normalized = normalizeApiError(timeoutErr);
  assert.equal(normalized.name, "ApiError");
  assert.equal(normalized.isTimeout, true);
  assert.ok(normalized.message.includes("timed out"));
  assert.ok(normalized.message.includes("after 5s"), "timeout should be shown in seconds");
  assert.ok(!normalized.message.includes("after 5000s"), "timeout must not show raw milliseconds");

  const defaultTimeoutErr = { code: "ECONNABORTED", config: { method: "get", url: "/events" } };
  const defaultNormalized = normalizeApiError(defaultTimeoutErr);
  assert.ok(defaultNormalized.message.includes("after 15s"));

  // --- normalizeApiError: network error (no response) ---
  const netErr = { message: "Failed to fetch", config: { method: "post", url: "/api/login" } };
  const normalizedNet = normalizeApiError(netErr);
  assert.equal(normalizedNet.isNetworkError, true);

  // --- normalizeApiError: rate limit (429) ---
  const rateLimitErr = {
    response: { status: 429, data: { message: "Slow down" } },
    config: {},
  };
  const normalizedRate = normalizeApiError(rateLimitErr);
  assert.equal(normalizedRate.name, "RateLimitError");
  assert.equal(normalizedRate.status, 429);

  // --- normalizeApiError: generic response error ---
  const genericErr = {
    response: { status: 500, data: { message: "Server error" } },
    config: {},
  };
  const normalizedGeneric = normalizeApiError(genericErr);
  assert.equal(normalizedGeneric.name, "ApiError");
  assert.equal(normalizedGeneric.status, 500);
  assert.equal(normalizedGeneric.data.message, "Server error");

  console.log("ApiError tests passed ✓");
} catch (error) {
  console.error("Test failed:", error);
  process.exit(1);
}
