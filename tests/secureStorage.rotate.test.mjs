import { strict as assert } from "node:assert";
import { describe, it, beforeEach, afterEach } from "node:test";

class LocalStorageMock {
  constructor() {
    this._store = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this._store, key)
      ? this._store[key]
      : null;
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

class CryptoStub {
  getRandomValues(array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }
  get subtle() {
    return {
      importKey: async () => ({ type: "raw" }),
      deriveKey: async () => ({ type: "derived" }),
      encrypt: async (_algo, _key, data) => {
        const src = new Uint8Array(data.buffer ?? data);
        const out = new Uint8Array(src.length);
        for (let i = 0; i < src.length; i++) out[i] = src[i] ^ 0x42;
        return out.buffer;
      },
      decrypt: async (_algo, _key, data) => {
        const src = new Uint8Array(data.buffer ?? data);
        const out = new Uint8Array(src.length);
        for (let i = 0; i < src.length; i++) out[i] = src[i] ^ 0x42;
        return out.buffer;
      },
    };
  }
}

const mockStorage = new LocalStorageMock();
global.localStorage = mockStorage;
global.window = {
  localStorage: mockStorage,
  location: { origin: "http://localhost" },
  isSecureContext: true,
  crypto: new CryptoStub(),
};
Object.defineProperty(global, "crypto", {
  value: new CryptoStub(),
  writable: true,
  configurable: true,
});

const { syncSecureStorage, rotateKey } = await import(
  "../src/utils/secureStorage.js"
);

const flush = () => new Promise((r) => setTimeout(r, 20));

describe("secureStorage.rotateKey mutex (issue #16243)", () => {
  beforeEach(() => mockStorage.clear());
  afterEach(() => mockStorage.clear());

  it("keeps all values readable under concurrent writes + rotation", async () => {
    const keys = ["rk1", "rk2", "rk3", "rk4"];
    for (const k of keys) {
      await syncSecureStorage.setItem(k, `v0-${k}`);
    }

    // Fire a rotation alongside many concurrent reads/writes.
    await Promise.all([
      rotateKey(),
      ...keys.map((k) => syncSecureStorage.setItem(k, `v1-${k}`)),
      ...keys.map((k) => syncSecureStorage.getItemAsync(k)),
      ...keys.map((k) => syncSecureStorage.setItem(k, `v2-${k}`)),
    ]);
    await flush();

    for (const k of keys) {
      const value = await syncSecureStorage.getItemAsync(k);
      assert.equal(value, `v2-${k}`, `value for ${k} must survive rotation`);
    }
  });

  it("rotateKey still migrates pre-existing values", async () => {
    await syncSecureStorage.setItem("persisted", "important");
    const meta = await rotateKey();
    assert.ok(meta && meta.rotatedAt, "rotateKey returns updated metadata");
    const after = await syncSecureStorage.getItemAsync("persisted");
    assert.equal(after, "important");
  });
});
