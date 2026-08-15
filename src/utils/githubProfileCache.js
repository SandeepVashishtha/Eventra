/**
 * ============================================================================
 * EVENTRA ENTERPRISE GITHUB PROFILE CACHING & ORCHESTRATION SERVICE
 * ============================================================================
 * 
 * Architecture Overview:
 * ──────────────────────
 * 1. Multi-Tiered Cache Architecture:
 *    - L1 Cache: In-memory LRU Map for sub-millisecond lookups.
 *    - L2 Cache: Asynchronous IndexedDB storage for cross-session survival.
 * 2. GitHub API Compliance & Rate Limit Engine:
 *    - Inspects `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
 *    - Automatically pauses background queues when secondary rate limits hit.
 * 3. Prioritized Sliding-Window Request Pool:
 *    - Supports Priority Queuing (e.g., HIGH for visible UI, LOW for background prefetch).
 *    - Dynamic worker allocation without rigid batch boundary locking.
 * 4. Request Collapsing & Network Resiliency:
 *    - Deduplicates identical concurrent requests into a single promise.
 *    - Exponential backoff with jitter and `AbortController` stream teardowns.
 * 5. Negative Caching & Data Sanitization:
 *    - Short TTL caching for 404/500 errors to prevent rate-limit burnout.
 *    - Schema normalization for raw GitHub API payloads.
 * 6. Observability & Telemetry Engine:
 *    - Pub/Sub metrics emitter tracking hit ratios, throughput, and error rates.
 */

// ============================================================================
// SECTION 1: CONSTANTS & DEFAULT CONFIGURATIONS
// ============================================================================

export const CONFIG = Object.freeze({
  /** L1 In-Memory LRU Capacity */
  L1_MAX_CAPACITY: 300,
  /** L1 Valid Profile Time-To-Live (30 Minutes) */
  L1_TTL_MS: 30 * 60 * 1000,
  /** L1 Negative/Error Entry Time-To-Live (2 Minutes) */
  L1_ERROR_TTL_MS: 2 * 60 * 1000,
  /** L2 Persistent IndexedDB Database Name */
  L2_DB_NAME: "Eventra_GitHub_Profile_Cache_v1",
  /** L2 Object Store Name */
  L2_STORE_NAME: "profiles",
  /** Default Network Request Timeout (10 Seconds) */
  DEFAULT_TIMEOUT_MS: 10000,
  /** Maximum Network Retries on Transient Failures */
  MAX_RETRIES: 2,
  /** Base Backoff Delay for Retries (500ms) */
  INITIAL_RETRY_DELAY_MS: 500,
  /** Maximum Concurrency Pool Size */
  DEFAULT_CONCURRENCY: 6,
  /** Minimum Rate Limit Threshold to Pause Prefetching */
  RATE_LIMIT_SAFETY_MARGIN: 5,
});

/** Priority level for request scheduling */
export const Priority = Object.freeze({
  HIGH: 0,   // Active viewport rendering
  MEDIUM: 1, // Next-page carousel items
  LOW: 2,    // Background prefetching
});

/** Processing status for cache entries */
export const CacheEntryStatus = Object.freeze({
  FRESH: "FRESH",
  STALE: "STALE",
  EXPIRED: "EXPIRED",
  MISS: "MISS",
  ERROR: "ERROR",
});

// ============================================================================
// SECTION 2: CUSTOM ERROR CLASSES
// ============================================================================

