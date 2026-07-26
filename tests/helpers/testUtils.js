/**
 * Reusable Test Utilities for Eventra Test Suite
 *
 * Provides mock factories, assertion helpers, and common setup
 * functions used across multiple .mjs test files.
 */

import assert from "node:assert/strict";

/**
 * Creates an in-memory localStorage mock.
 * @param {object} [initial] - Initial key-value pairs
 * @returns {{ getItem: Function, setItem: Function, removeItem: Function, clear: Function, getAll: Function }}
 */
export function createLocalStorageMock(initial = {}) {
  const store = { ...initial };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key)
        ? store[key]
        : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    },
    getAll() {
      return { ...store };
    },
  };
}

/**
 * Creates a mock sessionStorage instance.
 * @param {object} [initial] - Initial key-value pairs
 * @returns {{ getItem: Function, setItem: Function, removeItem: Function, clear: Function }}
 */
export function createSessionStorageMock(initial = {}) {
  return createLocalStorageMock(initial);
}

/**
 * Installs a global localStorage mock for tests that need it.
 * @param {object} [initial] - Initial localStorage data
 */
export function installLocalStorageMock(initial = {}) {
  const mock = createLocalStorageMock(initial);
  globalThis.localStorage = mock;
  globalThis.sessionStorage = createSessionStorageMock();
  return mock;
}

/**
 * Creates a mock fetch function with controllable responses.
 * @param {object} responses - Map of URL patterns to response configs
 * @returns {Function} Mock fetch function
 */
export function createFetchMock(responses = {}) {
  return async (url, options = {}) => {
    const urlStr = typeof url === "string" ? url : url.url;
    const method = (options.method || "GET").toUpperCase();

    for (const [pattern, config] of Object.entries(responses)) {
      if (urlStr.includes(pattern)) {
        const status = config.status || 200;
        const body = config.body || "";
        const headers = config.headers || {};

        if (config.matchMethod && config.matchMethod !== method) {
          continue;
        }

        if (config.validate) {
          const validation = config.validate(url, options);
          if (validation instanceof Error) throw validation;
        }

        return {
          ok: status >= 200 && status < 300,
          status,
          statusText: status === 200 ? "OK" : "Error",
          headers: {
            get: (name) => headers[name.toLowerCase()] || null,
            forEach: (cb) =>
              Object.entries(headers).forEach(([k, v]) => cb(v, k)),
          },
          async text() {
            return String(body);
          },
          async json() {
            return typeof body === "string" ? JSON.parse(body) : body;
          },
        };
      }
    }

    return {
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: { get: () => null, forEach: () => {} },
      async text() {
        return "Not Found";
      },
      async json() {
        return { error: "Not Found" };
      },
    };
  };
}

/**
 * Waits for a condition to be true, with timeout.
 * @param {Function} condition - Function that returns truthy when ready
 * @param {number} [timeout=1000] - Max wait time in ms
 * @param {number} [interval=10] - Poll interval in ms
 * @returns {Promise<void>}
 */
export async function waitFor(condition, timeout = 1000, interval = 10) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (condition()) return;
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error(`waitFor timed out after ${timeout}ms`);
}

/**
 * Asserts that a value matches a snapshot-like string.
 * Useful for checking serialized output formats.
 * @param {*} actual - The actual value
 * @param {string} expected - The expected string
 */
export function assertMatches(actual, expected) {
  const actualStr =
    typeof actual === "string" ? actual : JSON.stringify(actual, null, 2);
  assert.equal(actualStr, expected);
}

/**
 * Asserts that a function throws an error with a matching message.
 * @param {Function} fn - Function that should throw
 * @param {RegExp|string} messagePattern - Expected error message
 */
export function assertThrows(fn, messagePattern) {
  try {
    fn();
    assert.fail("Expected function to throw");
  } catch (error) {
    if (messagePattern instanceof RegExp) {
      assert.match(error.message, messagePattern);
    } else {
      assert.equal(error.message, messagePattern);
    }
  }
}

/**
 * Creates a mock Date that returns a fixed timestamp.
 * @param {string|number} [isoString] - Fixed date string or timestamp
 * @returns {Function} Restore function
 */
export function mockDate(isoString = "2026-01-15T12:00:00.000Z") {
  const fixed = new Date(isoString);
  const OriginalDate = globalThis.Date;
  class MockDate extends OriginalDate {
    constructor(...args) {
      if (args.length === 0) return fixed;
      return new OriginalDate(...args);
    }
    static now() {
      return fixed.getTime();
    }
  }
  globalThis.Date = MockDate;
  return () => {
    globalThis.Date = OriginalDate;
  };
}

export function createConsoleMock() {
  const calls = { log: [], warn: [], error: [], info: [] };
  const restore = {};
  for (const method of ["log", "warn", "error", "info"]) {
    const original = console[method];
    console[method] = (...args) => {
      calls[method].push(args);
    };
    restore[method] = () => {
      console[method] = original;
    };
  }
  return {
    calls,
    restore: () => {
      for (const method of Object.keys(restore)) {
        restore[method]();
      }
    },
    assertCalled(method, expectedCount) {
      assert.ok(
        calls[method].length >= expectedCount,
        `Expected console.${method} to be called at least ${expectedCount} times, got ${calls[method].length}`
      );
    },
  };
}
