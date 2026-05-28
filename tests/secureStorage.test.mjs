import assert from "node:assert/strict";

const store = {};
globalThis.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { for (const k in store) delete store[k]; }
};

import { syncSecureStorage } from "../src/utils/secureStorage.js";

assert.equal(syncSecureStorage.setItem("user", "john"), true);
assert.equal(syncSecureStorage.getItem("user"), "john");
assert.equal(await syncSecureStorage.getItemAsync("user"), "john");
syncSecureStorage.removeItem("user");
assert.equal(syncSecureStorage.getItem("user"), null);

globalThis.window = {
  location: { origin: "http://localhost" },
  crypto: {
    subtle: {
      importKey: async () => ({}),
      deriveKey: async () => ({}),
      encrypt: async () => new Uint8Array([1, 2, 3]),
      decrypt: async () => new TextEncoder().encode("decrypted-data")
    },
    getRandomValues: (arr) => arr
  }
};

console.log("secureStorage tests passed ✓");
