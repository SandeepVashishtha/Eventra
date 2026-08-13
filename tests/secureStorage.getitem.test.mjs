import { strict as assert } from "node:assert";
import { describe, it, beforeEach, afterEach } from "node:test";

// Minimal localStorage mock (mirrors existing secureStorage tests).
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

describe("secureStorage getItemAsync #16248", () => {
  let prevLocalStorage;
  let prevWindow;

  beforeEach(() => {
    prevLocalStorage = global.localStorage;
    prevWindow = global.window;
    global.localStorage = new LocalStorageMock();
    // Enable the Web Crypto path inside the module (isCryptoAvailable checks window.isSecureContext).
    global.window = { isSecureContext: true };
  });

  afterEach(() => {
    global.localStorage = prevLocalStorage;
    global.window = prevWindow;
  });

  it("returns null on decrypt failure instead of raw ciphertext", async () => {
    const { syncSecureStorage } = await import("../src/utils/secureStorage.js");

    // Seed a value that is NOT valid ciphertext/JSON so decryption throws.
    global.localStorage.setItem("eventra:broken", "not-a-valid-ciphertext");

    const result = await syncSecureStorage.getItemAsync("eventra:broken");
    assert.strictEqual(result, null, "decrypt failure must surface as null, not ciphertext");
  });

  it("returns null (not raw ciphertext) for corrupt encrypted JSON", async () => {
    const { syncSecureStorage } = await import("../src/utils/secureStorage.js");

    // Valid JSON but missing the fields decryptValue expects → decryption throws.
    global.localStorage.setItem("eventra:corrupt", JSON.stringify({ foo: "bar" }));

    const result = await syncSecureStorage.getItemAsync("eventra:corrupt");
    assert.strictEqual(result, null, "corrupt payload must surface as null, not ciphertext");
  });
});