export class ProfileCacheError extends Error {
  constructor(message, code = "UNKNOWN_ERROR", details = null) {
    super(message);
    this.name = "ProfileCacheError";
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class GitHubRateLimitError extends ProfileCacheError {
  constructor(message, resetTimeEpochSeconds, limit, remaining) {
    super(message, "RATE_LIMIT_EXCEEDED", {
      resetTimeEpochSeconds,
      limit,
      remaining,
      resetDate: new Date(resetTimeEpochSeconds * 1000).toISOString(),
    });
    this.name = "GitHubRateLimitError";
  }
}

export class RequestTimeoutError extends ProfileCacheError {
  constructor(username, timeoutMs) {
    super(
      `Request for username '${username}' timed out after ${timeoutMs}ms`,
      "TIMEOUT",
      { username, timeoutMs }
    );
    this.name = "RequestTimeoutError";
  }
}

// ============================================================================
// SECTION 3: EVENT EMITTER & TELEMETRY ENGINE
// ============================================================================

class MetricsTelemetryEngine {
  constructor() {
    this.listeners = new Map();
    this.metrics = {
      l1Hits: 0,
      l2Hits: 0,
      networkRequests: 0,
      cacheMisses: 0,
      errors: 0,
      rateLimitBlocks: 0,
      bytesReceived: 0,
    };
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, payload) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`[Telemetry] Subscriber error on '${event}':`, e);
        }
      });
    }
  }

  recordHit(tier) {
    if (tier === "L1") this.metrics.l1Hits++;
    if (tier === "L2") this.metrics.l2Hits++;
    this.emit("metric:updated", this.getSummary());
  }

  recordMiss() {
    this.metrics.cacheMisses++;
    this.emit("metric:updated", this.getSummary());
  }

  recordNetworkRequest() {
    this.metrics.networkRequests++;
    this.emit("metric:updated", this.getSummary());
  }

  recordError(error) {
    this.metrics.errors++;
    this.emit("error", error);
    this.emit("metric:updated", this.getSummary());
  }

  recordRateLimit() {
    this.metrics.rateLimitBlocks++;
    this.emit("rateLimit:triggered", this.getSummary());
  }

  getSummary() {
    const totalLookups =
      this.metrics.l1Hits + this.metrics.l2Hits + this.metrics.cacheMisses;
    const hitRate =
      totalLookups > 0
        ? ((this.metrics.l1Hits + this.metrics.l2Hits) / totalLookups) * 100
        : 0;

    return {
      ...this.metrics,
      totalLookups,
      hitRatePercentage: Number(hitRate.toFixed(2)),
    };
  }

  reset() {
    this.metrics = {
      l1Hits: 0,
      l2Hits: 0,
      networkRequests: 0,
      cacheMisses: 0,
      errors: 0,
      rateLimitBlocks: 0,
      bytesReceived: 0,
    };
    this.emit("metric:updated", this.getSummary());
  }
}

export const telemetry = new MetricsTelemetryEngine();

// ============================================================================
// SECTION 4: GITHUB RATE LIMIT TRACKER
// ============================================================================

class RateLimitTracker {
  constructor() {
    this.limit = 60;
    this.remaining = 60;
    this.resetEpochSeconds = 0;
    this.isPaused = false;
  }

  updateFromHeaders(headers) {
    if (!headers) return;

    const limitHeader = headers.get("X-RateLimit-Limit");
    const remainingHeader = headers.get("X-RateLimit-Remaining");
    const resetHeader = headers.get("X-RateLimit-Reset");

    if (limitHeader) this.limit = parseInt(limitHeader, 10);
    if (remainingHeader) this.remaining = parseInt(remainingHeader, 10);
    if (resetHeader) this.resetEpochSeconds = parseInt(resetHeader, 10);

    if (this.remaining <= CONFIG.RATE_LIMIT_SAFETY_MARGIN) {
      this.isPaused = true;
      telemetry.recordRateLimit();
    } else {
      this.isPaused = false;
    }
  }

  canMakeRequest() {
    const nowEpochSeconds = Math.floor(Date.now() / 1000);
    if (this.resetEpochSeconds > 0 && nowEpochSeconds >= this.resetEpochSeconds) {
      // Reset period expired; assume restored quota
      this.remaining = this.limit;
      this.isPaused = false;
      return true;
    }
    return this.remaining > CONFIG.RATE_LIMIT_SAFETY_MARGIN;
  }

  getWaitTimeMs() {
    const nowEpochSeconds = Math.floor(Date.now() / 1000);
    if (this.resetEpochSeconds <= nowEpochSeconds) return 0;
    return (this.resetEpochSeconds - nowEpochSeconds) * 1000;
  }

  getState() {
    return {
      limit: this.limit,
      remaining: this.remaining,
      resetEpochSeconds: this.resetEpochSeconds,
      isPaused: this.isPaused,
      resetDate: new Date(this.resetEpochSeconds * 1000).toISOString(),
    };
  }
}

