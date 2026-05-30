import assert from "node:assert/strict";
import {
  apiUtils,
  isRetryableMethod,
  normalizeHttpMethod,
  shouldRetryRequest,
} from "../src/config/api.js";
import { requestValidation } from "../src/utils/validationApi.js";

const retryableError = { response: { status: 503 } };

assert.equal(normalizeHttpMethod("get"), "GET");
assert.equal(normalizeHttpMethod("Post"), "POST");
assert.equal(normalizeHttpMethod(undefined), "GET");

assert.equal(isRetryableMethod("GET"), true);
assert.equal(isRetryableMethod("head"), true);
assert.equal(isRetryableMethod("OPTIONS"), true);
assert.equal(isRetryableMethod("POST"), false);
assert.equal(isRetryableMethod("patch"), false);
assert.equal(isRetryableMethod("PUT"), false);
assert.equal(isRetryableMethod("DELETE"), false);

assert.equal(shouldRetryRequest({ method: "GET" }, retryableError), true);
assert.equal(shouldRetryRequest({ method: "HEAD" }, retryableError), true);
assert.equal(shouldRetryRequest({ method: "OPTIONS" }, retryableError), true);
assert.equal(shouldRetryRequest({ method: "POST" }, retryableError), false);
assert.equal(shouldRetryRequest({ method: "PATCH" }, retryableError), false);
assert.equal(shouldRetryRequest({ method: "GET" }, { response: { status: 400 } }), false);
assert.equal(
  shouldRetryRequest({ method: "GET", _retryCount: 1 }, retryableError, { maxRetries: 1 }),
  false,
);

const originalApiUtils = {
  get: apiUtils.get,
  post: apiUtils.post,
  patch: apiUtils.patch,
};

try {
  let getCalls = 0;
  apiUtils.get = async () => {
    getCalls += 1;
    if (getCalls === 1) {
      throw { status: 503, data: { message: "Temporarily unavailable" } };
    }
    return {
      json: async () => ({ available: true }),
    };
  };

  const getResult = await requestValidation("/api/validate/email/a", {
    method: "GET",
    retries: 1,
    retryDelayMs: 0,
  });

  assert.equal(getResult.isValid, true);
  assert.equal(getCalls, 2, "GET validation requests should retry transient failures");

  let postCalls = 0;
  apiUtils.post = async () => {
    postCalls += 1;
    throw { status: 503, data: { message: "Temporarily unavailable" } };
  };

  const postResult = await requestValidation("/api/validate/phone", {
    method: "POST",
    body: { phone: "555" },
    retries: 1,
    retryDelayMs: 0,
  });

  assert.equal(postResult.isValid, false);
  assert.equal(postCalls, 1, "POST validation requests must not retry automatically");

  let patchCalls = 0;
  apiUtils.patch = async () => {
    patchCalls += 1;
    throw { status: 503, data: { message: "Temporarily unavailable" } };
  };

  const patchResult = await requestValidation("/api/validate/example", {
    method: "PATCH",
    body: { value: "x" },
    retries: 1,
    retryDelayMs: 0,
  });

  assert.equal(patchResult.isValid, false);
  assert.equal(patchCalls, 1, "PATCH validation requests must not retry automatically");
} finally {
  apiUtils.get = originalApiUtils.get;
  apiUtils.post = originalApiUtils.post;
  apiUtils.patch = originalApiUtils.patch;
}

console.log("api retry policy tests passed");
