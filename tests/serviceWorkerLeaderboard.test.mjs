import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const swPath = path.resolve(__dirname, "../public/service-worker.js");
const swCode = fs.readFileSync(swPath, "utf8");

// --- Global mocks for Service Worker context ---
const fetchListeners = [];
let mockClients = [];
const mockCacheStore = new Map();
let currentFetchMock = null;
let loggedMessages = [];

// Mock Response class
class MockResponse {
  constructor(body, init = {}) {
    this._body = body;
    this.status = init.status ?? 200;
    this.statusText = init.statusText ?? "OK";
    
    let headersMap = new Map();
    if (init.headers) {
      if (init.headers instanceof Map) {
        init.headers.forEach((v, k) => headersMap.set(k, v));
      } else if (init.headers instanceof MockHeaders) {
        init.headers.map.forEach((v, k) => headersMap.set(k, v));
      } else {
        Object.entries(init.headers).forEach(([k, v]) => headersMap.set(k, v));
      }
    }
    this.headers = headersMap;
  }

  get body() {
    return this._body;
  }

  clone() {
    return new MockResponse(this._body, {
      status: this.status,
      statusText: this.statusText,
      headers: new Map(this.headers)
    });
  }

  async text() {
    return typeof this._body === "string"
      ? this._body
      : JSON.stringify(this._body);
  }

  async json() {
    const txt = await this.text();
    return JSON.parse(txt);
  }
}

// Mock Headers class
class MockHeaders {
  constructor(init = {}) {
    this.map = new Map();
    if (init) {
      if (init instanceof MockHeaders) {
        init.map.forEach((v, k) => this.map.set(k, v));
      } else if (init instanceof Map) {
        init.forEach((v, k) => this.map.set(k, v));
      } else {
        Object.entries(init).forEach(([k, v]) => this.map.set(k, v));
      }
    }
  }
  get(key) {
    return this.map.get(key) || null;
  }
  set(key, val) {
    this.map.set(key, String(val));
  }
  append(key, val) {
    this.map.set(key, String(val));
  }
}

// Mock Cache implementation
const mockCache = {
  match: async (request) => {
    const url = typeof request === "string" ? request : request.url;
    return mockCacheStore.get(url) || null;
  },
  put: async (request, response) => {
    const url = typeof request === "string" ? request : request.url;
    mockCacheStore.set(url, response.clone());
  }
};

// Define self (global scope)
globalThis.self = {
  location: {
    origin: "https://eventra.test",
    pathname: "/",
    hostname: "localhost"
  },
  addEventListener: (event, callback) => {
    if (event === "fetch") {
      fetchListeners.push(callback);
    }
  },
  clients: {
    matchAll: async () => mockClients
  }
};

// Define caches (global scope)
globalThis.caches = {
  open: async () => mockCache,
  match: async (request) => mockCache.match(request)
};

// Define global headers, response, request, fetch
globalThis.Headers = MockHeaders;
globalThis.Response = MockResponse;
globalThis.fetch = async (req, init) => {
  if (currentFetchMock) {
    return currentFetchMock(req, init);
  }
  throw new Error("No fetch mock defined!");
};
globalThis.console.log = (...args) => {
  loggedMessages.push(args.join(" "));
};

// Run the service worker code to register the event listeners
const runSW = new Function(
  "self",
  "caches",
  "fetch",
  "Headers",
  "Response",
  swCode
);
runSW(self, caches, fetch, Headers, Response);

// Helper to simulate a fetch event
const dispatchFetchEvent = async (url, method = "GET") => {
  let respondedWithPromise = null;
  const event = {
    request: {
      url,
      method,
      clone() {
        return { url, method };
      }
    },
    respondWith(promise) {
      respondedWithPromise = promise;
    }
  };

  // Find the first registered listener that calls respondWith
  for (const listener of fetchListeners) {
    listener(event);
    if (respondedWithPromise) {
      break;
    }
  }

  return respondedWithPromise;
};

// --- Test Case Functions ---