export const rateLimitTracker = new RateLimitTracker();

// ============================================================================
// SECTION 5: L2 PERSISTENT INDEXEDDB STORAGE ADAPTER
// ============================================================================

class L2IndexedDBAdapter {
  constructor() {
    this.dbPromise = null;
    this.isSupported =
      typeof window !== "undefined" && "indexedDB" in window;
  }

  async getDB() {
    if (!this.isSupported) return null;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(
          CONFIG.L2_DB_NAME,
          1
        );

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(CONFIG.L2_STORE_NAME)) {
            const store = db.createObjectStore(CONFIG.L2_STORE_NAME, {
              keyPath: "username",
            });
            store.createIndex("fetchedAt", "fetchedAt", { unique: false });
          }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => {
          console.warn("[L2Cache] Failed to open IndexedDB:", event.target.error);
          resolve(null);
        };
      } catch (err) {
        console.warn("[L2Cache] IndexedDB initialization exception:", err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  async get(username) {
    const db = await this.getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(CONFIG.L2_STORE_NAME, "readonly");
        const store = transaction.objectStore(CONFIG.L2_STORE_NAME);
        const request = store.get(username.toLowerCase());

        request.onsuccess = () => {
          const result = request.result;
          if (!result) return resolve(null);

          // Check expiration
          const ttl = result.isError ? CONFIG.L1_ERROR_TTL_MS : CONFIG.L1_TTL_MS;
          if (Date.now() - result.fetchedAt > ttl) {
            this.delete(username); // Async eviction
            return resolve(null);
          }

          resolve(result);
        };

        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async set(username, data, isError = false) {
    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(CONFIG.L2_STORE_NAME, "readwrite");
        const store = transaction.objectStore(CONFIG.L2_STORE_NAME);
        const entry = {
          username: username.toLowerCase(),
          data,
          fetchedAt: Date.now(),
          isError,
        };

        const request = store.put(entry);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  async delete(username) {
    const db = await this.getDB();
    if (!db) return;

    try {
      const transaction = db.transaction(CONFIG.L2_STORE_NAME, "readwrite");
      const store = transaction.objectStore(CONFIG.L2_STORE_NAME);
      store.delete(username.toLowerCase());
    } catch {}
  }

  async clear() {
    const db = await this.getDB();
    if (!db) return;

    try {
      const transaction = db.transaction(CONFIG.L2_STORE_NAME, "readwrite");
      const store = transaction.objectStore(CONFIG.L2_STORE_NAME);
      store.clear();
    } catch {}
  }
}

const l2Cache = new L2IndexedDBAdapter();

// ============================================================================
// SECTION 6: L1 IN-MEMORY LRU CACHE MANAGER
// ============================================================================

class L1MemoryLRUCache {
  constructor(capacity = CONFIG.L1_MAX_CAPACITY) {
    this.capacity = capacity;
    /** @type {Map<string, { data: object, fetchedAt: number, isError: boolean }>} */
    this.cache = new Map();
  }

  get(username) {
    if (!username) return null;
    const key = username.trim().toLowerCase();
    const entry = this.cache.get(key);

    if (!entry) return null;

    const ttl = entry.isError ? CONFIG.L1_ERROR_TTL_MS : CONFIG.L1_TTL_MS;
    const isExpired = Date.now() - entry.fetchedAt > ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU ordering
    this.cache.delete(key);
    this.cache.set(key, entry);

    if (entry.isError) return null; // Hide raw error entries from standard getter

    return entry.data;
  }

  getRaw(username) {
    if (!username) return null;
    return this.cache.get(username.trim().toLowerCase()) || null;
  }

  set(username, data, isError = false) {
    if (!username) return;
    const key = username.trim().toLowerCase();

    const entry = {
      data,
      fetchedAt: Date.now(),
      isError,
    };

    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict oldest entry (first item in Map iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, entry);
  }

  has(username) {
    const key = username.trim().toLowerCase();
    return this.cache.has(key);
  }

  delete(username) {
    if (!username) return;
    this.cache.delete(username.trim().toLowerCase());
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

const l1Cache = new L1MemoryLRUCache();

// ============================================================================
// SECTION 7: GITHUB PAYLOAD NORMALIZER & SCHEMA VALIDATOR
// ============================================================================

/**
 * Normalizes raw GitHub API user response into minimal display payload
 */
export const normalizeGitHubProfile = (raw) => {
  if (!raw || typeof raw !== "object") {
    throw new ProfileCacheError("Invalid raw GitHub payload", "INVALID_PAYLOAD");
  }

  return {
    id: raw.id ?? null,
    login: raw.login ?? "",
    username: raw.login ?? "",
    name: raw.name ?? raw.login ?? "",
    avatarUrl: raw.avatar_url ?? "",
    bio: raw.bio ?? "",
    location: raw.location ?? "",
    company: raw.company ?? "",
    blog: raw.blog ?? "",
    publicRepos: raw.public_repos ?? 0,
    followers: raw.followers ?? 0,
    following: raw.following ?? 0,
    htmlUrl: raw.html_url ?? `https://github.com/${raw.login || ""}`,
    updatedAt: raw.updated_at ?? new Date().toISOString(),
  };
};

// ============================================================================
// SECTION 8: NETWORK TRANSPORT & REQUEST COLLAPSING
// ============================================================================

/** @type {Map<string, Promise<object>>} In-flight request deduplication store */
const inFlightRequests = new Map();

/**
 * Executes a single fetch with exponential backoff retries and signal teardown
 */
const fetchProfileFromNetwork = async (
  username,
  customFetcher = null,
  options = {}
) => {
  const {
    timeoutMs = CONFIG.DEFAULT_TIMEOUT_MS,
    maxRetries = CONFIG.MAX_RETRIES,
    signal: externalSignal,
  } = options;

  let attempt = 0;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    let isTimeout = false;

    const timeoutId = setTimeout(() => {
      isTimeout = true;
      controller.abort();
    }, timeoutMs);

    const handleExternalAbort = () => controller.abort();
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else externalSignal.addEventListener("abort", handleExternalAbort);
    }

    try {
      telemetry.recordNetworkRequest();

      let result;
      if (typeof customFetcher === "function") {
        result = await customFetcher(username, controller.signal);
      } else {
        const url = `https://api.github.com/users/${encodeURIComponent(username)}`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        });

        rateLimitTracker.updateFromHeaders(response.headers);

        if (!response.ok) {
          if (response.status === 403 || response.status === 429) {
            throw new GitHubRateLimitError(
              `Rate limit exceeded for GitHub API`,
              rateLimitTracker.resetEpochSeconds,
              rateLimitTracker.limit,
              rateLimitTracker.remaining
            );
          }
          throw new ProfileCacheError(
            `GitHub API error: ${response.status} ${response.statusText}`,
            `HTTP_${response.status}`
          );
        }

        const rawJson = await response.json();
        result = normalizeGitHubProfile(rawJson);
      }

      return result;
    } catch (error) {
      if (error.name === "AbortError" || controller.signal.aborted) {
        if (isTimeout) {
          throw new RequestTimeoutError(username, timeoutMs);
        }
        throw new ProfileCacheError("Request aborted by caller", "ABORTED");
      }

      // Retry condition for transient failures (exclude rate limits & 404s)
      const isRateLimit = error instanceof GitHubRateLimitError;
      const is404 = error.code === "HTTP_404";

      if (attempt < maxRetries && !isRateLimit && !is404) {
        attempt++;
        const backoffDelay =
          CONFIG.INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1) +
          Math.random() * 100;
        await new Promise((res) => setTimeout(res, backoffDelay));
        continue;
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
      if (externalSignal) {
        externalSignal.removeEventListener("abort", handleExternalAbort);
      }
    }
  }
};

// ============================================================================
// SECTION 9: PRIORITIZED WORKER QUEUE & SLIDING-WINDOW POOL
// ============================================================================

class PrioritizedWorkerQueue {
  constructor(concurrency = CONFIG.DEFAULT_CONCURRENCY) {
    this.concurrency = concurrency;
    this.runningCount = 0;
    /** @type {Array<{ id: string, priority: number, task: Function, resolve: Function, reject: Function }>} */
    this.queue = [];
  }

  enqueue(id, priority, task) {
    return new Promise((resolve, reject) => {
      // Check if task already queued, update priority if higher
      const existing = this.queue.find((item) => item.id === id);
      if (existing) {
        if (priority < existing.priority) {
          existing.priority = priority; // Elevate priority
          this.sortQueue();
        }
        // Chain promises
        const prevResolve = existing.resolve;
        const prevReject = existing.reject;
        existing.resolve = (val) => {
          prevResolve(val);
          resolve(val);
        };
        existing.reject = (err) => {
          prevReject(err);
          reject(err);
        };
        return;
      }

      this.queue.push({ id, priority, task, resolve, reject });
      this.sortQueue();
      this.processNext();
    });
  }

  sortQueue() {
    this.queue.sort((a, b) => a.priority - b.priority);
  }

  async processNext() {
    if (
      this.runningCount >= this.concurrency ||
      this.queue.length === 0 ||
      !rateLimitTracker.canMakeRequest()
    ) {
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    this.runningCount++;

    try {
      const result = await item.task();
      item.resolve(result);
    } catch (err) {
      item.reject(err);
    } finally {
      this.runningCount--;
      this.processNext(); // Continuous sliding window worker fill
    }
  }

  clear() {
    this.queue.forEach((item) =>
      item.reject(new ProfileCacheError("Worker queue cleared", "QUEUE_CLEARED"))
    );
    this.queue = [];
  }
}

const requestQueue = new PrioritizedWorkerQueue();

// ============================================================================
// SECTION 10: PUBLIC CORE SERVICE API
// ============================================================================

/**
 * Retrieves profile from L1 memory or L2 persistent cache synchronously/asynchronously.
 *
 * @param {string} username
 * @returns {Promise<object|null>}
 */
export async function getCachedProfile(username) {
  if (!username) return null;
  const normalizedKey = username.trim().toLowerCase();

  // 1. Try L1 Cache
  const l1Result = l1Cache.get(normalizedKey);
  if (l1Result) {
    telemetry.recordHit("L1");
    return l1Result;
  }

  // 2. Try L2 Cache
  const l2Entry = await l2Cache.get(normalizedKey);
  if (l2Entry && !l2Entry.isError) {
    // Populate L1 cache for subsequent synchronous reads
    l1Cache.set(normalizedKey, l2Entry.data, false);
    telemetry.recordHit("L2");
    return l2Entry.data;
  }

  telemetry.recordMiss();
  return null;
}

/**
 * Manually populates L1 and L2 profile cache entries.
 *
 * @param {string} username
 * @param {object} profileData
 * @param {boolean} [isError=false]
 */
export async function setCachedProfile(username, profileData, isError = false) {
  if (!username) return;
  const normalizedKey = username.trim().toLowerCase();

  l1Cache.set(normalizedKey, profileData, isError);
  await l2Cache.set(normalizedKey, profileData, isError);
}

/**
 * Main profile fetch function with caching, deduplication, queueing, and network transport.
 *
 * @param {string} username - GitHub username
 * @param {object} [options={}] - Execution options
 * @param {Function} [options.fetcher] - Optional custom fetch provider
 * @param {number} [options.priority=Priority.HIGH] - Execution priority
 * @param {number} [options.timeoutMs] - Request timeout limit
 * @param {AbortSignal} [options.signal] - Optional external AbortSignal
 * @returns {Promise<object>} Normalized GitHub Profile
 */
export async function fetchProfileWithCache(username, options = {}) {
  if (!username || typeof username !== "string") {
    throw new ProfileCacheError("Username is required", "INVALID_ARGUMENT");
  }

  const normalizedKey = username.trim().toLowerCase();
  const {
    fetcher = null,
    priority = Priority.HIGH,
    timeoutMs = CONFIG.DEFAULT_TIMEOUT_MS,
    signal = null,
  } = options;

  // 1. Return cached profile if valid
  const cached = await getCachedProfile(normalizedKey);
  if (cached) return cached;

  // 2. Collapse concurrent duplicate requests
  if (inFlightRequests.has(normalizedKey)) {
    return inFlightRequests.get(normalizedKey);
  }

  // 3. Queue task in prioritized worker pool
  const taskPromise = requestQueue.enqueue(
    normalizedKey,
    priority,
    async () => {
      try {
        const data = await fetchProfileFromNetwork(normalizedKey, fetcher, {
          timeoutMs,
          signal,
        });

        await setCachedProfile(normalizedKey, data, false);
        return data;
      } catch (err) {
        // Apply short negative caching for failures
        await setCachedProfile(normalizedKey, { error: err.message }, true);
        telemetry.recordError(err);
        throw err;
      } finally {
        inFlightRequests.delete(normalizedKey);
      }
    }
  );

  inFlightRequests.set(normalizedKey, taskPromise);
  return taskPromise;
}

/**
 * Executes dynamic continuous pool batching across multiple usernames.
 *
 * @param {string[]} usernames
 * @param {object} [options={}]
 * @returns {Promise<PromiseSettledResult<object>[]>}
 */
export async function fetchWithConcurrencyLimit(usernames, options = {}) {
  if (!Array.isArray(usernames) || usernames.length === 0) {
    return [];
  }

  const uniqueUsernames = Array.from(
    new Set(usernames.filter(Boolean).map((u) => u.trim()))
  );

  const tasks = uniqueUsernames.map((username) =>
    fetchProfileWithCache(username, {
      ...options,
      priority: options.priority ?? Priority.MEDIUM,
    })
      .then((value) => ({ status: "fulfilled", value }))
      .catch((reason) => ({ status: "rejected", reason }))
  );

  return Promise.all(tasks);
}

/**
 * Prefetches an array of profiles in background low priority mode.
 *
 * @param {string[]} usernames
 * @param {object} [options={}]
 */
export async function prefetchProfiles(usernames, options = {}) {
  return fetchWithConcurrencyLimit(usernames, {
    ...options,
    priority: Priority.LOW,
  });
}

/**
 * Invalidates single user from L1 and L2 caches
 */
export async function invalidateProfile(username) {
  if (!username) return;
  const key = username.trim().toLowerCase();
  l1Cache.delete(key);
  await l2Cache.delete(key);
  inFlightRequests.delete(key);
}

/**
 * Clears all entries from both memory and persistent storage
 */
export async function clearProfileCache() {
  l1Cache.clear();
  await l2Cache.clear();
  inFlightRequests.clear();
  requestQueue.clear();
  telemetry.reset();
}

/**
 * Returns diagnostic size info
 */
export function profileCacheSize() {
  return {
    l1Size: l1Cache.size(),
    inFlightCount: inFlightRequests.size,
  };
}

export const getEvictionThreshold = () => CONFIG.L1_TTL_MS;

// ============================================================================
// SECTION 11: REACT BINDING HELPER HOOK UTILITY
// ============================================================================

/**
 * Helper listener for React state integration
 *
 * @param {Function} callback
 * @returns {Function} Unsubscribe handle
 */
export function subscribeToCacheUpdates(callback) {
  return telemetry.on("metric:updated", callback);
}

// ============================================================================
// SECTION 12: EMBEDDED DIAGNOSTICS & SUITE RUNNER
// ============================================================================

/**
 * Runs internal diagnostic check to confirm cache operational health
 */
export async function runCacheDiagnostics() {
  const testUser = "__eventra_test_user_123__";
  const mockPayload = normalizeGitHubProfile({
    id: 99999,
    login: testUser,
    name: "Eventra Test",
    followers: 100,
  });

  const report = {
    l1Status: "FAIL",
    l2Status: "FAIL",
    rateLimitState: rateLimitTracker.getState(),
    telemetryState: telemetry.getSummary(),
    timestamp: new Date().toISOString(),
  };

  try {
    // Test L1
    l1Cache.set(testUser, mockPayload);
    if (l1Cache.get(testUser)?.login === testUser) {
      report.l1Status = "PASS";
    }
    l1Cache.delete(testUser);

    // Test L2
    await l2Cache.set(testUser, mockPayload);
    const l2Read = await l2Cache.get(testUser);
    if (l2Read?.data?.login === testUser) {
      report.l2Status = "PASS";
    }
    await l2Cache.delete(testUser);
  } catch (err) {
    report.error = err.message;
  }

  return report;
}