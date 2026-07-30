/**
 * Test Setup for Node Runner (.mjs tests)
 *
 * Provides global mocks and polyfills needed by the .mjs test files
 * that run directly with Node (not through Vitest/jsdom).
 * Import this at the top of each test file or use --require / --import.
 */

import { TextDecoder, TextEncoder } from "util";

if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === "undefined") {
  globalThis.TextDecoder = TextDecoder;
}

if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

if (typeof globalThis.fetch === "undefined") {
  globalThis.fetch = async () => {
    throw new Error(
      "fetch is not available in this test environment. Mock it per test."
    );
  };
}
if (typeof globalThis.Headers === "undefined") {
  globalThis.Headers = class Headers {
    constructor(init) {
      this._map = new Map();
      if (init && typeof init === "object") {
        for (const [k, v] of Object.entries(init)) {
          this._map.set(k.toLowerCase(), String(v));
        }
      }
    }
    get(key) {
      return this._map.get(key.toLowerCase()) || null;
    }
    set(key, value) {
      this._map.set(key.toLowerCase(), String(value));
    }
    has(key) {
      return this._map.has(key.toLowerCase());
    }
    delete(key) {
      this._map.delete(key.toLowerCase());
    }
    forEach(cb) {
      this._map.forEach((v, k) => cb(v, k, this));
    }
    append(key, value) {
      const existing = this.get(key);
      this.set(key, existing ? `${existing}, ${value}` : value);
    }
    [Symbol.iterator]() {
      return this._map[Symbol.iterator]();
    }
  };
}
if (typeof globalThis.Request === "undefined") {
  globalThis.Request = class MockRequest {
    constructor(input, init) {
      this._url = typeof input === "string" ? input : input.url;
      this._method = (init?.method || "GET").toUpperCase();
      this._headers = new Headers(init?.headers);
      this._body = init?.body || null;
    }
    get url() {
      return this._url;
    }
    get method() {
      return this._method;
    }
    get headers() {
      return this._headers;
    }
    get body() {
      return this._body;
    }
  };
}
if (typeof globalThis.Response === "undefined") {
  globalThis.Response = class MockResponse {
    constructor(body, init) {
      this._body = body;
      this._status = init?.status || 200;
      this._statusText = init?.statusText || "";
      this._headers = new Headers(init?.headers);
    }
    get status() {
      return this._status;
    }
    get statusText() {
      return this._statusText;
    }
    get headers() {
      return this._headers;
    }
    get body() {
      return this._body;
    }
    async text() {
      return String(this._body || "");
    }
    async json() {
      return JSON.parse(this._body || "null");
    }
  };
}
if (typeof globalThis.URLPattern === "undefined") {
  globalThis.URLPattern = class MockURLPattern {};
}

process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.VITE_API_URL = process.env.VITE_API_URL || "/api";
