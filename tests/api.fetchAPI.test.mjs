import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// Regression for #19095: fetchAPI built a merged `headers` object
// (Content-Type + auth + caller headers) but then spread `...options` AFTER
// it, so any caller-supplied `options.headers` replaced the entire `headers`
// object — discarding Content-Type and Authorization. The first caller to
// pass custom headers (multipart, CSRF, Idempotency-Key) would lose auth on
// every request. This test calls fetchAPI with custom headers and asserts the
// defaults are retained AND the caller headers are merged on top.

let capturedUrl, capturedInit;
let storedToken = null;

globalThis.fetch = async (url, init) => {
  capturedUrl = url;
  capturedInit = init;
  return { ok: true, status: 200, json: async () => ({ ok: true }) };
};

// getAuthHeader() reads the global `localStorage` when `window` is defined.
// In node we shim the minimal surface it touches (global + window).
globalThis.window = globalThis.window || {};
const localStorageShim = {
  getItem: (k) => (k === "eventra_token" ? storedToken : null),
  setItem: (k, v) => { storedToken = v; },
  removeItem: () => { storedToken = null; },
};
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: localStorageShim,
});
Object.defineProperty(globalThis.window, "localStorage", {
  configurable: true,
  value: localStorageShim,
});

const { fetchAPI } = await import("../src/lib/api.js");

describe("fetchAPI merges per-request headers over defaults (#19095)", () => {
  beforeEach(() => { capturedUrl = capturedInit = undefined; });
  afterEach(() => { storedToken = null; });

  it("retains Content-Type and Authorization when caller passes custom headers", async () => {
    storedToken = "tok-123";
    await fetchAPI("/api/x", {
      method: "POST",
      headers: { "Idempotency-Key": "abc", "X-Custom": "v" },
      body: JSON.stringify({ a: 1 }),
    });

    const headers = new Headers(capturedInit.headers);
    assert.equal(headers.get("Content-Type"), "application/json");
    assert.equal(headers.get("Authorization"), "Bearer tok-123");
    assert.equal(headers.get("Idempotency-Key"), "abc");
    assert.equal(headers.get("X-Custom"), "v");
    // non-header options still flow through
    assert.equal(capturedInit.method, "POST");
    assert.equal(capturedInit.body, JSON.stringify({ a: 1 }));
  });

  it("works without custom headers (Content-Type + Authorization only)", async () => {
    storedToken = "tok-456";
    await fetchAPI("/api/y");
    const headers = new Headers(capturedInit.headers);
    assert.equal(headers.get("Content-Type"), "application/json");
    assert.equal(headers.get("Authorization"), "Bearer tok-456");
  });

  it("does not include Authorization when no token is stored", async () => {
    storedToken = null;
    await fetchAPI("/api/z", { headers: { "X-Trace": "1" } });
    const headers = new Headers(capturedInit.headers);
    assert.equal(headers.get("Authorization"), null);
    assert.equal(headers.get("X-Trace"), "1");
    assert.equal(headers.get("Content-Type"), "application/json");
  });
});
