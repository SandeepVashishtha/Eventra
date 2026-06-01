import assert from "node:assert/strict";

import {
  isSafeRetryMethod,
  shouldRetryApiRequest,
} from "../src/utils/retryPolicy.js";

const runWithRetryPolicy = async ({ method, request, maxRetries = 1 }) => {
  let retryCount = 0;

  while (true) {
    try {
      return await request();
    } catch (error) {
      if (!shouldRetryApiRequest({ method, error, retryCount, maxRetries })) {
        throw error;
      }
      retryCount += 1;
    }
  }
};

assert.equal(isSafeRetryMethod("GET"), true, "GET is retry-safe");
assert.equal(isSafeRetryMethod("HEAD"), true, "HEAD is retry-safe");
assert.equal(isSafeRetryMethod("OPTIONS"), true, "OPTIONS is retry-safe");
assert.equal(isSafeRetryMethod("POST"), false, "POST is not retry-safe");
assert.equal(isSafeRetryMethod("PUT"), false, "PUT is not retry-safe");
assert.equal(isSafeRetryMethod("PATCH"), false, "PATCH is not retry-safe");
assert.equal(isSafeRetryMethod("DELETE"), false, "DELETE is not retry-safe");

assert.equal(
  shouldRetryApiRequest({
    method: "GET",
    error: { isNetworkError: true },
  }),
  true,
  "GET retries network failures"
);

assert.equal(
  shouldRetryApiRequest({
    method: "GET",
    error: { code: "ECONNABORTED", message: "timeout exceeded" },
  }),
  true,
  "GET retries timeouts"
);

assert.equal(
  shouldRetryApiRequest({
    method: "GET",
    error: { response: { status: 503 } },
  }),
  true,
  "GET retries temporary server errors"
);

for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
  assert.equal(
    shouldRetryApiRequest({
      method,
      error: { isNetworkError: true },
    }),
    false,
    `${method} does not retry network failures`
  );

  assert.equal(
    shouldRetryApiRequest({
      method,
      error: { code: "ECONNABORTED", message: "timeout exceeded" },
    }),
    false,
    `${method} does not retry timeouts`
  );

  assert.equal(
    shouldRetryApiRequest({
      method,
      error: { response: { status: 503 } },
    }),
    false,
    `${method} does not retry temporary server errors`
  );
}

let getAttempts = 0;
const getResult = await runWithRetryPolicy({
  method: "GET",
  request: async () => {
    getAttempts += 1;
    if (getAttempts === 1) {
      throw { isNetworkError: true };
    }
    return { ok: true };
  },
});

assert.deepEqual(getResult, { ok: true }, "GET succeeds after retry");
assert.equal(getAttempts, 2, "GET is attempted once plus one retry");

let postAttempts = 0;
await assert.rejects(
  runWithRetryPolicy({
    method: "POST",
    request: async () => {
      postAttempts += 1;
      throw { isNetworkError: true };
    },
  })
);

assert.equal(postAttempts, 1, "failed POST is attempted only once");

console.log("api retry policy tests passed");
