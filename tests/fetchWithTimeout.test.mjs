import assert from "node:assert/strict";
import { fetchWithTimeout, FetchError } from "../src/utils/fetchWithTimeout.js";

// Mock implementation of global.fetch
const originalFetch = global.fetch;

try {
  // Test Case 1: Successful JSON Response
  global.fetch = async (url, options) => {
    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ success: true })
    };
  };
  
  const res1 = await fetchWithTimeout("https://api.example.com/json");
  assert.deepEqual(res1.data, { success: true }, "Should parse successful JSON data");
  assert.equal(res1.response.status, 200, "Should contain the raw response object");
  
  // Test Case 2: Successful Text Response (non-JSON)
  global.fetch = async (url, options) => {
    return {
      ok: true,
      status: 200,
      headers: { get: () => "text/plain" },
      text: async () => "plain text content"
    };
  };
  
  const res2 = await fetchWithTimeout("https://api.example.com/text");
  assert.equal(res2.data, "plain text content", "Should fallback to plain text parsing");

  // Test Case 3: Failed request (non-ok response)
  global.fetch = async (url, options) => {
    return {
      ok: false,
      status: 404,
      headers: { get: () => "application/json" },
      json: async () => ({ message: "Not Found" })
    };
  };
  
  await assert.rejects(
    async () => {
      await fetchWithTimeout("https://api.example.com/notfound");
    },
    (err) => {
      assert(err instanceof FetchError, "Should throw FetchError");
      assert.equal(err.status, 404);
      assert.deepEqual(err.data, { message: "Not Found" });
      return true;
    },
    "Should reject with FetchError on non-ok response"
  );

  // Test Case 4: Aborted request via timeout (throws AbortError which translates to FetchError)
  global.fetch = async (url, options) => {
    const signal = options.signal;
    return new Promise((resolve, reject) => {
      const onAbort = () => {
        const error = new Error("The operation was aborted.");
        error.name = "AbortError";
        reject(error);
      };
      if (signal.aborted) {
        onAbort();
      } else {
        signal.addEventListener("abort", onAbort);
      }
    });
  };

  await assert.rejects(
    async () => {
      await fetchWithTimeout("https://api.example.com/delay", {}, 10);
    },
    (err) => {
      assert(err instanceof FetchError);
      assert(err.message.includes("timed out"));
      return true;
    },
    "Should throw FetchError on timeout"
  );

  // Test Case 5: Manual abort signal
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 10);

  await assert.rejects(
    async () => {
      await fetchWithTimeout("https://api.example.com/delay", { signal: controller.signal }, 100);
    },
    (err) => {
      assert(err instanceof FetchError);
      assert(err.message.includes("manually aborted"));
      return true;
    },
    "Should throw FetchError on manual abort"
  );

  console.log("fetchWithTimeout tests passed ✓");
} finally {
  global.fetch = originalFetch;
}
