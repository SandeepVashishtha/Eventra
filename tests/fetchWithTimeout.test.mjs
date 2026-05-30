import assert from "node:assert/strict";

const originalFetch = global.fetch;
const originalSetTimeout = global.setTimeout;
const originalClearTimeout = global.clearTimeout;

const pendingTimers = [];
global.setTimeout = (fn, delay) => {
  const timer = { fn, delay, cleared: false };
  pendingTimers.push(timer);
  return timer;
};
global.clearTimeout = (timer) => {
  if (timer) timer.cleared = true;
};

global.console = {
  ...console,
  error: () => {},
};

const { fetchWithTimeout, FetchError } = await import(
  "../src/utils/fetchWithTimeout.js"
);

global.fetch = async (_url, options) => {
  if (options.signal?.aborted) {
    const error = new Error("Aborted");
    error.name = "AbortError";
    throw error;
  }

  return {
    ok: true,
    status: 200,
    headers: {
      get: () => "application/json",
    },
    json: async () => ({ ok: true }),
    text: async () => '{"ok":true}',
  };
};

const success = await fetchWithTimeout("https://example.com/data");
assert.deepEqual(success.data, { ok: true }, "returns parsed JSON on success");

global.fetch = async () => ({
  ok: false,
  status: 400,
  headers: { get: () => "application/json" },
  json: async () => ({ message: "Bad request" }),
  text: async () => '{"message":"Bad request"}',
});

await assert.rejects(
  () => fetchWithTimeout("https://example.com/bad"),
  (error) => error instanceof FetchError && error.status === 400,
  "throws FetchError for non-ok responses"
);

global.fetch = async (_url, options) =>
  new Promise((_resolve, reject) => {
    options.signal?.addEventListener("abort", () => {
      const error = new Error("Aborted");
      error.name = "AbortError";
      reject(error);
    });
  });

const abortController = new AbortController();
const timeoutPromise = fetchWithTimeout(
  "https://example.com/slow",
  { signal: abortController.signal },
  50
);
abortController.abort();

await assert.rejects(
  () => timeoutPromise,
  (error) => error instanceof FetchError,
  "maps aborted requests to FetchError"
);

global.fetch = async (_url, options) =>
  new Promise((resolve, reject) => {
    options.signal?.addEventListener("abort", () => {
      const error = new Error("Aborted");
      error.name = "AbortError";
      reject(error);
    });
  });

const slowRequest = fetchWithTimeout("https://example.com/timeout", {}, 10);
const timeoutTimer = pendingTimers.find((timer) => timer.delay === 10);
assert.ok(timeoutTimer, "schedules timeout abort");
timeoutTimer.fn();

await assert.rejects(
  () => slowRequest,
  (error) => error instanceof FetchError,
  "maps timed out requests to FetchError"
);

global.fetch = originalFetch;
global.setTimeout = originalSetTimeout;
global.clearTimeout = originalClearTimeout;

console.log("fetchWithTimeout tests passed ✓");
