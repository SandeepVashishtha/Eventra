import assert from "node:assert/strict";

const store = {};
global.localStorage = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, value) => {
    store[key] = String(value);
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    for (const key of Object.keys(store)) delete store[key];
  },
};

const { storageManager } = await import("../src/utils/storage/storageManager.js");

let now = 1_000_000;
const originalDateNow = Date.now;
Date.now = () => now;

try {
  storageManager.set("profile", { name: "Ada" }, 5000);
  assert.deepEqual(
    storageManager.get("profile"),
    { name: "Ada" },
    "returns stored value before expiry"
  );

  now += 6000;
  assert.equal(storageManager.get("profile"), null, "expires TTL-backed entries");

  localStorage.setItem("bad-shape", "plain-string");
  assert.equal(storageManager.get("bad-shape"), null, "rejects invalid payload shape");

  storageManager.set("validated", { ok: true }, 5000);
  now = 1_000_000;
  assert.deepEqual(
    storageManager.get("validated", (value) => value?.ok === true),
    { ok: true },
    "passes custom validator"
  );
  assert.equal(
    storageManager.get("validated", () => false),
    null,
    "removes entries that fail validation"
  );

  storageManager.remove("validated");
  assert.equal(storageManager.get("validated"), null, "removeItem clears key");

  storageManager.set("a", 1, 5000);
  storageManager.set("b", 2, 5000);
  storageManager.clear();
  assert.equal(storageManager.get("a"), null, "clear removes all entries");
  assert.equal(storageManager.get("b"), null, "clear removes all entries");

  console.log("storageManager tests passed ✓");
} finally {
  Date.now = originalDateNow;
}
