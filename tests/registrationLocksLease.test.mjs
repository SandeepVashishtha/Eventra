import assert from "node:assert/strict";
import registrationLocks, {
  acquireRegistrationLock,
  releaseRegistrationLock,
} from "../src/utils/registrationLocks.js";

globalThis.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = String(value); },
  removeItem(key) { delete this.store[key]; }
};

const clearStore = () => {
  globalThis.localStorage.store = {};
};

try {
  assert.equal(acquireRegistrationLock("evt123"), true);
  assert.equal(acquireRegistrationLock("evt123"), false, "Should block secondary lock attempts");

  // Simulate timeout lease expiry
  const past = Date.now() - 700000;
  localStorage.setItem("reg_lock_evt123", String(past));
  assert.equal(acquireRegistrationLock("evt123"), true, "Should acquire lock if expired");

  // Releasing the lease lets the same event be re-acquired immediately
  assert.equal(releaseRegistrationLock("evt123"), true);
  assert.equal(acquireRegistrationLock("evt123"), true, "Should re-acquire after release");

  // The default export must mirror the localStorage lease (cross-tab source
  // of truth), not just the per-tab in-memory Set.
  clearStore();
  assert.equal(registrationLocks.has("evt456"), false, "No lease yet");
  assert.equal(registrationLocks.set("evt456"), true, "set() acquires the lease");
  assert.equal(registrationLocks.has("evt456"), true, "has() sees the acquired lease");
  assert.equal(registrationLocks.set("evt456"), false, "Second set() is blocked while the lease is held");
  registrationLocks.delete("evt456");
  assert.equal(registrationLocks.has("evt456"), false, "delete() releases the lease");

  // A lease written by another tab (shared localStorage) blocks this tab.
  localStorage.setItem("reg_lock_evt789", String(Date.now()));
  assert.equal(registrationLocks.has("evt789"), true, "Cross-tab lease is visible to has()");
  assert.equal(registrationLocks.set("evt789"), false, "Cannot acquire while another tab holds the lease");
  assert.equal(releaseRegistrationLock("evt789"), true);

  // An expired lease never hard-blocks a re-registration.
  localStorage.setItem("reg_lock_evtExpired", String(Date.now() - 700000));
  assert.equal(registrationLocks.has("evtExpired"), false, "Expired lease is not active");
  assert.equal(registrationLocks.set("evtExpired"), true, "Expired lease can be re-acquired");

  console.log("registrationLocks lease time tests passed ✓");
} finally {
  delete globalThis.localStorage;
}
