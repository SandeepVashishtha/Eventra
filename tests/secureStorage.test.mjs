import assert from "node:assert/strict";

// Mock global window, localStorage, and sessionStorage
const localStore = {};
const sessionStore = {};

globalThis.localStorage = {
  getItem(key) {
    return localStore[key] || null;
  },
  setItem(key, value) {
    localStore[key] = String(value);
  },
  removeItem(key) {
    delete localStore[key];
  },
  clear() {
    for (const key of Object.keys(localStore)) {
      delete localStore[key];
    }
  }
};

globalThis.sessionStorage = {
  getItem(key) {
    return sessionStore[key] || null;
  },
  setItem(key, value) {
    sessionStore[key] = String(value);
  },
  removeItem(key) {
    delete sessionStore[key];
  }
};

// Seed migration data before importing to check transition logic
localStorage.setItem("token", "legacy-token-123");

// Use dynamic import to prevent ESM hoisting so migration logic has seed data
const {
  setToken,
  getToken,
  removeToken,
  syncSecureStorage
} = await import("../src/utils/secureStorage.js");

// Test migration on import
assert.equal(sessionStorage.getItem("token"), "legacy-token-123");
assert.equal(localStorage.getItem("token"), null);

// Test sessionStorage helpers
setToken("new-token-456");
assert.equal(getToken(), "new-token-456");

removeToken();
assert.equal(getToken(), null);

// Test syncSecureStorage pass-through
syncSecureStorage.setItem("user-theme", "dark");
assert.equal(syncSecureStorage.getItem("user-theme"), "dark");

syncSecureStorage.removeItem("user-theme");
assert.equal(syncSecureStorage.getItem("user-theme"), null);

// Test clear
syncSecureStorage.setItem("key1", "val1");
syncSecureStorage.setItem("key2", "val2");
syncSecureStorage.clear();
assert.equal(syncSecureStorage.getItem("key1"), null);
assert.equal(syncSecureStorage.getItem("key2"), null);

console.log("secureStorage tests passed successfully!");
