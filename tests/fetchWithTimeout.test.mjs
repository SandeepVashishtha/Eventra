import assert from "node:assert/strict";

// Mock fetch
let mockFetchResult = null;
let mockFetchError = null;
let lastFetchArgs = null;

global.fetch = async (url, options) => {
  lastFetchArgs = { url, options };
  if (mockFetchError) {
    throw mockFetchError;
  }
  return mockFetchResult;
};

// Import fetchWithTimeout and FetchError
import { fetchWithTimeout, FetchError } from "../src/utils/fetchWithTimeout.js";

// Helper to construct mock headers
const mockHeaders = (contentType) => ({
  get: (name) => {
    if (name.toLowerCase() === "content-type") {
      return contentType;
    }
    return null;
  }
});

// Test JSON success response
mockFetchError = null;
mockFetchResult = {
  ok: true,
  status: 200,
  headers: mockHeaders("application/json"),
  json: async () => ({ status: "success" })
};

let res = await fetchWithTimeout("https://api.example.com/data");
assert.equal(res.response.status, 200, "JSON success status is 200");
assert.deepEqual(res.data, { status: "success" }, "JSON body parses correctly");

// Test plain text success response
mockFetchResult = {
  ok: true,
  status: 200,
  headers: mockHeaders("text/plain"),
  text: async () => "plain text"
};
res = await fetchWithTimeout("https://api.example.com/text");
assert.equal(res.data, "plain text", "plain text body parses correctly");

// Test failed response throws FetchError
mockFetchResult = {
  ok: false,
  status: 400,
  headers: mockHeaders("application/json"),
  json: async () => ({ message: "Bad Request" })
};

try {
  await fetchWithTimeout("https://api.example.com/error");
  assert.fail("Should have thrown FetchError");
} catch (err) {
  assert.ok(err instanceof FetchError, "Throws FetchError instance");
  assert.equal(err.status, 400, "FetchError has status 400");
  assert.equal(err.message, "Bad Request", "FetchError message matches response JSON message");
}

// Test timeout rejection
global.fetch = async (url, options) => {
  return new Promise((resolve, reject) => {
    const handleAbort = () => {
      const err = new Error("The operation was aborted.");
      err.name = "AbortError";
      reject(err);
    };
    if (options.signal.aborted) {
      handleAbort();
    } else {
      options.signal.addEventListener("abort", handleAbort);
    }
  });
};

try {
  await fetchWithTimeout("https://api.example.com/timeout", {}, 50);
  assert.fail("Should have aborted");
} catch (err) {
  assert.ok(err instanceof FetchError, "Throws FetchError on abort/timeout");
  assert.ok(err.message.includes("timed out"), "Message mentions timeout");
}

console.log("fetchWithTimeout tests passed ✓");
