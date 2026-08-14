import assert from "node:assert/strict";

// Setup minimal global objects for Node.js testing environment
globalThis.process = {
  env: { NODE_ENV: "test" },
  exit: (code) => { throw new Error(`Exit with code ${code}`); }
};

globalThis.window = {};
globalThis.document = {};

Object.defineProperty(globalThis, 'navigator', {
  value: {
    userAgent: "Node.js Test",
    language: "en-US",
    onLine: true,
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, 'indexedDB', {
  value: {},
  writable: true,
  configurable: true,
});

// Import the functions we need to test directly
import {
  addBreadcrumb,
  getBreadcrumbs,
  clearBreadcrumbs,
  buildFingerprint,
  isDuplicate,
  scrubPayload,
  runTelemetryDiagnostics,
  getTelemetryStatus,
  setTransportEndpoint,
  CONFIG,
  handleReactErrorBoundary,
  sendReports,
} from "../src/utils/globalErrorHandler.js";

console.log("Running Global Error Handler Unit Tests...\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}: ${error.message}`);
    failed++;
  }
}

// Test 1: Configuration
test("Configuration has breadcrumb types", () => {
  assert.ok(CONFIG.BREADCRUMB_TYPES.CLICK === "click");
  assert.ok(CONFIG.BREADCRUMB_TYPES.ROUTE === "route");
  assert.ok(CONFIG.BREADCRUMB_TYPES.CONSOLE === "console");
  assert.ok(CONFIG.BREADCRUMB_TYPES.FETCH === "fetch");
  assert.ok(CONFIG.BREADCRUMB_TYPES.CUSTOM === "custom");
});

test("Configuration has deduplication window", () => {
  assert.strictEqual(CONFIG.DEDUP_WINDOW_MS, 5 * 60 * 1000);
});

test("Configuration has rate limiting", () => {
  assert.strictEqual(CONFIG.MAX_EVENT_RATE, 100);
  assert.strictEqual(CONFIG.RATE_LIMIT_WINDOW_MS, 60 * 1000);
});

test("Configuration has offline queue", () => {
  assert.ok(CONFIG.OFFLINE_QUEUE_KEY);
  assert.ok(CONFIG.MAX_QUEUE_SIZE > 0);
  assert.ok(CONFIG.FLUSH_BATCH_SIZE > 0);
});

test("Configuration has tracked assets", () => {
  assert.ok(CONFIG.TRACKED_ASSETS.includes("img"));
  assert.ok(CONFIG.TRACKED_ASSETS.includes("script"));
  assert.ok(CONFIG.TRACKED_ASSETS.includes("link"));
});

// Test 2: Breadcrumb Ring Buffer
test("Breadcrumb ring buffer maintains max size", () => {
  clearBreadcrumbs();
  
  for (let i = 0; i < CONFIG.MAX_BREADCRUMBS + 10; i++) {
    addBreadcrumb({ type: "test", message: `Test ${i}` });
  }
  
  const breadcrumbs = getBreadcrumbs();
  assert.strictEqual(breadcrumbs.length, CONFIG.MAX_BREADCRUMBS);
});

test("Breadcrumbs are FIFO", () => {
  clearBreadcrumbs();
  
  for (let i = 0; i < CONFIG.MAX_BREADCRUMBS + 5; i++) {
    addBreadcrumb({ type: "test", message: `Msg ${i}` });
  }
  
  const breadcrumbs = getBreadcrumbs();
  assert.ok(!breadcrumbs.some(b => b.message === "Msg 0"));
  assert.ok(breadcrumbs.some(b => b.message === `Msg ${CONFIG.MAX_BREADCRUMBS + 4}`));
});

test("Clear breadcrumbs works", () => {
  clearBreadcrumbs();
  addBreadcrumb({ type: "test", message: "Test" });
  assert.strictEqual(getBreadcrumbs().length, 1);
  
  clearBreadcrumbs();
  assert.strictEqual(getBreadcrumbs().length, 0);
});

// Test 3: Fingerprinting
test("Fingerprinting same error produces same result", () => {
  const error = new Error("Test error");
  const fp1 = buildFingerprint(error);
  const fp2 = buildFingerprint(error);
  assert.strictEqual(fp1, fp2);
});

test("Fingerprinting different errors produce different results", () => {
  const error1 = new Error("Error 1");
  const error2 = new Error("Error 2");
  const fp1 = buildFingerprint(error1);
  const fp2 = buildFingerprint(error2);
  assert.ok(fp1 !== fp2);
});

test("Fingerprinting string errors", () => {
  const fp1 = buildFingerprint("Test error");
  const fp2 = buildFingerprint("Test error");
  assert.strictEqual(fp1, fp2);
});

// Test 4: Deduplication
test("Deduplication first occurrence not duplicate", () => {
  const fp = buildFingerprint(new Error("Unique error"));
  assert.ok(!isDuplicate(fp));
});

test("Deduplication second occurrence is duplicate", () => {
  const fp = buildFingerprint(new Error("Duplicate error"));
  isDuplicate(fp); // First call
  assert.ok(isDuplicate(fp)); // Second call should be duplicate
});

// Test 5: PII Scrubbing
test("PII scrubbing redacts emails", () => {
  const data = { email: "test@example.com" };
  const scrubbed = scrubPayload(data);
  assert.ok(!JSON.stringify(scrubbed).includes("test@example.com"));
  assert.ok(JSON.stringify(scrubbed).includes("[REDACTED"));
});

test("PII scrubbing redacts passwords", () => {
  const data = { password: "secret123" };
  const scrubbed = scrubPayload(data);
  assert.ok(!JSON.stringify(scrubbed).includes("secret123"));
});

test("PII scrubbing redacts JWT tokens", () => {
  const data = { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" };
  const scrubbed = scrubPayload(data);
  assert.ok(!JSON.stringify(scrubbed).includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"));
});

test("PII scrubbing redacts authorization headers", () => {
  const data = { authorization: "Bearer abc123" };
  const scrubbed = scrubPayload(data);
  assert.ok(!JSON.stringify(scrubbed).includes("Bearer abc123"));
});

test("PII scrubbing redacts API keys", () => {
  const data = { apiKey: "sk-1234567890" };
  const scrubbed = scrubPayload(data);
  assert.ok(!JSON.stringify(scrubbed).includes("sk-1234567890"));
});

test("PII scrubbing works with nested objects", () => {
  const data = {
    user: {
      email: "nested@example.com",
      profile: {
        password: "nested123",
      },
    },
  };
  const scrubbed = scrubPayload(data);
  const str = JSON.stringify(scrubbed);
  assert.ok(!str.includes("nested@example.com"));
  assert.ok(!str.includes("nested123"));
});

// Test 6: Transport endpoint
test("Transport endpoint can be set", () => {
  setTransportEndpoint("/custom/api");
  const status = getTelemetryStatus();
  assert.strictEqual(status.transport.endpoint, "/custom/api");
  
  // Reset to default
  setTransportEndpoint(CONFIG.TRANSPORT_ENDPOINT);
});

// Test 7: Telemetry status
test("Telemetry status returns expected structure", () => {
  const status = getTelemetryStatus();
  
  assert.ok(status.breadcrumbs !== undefined);
  assert.ok(status.deduplication !== undefined);
  assert.ok(status.rateLimiting !== undefined);
  assert.ok(status.connectivity !== undefined);
  assert.ok(status.transport !== undefined);
  assert.ok(status.queue !== undefined);
});

// Test 8: React Error Boundary adapter (basic functionality)
test("React Error Boundary adapter is a function", () => {
  assert.ok(typeof handleReactErrorBoundary === "function");
});

// Test 9: Send reports function
test("Send reports function is a function", () => {
  assert.ok(typeof sendReports === "function");
});

// Test 10: Diagnostic suite
test("Diagnostic suite returns results", () => {
  const results = runTelemetryDiagnostics();
  
  assert.ok(results.timestamp);
  assert.ok(Array.isArray(results.tests));
  assert.ok(results.status);
  assert.ok(results.tests.length > 0);
});

// Summary
console.log("\n" + "=".repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("=".repeat(60));

if (failed > 0) {
  throw new Error(`${failed} test(s) failed`);
}

console.log("\n✓ All tests passed!");