const testInitialCaching = async () => {
  mockCacheStore.clear();
  const mockRankings = {
    status: 200,
    data: [{ rank: 1, username: "dev_bob", points: 100 }]
  };

  currentFetchMock = async (req) => {
    assert.equal(req.url, "https://eventra.test/api/leaderboard");
    return new MockResponse(JSON.stringify(mockRankings), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };

  const responsePromise = await dispatchFetchEvent("https://eventra.test/api/leaderboard");
  const response = await responsePromise;
  assert.equal(response.status, 200);

  const json = await response.json();
  assert.deepEqual(json, mockRankings);

  // Verify cache has been populated with custom timestamp header
  const cached = mockCacheStore.get("https://eventra.test/api/leaderboard");
  assert.ok(cached);
  const cachedAt = cached.headers.get("x-sw-cached-at");
  assert.ok(cachedAt);
  assert.ok(Date.now() - parseInt(cachedAt, 10) < 5000);
  console.log("✔ Initial cache miss successfully fetches and caches rankings");
};

const testCacheHitFresh = async () => {
  const freshTime = Date.now() - 10000; // 10 seconds ago
  const cachedRankings = {
    status: 200,
    data: [{ rank: 1, username: "dev_bob", points: 100 }]
  };

  const cachedHeaders = new MockHeaders();
  cachedHeaders.set("x-sw-cached-at", freshTime.toString());
  const cachedResponse = new MockResponse(JSON.stringify(cachedRankings), {
    status: 200,
    headers: cachedHeaders
  });

  mockCacheStore.set("https://eventra.test/api/leaderboard", cachedResponse);

  // Setup fetch to fail if called (it shouldn't be called for fresh cache)
  currentFetchMock = () => {
    assert.fail("Fetch should not be called when cache is fresh");
  };

  const responsePromise = await dispatchFetchEvent("https://eventra.test/api/leaderboard");
  const response = await responsePromise;
  assert.equal(response.status, 200);

  const json = await response.json();
  assert.deepEqual(json, cachedRankings);
  console.log("✔ Cache hit for fresh data returns immediately without network request");
};

const testCacheHitStaleSameData = async () => {
  const staleTime = Date.now() - 70000; // 70 seconds ago
  const cachedRankings = {
    status: 200,
    data: [{ rank: 1, username: "dev_bob", points: 100 }]
  };

  const cachedHeaders = new MockHeaders();
  cachedHeaders.set("x-sw-cached-at", staleTime.toString());
  const cachedResponse = new MockResponse(JSON.stringify(cachedRankings), {
    status: 200,
    headers: cachedHeaders
  });

  mockCacheStore.set("https://eventra.test/api/leaderboard", cachedResponse);

  let fetchCalled = false;
  currentFetchMock = async () => {
    fetchCalled = true;
    return new MockResponse(JSON.stringify(cachedRankings), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };

  let clientMessageSent = false;
  mockClients = [{
    postMessage: () => {
      clientMessageSent = true;
    }
  }];

  const responsePromise = await dispatchFetchEvent("https://eventra.test/api/leaderboard");
  const response = await responsePromise;
  assert.equal(response.status, 200);

  // Verify stale response returned immediately
  const json = await response.json();
  assert.deepEqual(json, cachedRankings);

  // Give background revalidation a moment to complete
  await new Promise((resolve) => setTimeout(resolve, 50));

  assert.ok(fetchCalled);
  assert.ok(!clientMessageSent, "No update client message should be sent if data did not change");

  // Verify cache timestamp was updated to mark it fresh
  const cached = mockCacheStore.get("https://eventra.test/api/leaderboard");
  const cachedAt = cached.headers.get("x-sw-cached-at");
  assert.ok(Date.now() - parseInt(cachedAt, 10) < 5000);
  console.log("✔ Cache hit for stale data returns immediately, revalidates background, updates timestamp");
};

const testCacheHitStaleNewData = async () => {
  const staleTime = Date.now() - 70000; // 70 seconds ago
  const cachedRankings = {
    status: 200,
    data: [{ rank: 1, username: "dev_bob", points: 100 }]
  };
  const newRankings = {
    status: 200,
    data: [
      { rank: 1, username: "dev_bob", points: 100 },
      { rank: 2, username: "dev_alice", points: 90 }
    ]
  };

  const cachedHeaders = new MockHeaders();
  cachedHeaders.set("x-sw-cached-at", staleTime.toString());
  const cachedResponse = new MockResponse(JSON.stringify(cachedRankings), {
    status: 200,
    headers: cachedHeaders
  });

  mockCacheStore.set("https://eventra.test/api/leaderboard", cachedResponse);

  let fetchCalled = false;
  currentFetchMock = async () => {
    fetchCalled = true;
    return new MockResponse(JSON.stringify(newRankings), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };

  let receivedMsg = null;
  mockClients = [{
    postMessage: (msg) => {
      receivedMsg = msg;
    }
  }];

  const responsePromise = await dispatchFetchEvent("https://eventra.test/api/leaderboard");
  const response = await responsePromise;
  assert.equal(response.status, 200);

  // Give background revalidation a moment to complete
  await new Promise((resolve) => setTimeout(resolve, 50));

  assert.ok(fetchCalled);
  assert.ok(receivedMsg);
  assert.equal(receivedMsg.type, "LEADERBOARD_UPDATED");
  assert.deepEqual(receivedMsg.data, newRankings.data);

  // Verify cache was updated with new data and fresh timestamp
  const cached = mockCacheStore.get("https://eventra.test/api/leaderboard");
  const cachedAt = cached.headers.get("x-sw-cached-at");
  assert.ok(Date.now() - parseInt(cachedAt, 10) < 5000);
  const cachedJson = await cached.json();
  assert.deepEqual(cachedJson, newRankings);
  console.log("✔ Cache hit for stale data revalidates background, updates cache, and dispatches change event");
};

const testOfflineFallbackCacheMiss = async () => {
  mockCacheStore.clear();
  currentFetchMock = async () => {
    throw new Error("TypeError: Failed to fetch");
  };

  const responsePromise = await dispatchFetchEvent("https://eventra.test/api/leaderboard");
  const response = await responsePromise;
  assert.equal(response.status, 503);

  const json = await response.json();
  assert.ok(json.error.includes("offline"));
  console.log("✔ Cache miss when offline returns elegant 503 error JSON response");
};

const testOfflineFallbackCacheHit = async () => {
  const staleTime = Date.now() - 70000;
  const cachedRankings = {
    status: 200,
    data: [{ rank: 1, username: "dev_bob", points: 100 }]
  };

  const cachedHeaders = new MockHeaders();
  cachedHeaders.set("x-sw-cached-at", staleTime.toString());
  const cachedResponse = new MockResponse(JSON.stringify(cachedRankings), {
    status: 200,
    headers: cachedHeaders
  });

  mockCacheStore.set("https://eventra.test/api/leaderboard", cachedResponse);

  currentFetchMock = async () => {
    throw new Error("TypeError: Failed to fetch");
  };

  const responsePromise = await dispatchFetchEvent("https://eventra.test/api/leaderboard");
  const response = await responsePromise;
  assert.equal(response.status, 200);

  const json = await response.json();
  assert.deepEqual(json, cachedRankings);
  console.log("✔ Stale cache hit when offline gracefully falls back to cached data");
};

const testSensitivePathNeverCached = async () => {
  mockCacheStore.clear();
  const mockMeData = {
    rank: 5,
    username: "user_me",
    points: 50
  };

  currentFetchMock = async (req) => {
    assert.equal(req.url, "https://eventra.test/api/leaderboard/me");
    return new MockResponse(JSON.stringify(mockMeData), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };

  const responsePromise = await dispatchFetchEvent("https://eventra.test/api/leaderboard/me");
  const response = await responsePromise;
  assert.equal(response.status, 200);

  // Verify response is NOT in the cache store
  assert.equal(mockCacheStore.size, 0);
  console.log("✔ Sensitive path /api/leaderboard/me is never cached by service worker");
};

// --- Test Suite Execution ---
const runTests = async () => {
  console.log("Starting service worker leaderboard caching tests...");

  await testInitialCaching();
  await testCacheHitFresh();
  await testCacheHitStaleSameData();
  await testCacheHitStaleNewData();
  await testOfflineFallbackCacheMiss();
  await testOfflineFallbackCacheHit();
  await testSensitivePathNeverCached();

  console.log("All service worker leaderboard caching tests passed successfully! ✓");
};

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
