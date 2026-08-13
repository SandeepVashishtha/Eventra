import { strict as assert } from "node:assert";
import { describe, it, beforeEach, afterEach } from "node:test";

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------
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

const { syncSecureStorage } = await import("../src/utils/secureStorage.js");

const flush = () => new Promise((r) => setTimeout(r, 20));

describe("secureStorage.clear() scope (issue #16242)", () => {
  beforeEach(() => {
    mockStorage.clear();
  });
  afterEach(() => {
    mockStorage.clear();
  });

  it("removes only secureStorage keys, leaving unrelated keys intact", async () => {
    // Unrelated same-origin keys (analytics, other Eventra modules, SDKs)
    mockStorage.setItem("analytics:session", "abc");
    mockStorage.setItem("eventra:theme", "dark");
    mockStorage.setItem("otherApp:pref", "x");

    await syncSecureStorage.setItem("secure:token", "super-secret");
    await syncSecureStorage.setItem("secure:profile", "pii");

    assert.equal(mockStorage.getItem("secure:token") !== null, true);

    syncSecureStorage.clear();
    await flush();

    // Secure keys are gone
    assert.equal(mockStorage.getItem("secure:token"), null);
    assert.equal(mockStorage.getItem("secure:profile"), null);

    // Unrelated keys survive
    assert.equal(mockStorage.getItem("analytics:session"), "abc");
    assert.equal(mockStorage.getItem("eventra:theme"), "dark");
    assert.equal(mockStorage.getItem("otherApp:pref"), "x");
  });

  it("removes internal crypto keys on clear", async () => {
    await syncSecureStorage.setItem("secure:token", "secret");
    syncSecureStorage.clear();
    await flush();
    // The crypto-layer material/salt/metadata keys must be wiped too.
    assert.equal(mockStorage.getItem("eventra:key-material"), null);
    assert.equal(mockStorage.getItem("eventra:key-salt"), null);
    assert.equal(mockStorage.getItem("eventra:key-metadata"), null);
  });
});
