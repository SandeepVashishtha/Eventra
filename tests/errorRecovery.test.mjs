import assert from "node:assert/strict";

Object.defineProperty(globalThis, "navigator", {
  value: { onLine: true },
  configurable: true,
});
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
};

const {
  categorizeError,
  ERROR_CATEGORIES,
  getErrorRecoveryCopy,
  isRecoverableError,
} = await import("../src/utils/errorRecovery.js");

assert.equal(
  categorizeError(new Error("Failed to fetch dynamically imported module")),
  ERROR_CATEGORIES.ASSET,
);

const networkError = new Error("Network Error");
networkError.isNetworkError = true;
assert.equal(categorizeError(networkError), ERROR_CATEGORIES.NETWORK);

const apiError = new Error("Request failed");
apiError.status = 503;
assert.equal(categorizeError(apiError, { type: "api" }), ERROR_CATEGORIES.API);
assert.equal(isRecoverableError(ERROR_CATEGORIES.API, apiError), true);

assert.match(getErrorRecoveryCopy(ERROR_CATEGORIES.ROUTE).title, /page/i);

console.log("error recovery categorization tests passed");
