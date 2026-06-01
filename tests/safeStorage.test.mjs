import assert from "node:assert/strict";

class StorageMock {
  constructor() {
    this.store = {};
  }

  get length() {
    return Object.keys(this.store).length;
  }

  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key)
      ? this.store[key]
      : null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }

  key(index) {
    return Object.keys(this.store)[index] ?? null;
  }
}

global.Storage = StorageMock;
global.window = { localStorage: new StorageMock() };

const originalConsoleWarn = console.warn;
const warnings = [];
console.warn = (...args) => warnings.push(args);

const {
  isStorageAvailable,
  safeClear,
  safeGetItem,
  safeRemoveItem,
  safeSetItem,
} = await import("../src/utils/safeStorage.js");

try {
  safeClear();

  assert.equal(isStorageAvailable(), true, "storage should be available");
  assert.equal(safeSetItem("theme", "dark"), true, "setItem should succeed");
  assert.equal(safeGetItem("theme"), "dark", "getItem should return stored value");
  assert.equal(safeRemoveItem("theme"), true, "removeItem should succeed");
  assert.equal(safeGetItem("theme"), null, "removed item should be absent");

  const originalGetItem = Storage.prototype.getItem;
  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;
  const originalClear = Storage.prototype.clear;

  Storage.prototype.getItem = () => {
    throw new Error("Storage blocked");
  };
  assert.equal(
    safeGetItem("theme", "light"),
    "light",
    "getItem should return fallback when storage throws"
  );

  Storage.prototype.setItem = () => {
    throw new Error("Storage blocked");
  };
  assert.equal(safeSetItem("theme", "dark"), false, "setItem should not throw");

  Storage.prototype.removeItem = () => {
    throw new Error("Storage blocked");
  };
  assert.equal(safeRemoveItem("theme"), false, "removeItem should not throw");

  Storage.prototype.clear = () => {
    throw new Error("Storage blocked");
  };
  assert.equal(safeClear(), false, "clear should not throw");
  assert.equal(isStorageAvailable(), false, "availability should reflect blocked storage");
  assert.ok(warnings.length > 0, "storage restrictions should log warnings");

  Storage.prototype.getItem = originalGetItem;
  Storage.prototype.setItem = originalSetItem;
  Storage.prototype.removeItem = originalRemoveItem;
  Storage.prototype.clear = originalClear;

  console.log("safeStorage tests passed");
} finally {
  console.warn = originalConsoleWarn;
  delete global.window;
  delete global.Storage;
}
