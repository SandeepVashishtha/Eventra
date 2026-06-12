import assert from "node:assert/strict";
import { logAbuseAttempt } from "../src/utils/abuseLogger.js";

globalThis.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = String(value); }
};

try {
  localStorage.setItem("eventra_abuse_logs", "[]");
  
  // Log 15 times rapidly
  for (let i = 0; i < 15; i++) {
    logAbuseAttempt("XSS", { index: i });
  }
  
  const parsed = JSON.parse(localStorage.getItem("eventra_abuse_logs"));
  assert.equal(parsed.length, 10, "Should throttle to exactly 10 logs per minute");
  
  console.log("abuseLogger throttling tests passed ✓");
} finally {
  delete globalThis.localStorage;
}
