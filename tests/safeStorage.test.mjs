import assert from "node:assert/strict";

class StorageMock {
  constructor() {
    this._store = {};
  }

  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this._store, key) ? this._store[key] : null;
  }

  setItem(key, value) {
    this._store[key] = String(value);
  }

  removeItem(key) {
    delete this._store[key];
  }

  clear() {
    this._store = {};
  }

  get length() {
    return Object.keys(this._store).length;
  }

  key(index) {
    return Object.keys(this._store)[index] ?? null;
  }
}

global.window = {
  localStorage: new StorageMock(),
  sessionStorage: new StorageMock(),
};

const { isLocalStorageAvailable, safeLocalStorage, safeSessionStorage } = await import(
  "../src/utils/safeStorage.js"
);

assert.equal(isLocalStorageAvailable(), true);
assert.equal(safeLocalStorage.setItem("theme", "dark"), true);
assert.equal(safeLocalStorage.getItem("theme"), "dark");
assert.deepEqual(safeLocalStorage.setJson("profile", { level: "Pro" }), true);
assert.deepEqual(safeLocalStorage.getJson("profile"), { level: "Pro" });
assert.equal(safeLocalStorage.getJson("missing", "fallback"), "fallback");

safeLocalStorage.setItem("broken-json", "{not-json");
assert.deepEqual(safeLocalStorage.getJson("broken-json", []), []);

assert.equal(safeLocalStorage.removeItem("theme"), true);
assert.equal(safeLocalStorage.getItem("theme", "default"), "default");

assert.equal(safeSessionStorage.setItem("tab", "events"), true);
assert.equal(safeSessionStorage.getItem("tab"), "events");

delete global.window;

console.log("safeStorage tests passed ✓");
