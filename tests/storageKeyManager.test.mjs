import { strict as assert } from "node:assert";
import { describe, it, beforeEach, afterEach } from "node:test";

class LocalStorageMock {
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

describe("storageKeyManager #16249", () => {
  let prevWindow;
  let prevLocalStorage;

  beforeEach(() => {
    prevWindow = global.window;
    prevLocalStorage = global.localStorage;
    global.window = {};
    global.localStorage = new LocalStorageMock();
  });

  afterEach(() => {
    global.window = prevWindow;
    global.localStorage = prevLocalStorage;
  });

  it("scopes the salt per namespace (no single global salt)", async () => {
    const { getOpaqueKey } = await import("../src/utils/storageKeyManager.js");

    getOpaqueKey("calendar", "user-1");
    getOpaqueKey("prefs", "user-1");

    // Each namespace must have its own salt entry; the old global key must not exist.
    assert.ok(
      global.localStorage.getItem("eventra:storage-key-salt:calendar"),
      "calendar namespace should have its own salt"
    );
    assert.ok(
      global.localStorage.getItem("eventra:storage-key-salt:prefs"),
      "prefs namespace should have its own salt"
    );
    assert.strictEqual(
      global.localStorage.getItem("eventra:storage-key-salt"),
      null,
      "global salt key must no longer be used"
    );
  });

  it("returns a stable opaque key within a namespace", async () => {
    const { getOpaqueKey } = await import("../src/utils/storageKeyManager.js");
    const a = getOpaqueKey("prefs", "user-9");
    const b = getOpaqueKey("prefs", "user-9");
    assert.strictEqual(a, b);
  });

  it("returns a guest key without hashing", async () => {
    const { getOpaqueKey } = await import("../src/utils/storageKeyManager.js");
    assert.strictEqual(getOpaqueKey("prefs", "guest"), "prefs_guest");
  });
});
