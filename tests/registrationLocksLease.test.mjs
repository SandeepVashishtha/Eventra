import assert from "node:assert/strict";
import { acquireRegistrationLock, releaseRegistrationLock } from "../src/utils/registrationLocks.js";

globalThis.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = String(value); },
  removeItem(key) { delete this.store[key]; }
};

try {
  assert.equal(acquireRegistrationLock("evt123"), true);
  assert.equal(acquireRegistrationLock("evt123"), false, "Should block secondary lock attempts");
  
  // Simulate timeout lease expiry
  const past = Date.now() - 700000;
  localStorage.setItem("reg_lock_evt123", String(past));
  assert.equal(acquireRegistrationLock("evt123"), true, "Should acquire lock if expired");
  
  console.log("registrationLocks lease time tests passed ✓");
} finally {
  delete globalThis.localStorage;
}
