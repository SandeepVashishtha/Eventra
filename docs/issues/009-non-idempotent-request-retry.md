# Issue #009: Non-idempotent HTTP requests (POST/PUT/PATCH/DELETE) get auto-retried — risk of duplicate operations

**Tags:** `bug`, `performance`, `intermediate`  
**Category:** Quality Exceptional  
**Files:** `src/config/api.js`

---

## Description

The Axios response interceptor in `src/config/api.js` automatically retries failed requests on HTTP status codes 502, 503, and 504 (Bad Gateway, Service Unavailable, Gateway Timeout). However, the retry logic is applied to **all HTTP methods** equally, including state-changing methods like `POST`, `PUT`, `PATCH`, and `DELETE`.

### The Problem

If a `POST /api/events/create` request gets a 502 response (e.g., a transient load balancer error), the interceptor retries the same request after 1 second. If the original request **actually succeeded** on the server but the response was lost (a common scenario with 502 errors), the retry creates a **duplicate event**.

This can cause:
- Duplicate event registrations
- Duplicate event/project creation
- Duplicate profile updates
- Duplicate notification reads

### Current Code

`src/config/api.js:148-170`:

```javascript
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const status = error?.response?.status;

    // ... 401 handling ...

    const retryCount = config._retryCount || 0;
    if (RETRYABLE_STATUS_CODES.includes(status) && retryCount < MAX_RETRIES) {
      config._retryCount = retryCount + 1;

      if (isDev) {
        console.debug(
          `[API ${config.method?.toUpperCase()}] ${config.url} returned ${status}, retrying...`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return API(config);  // ← RETRIES ANY METHOD
    }
    // ...
  }
);
```

### Configuration Context

```javascript
const REQUEST_TIMEOUT_MS = 15_000;
const RETRYABLE_STATUS_CODES = [502, 503, 504];
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1_000;
```

## Proposed Fix

Only retry idempotent HTTP methods. The HTTP specification defines `GET`, `HEAD`, `OPTIONS`, and `TRACE` as safe/idempotent methods. `PUT` and `DELETE` are idempotent in theory but in practice should not be auto-retried without idempotency keys.

```javascript
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const status = error?.response?.status;
    const method = (config.method || 'GET').toUpperCase();

    // ... existing 401 handling ...

    const retryCount = config._retryCount || 0;
    const IDEMPOTENT_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

    if (
      IDEMPOTENT_METHODS.includes(method) &&
      RETRYABLE_STATUS_CODES.includes(status) &&
      retryCount < MAX_RETRIES
    ) {
      config._retryCount = retryCount + 1;

      if (isDev) {
        console.debug(
          `[API ${method}] ${config.url} returned ${status}, retrying in ${RETRY_DELAY_MS}ms (attempt ${config._retryCount})...`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return API(config);
    }

    // For non-retryable requests, throw immediately
    // ... rest of error handling ...
  }
);
```

### Alternative: Exponential Backoff for Retries

While fixing the method filtering, consider improving the retry strategy with exponential backoff:

```javascript
const RETRY_DELAY_MS = 1000;
const MAX_RETRIES = 2;

// In the retry block:
const delay = RETRY_DELAY_MS * Math.pow(2, retryCount); // 1s, 2s
await new Promise((resolve) => setTimeout(resolve, delay));
```

## Acceptance Criteria

- [ ] `GET`, `HEAD`, `OPTIONS`, `TRACE` requests still auto-retry on 502/503/504 (existing behavior preserved)
- [ ] `POST`, `PUT`, `PATCH`, `DELETE` requests **do not** auto-retry on 502/503/504
- [ ] Error handling for non-idempotent methods propagates correctly to callers
- [ ] No change to the 401 unauthorized handling (still fires for all methods)
- [ ] Existing tests still pass
- [ ] Dev console logging correctly shows which requests are being retried

## Verification

1. Simulate a 502 response for a POST request in the mock/dev environment
2. Verify the error is thrown immediately without retrying
3. Simulate a 502 response for a GET request
4. Verify the request is retried after 1 second
5. Check the console debug logs show `[API POST] /api/events returned 502, not retrying (non-idempotent)`

## Edge Cases

- **Idempotency-Key header**: For advanced implementations, consider supporting an `Idempotency-Key` header. If the client provides one, even `POST` requests can be retried safely because the server deduplicates based on the key. This is out of scope for this issue but worth noting.
- **WebSocket/SSE connections**: These are not affected by this change since they don't go through the Axios interceptor.
