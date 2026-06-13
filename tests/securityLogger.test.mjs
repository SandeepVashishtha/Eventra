import assert from "node:assert/strict";
import { logSecurityEvent, logCspViolation } from "../src/utils/securityLogger.js";

// Mock localStorage
globalThis.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = String(value); },
  clear() { this.store = {}; }
};

try {
  localStorage.clear();
  logSecurityEvent("TEST_ALERT", { details: "xss attempt detected" });
  
  const raw = localStorage.getItem("eventra_security_events");
  assert.ok(raw, "Should write to localStorage");
  
  const parsed = JSON.parse(raw);
  assert.equal(parsed.length, 1, "Should have 1 logged event");
  assert.equal(parsed[0].eventType, "TEST_ALERT", "EventType should match");
  
  // Test rotation
  for (let i = 0; i < 60; i++) {
    logSecurityEvent(`ALERT_${i}`);
  }
  
  const rotated = JSON.parse(localStorage.getItem("eventra_security_events"));
  assert.equal(rotated.length, 50, "Should clamp to max 50 logs");
  
  console.log("securityLogger rotation and validation tests passed ✓");
} finally {
  delete globalThis.localStorage;
}
