/**
 * Unit tests for the secureStorage serialized mutation queue (issue #14613).
 *
 * Before the fix, setItem encrypted and wrote directly to localStorage while
 * removeItem/clear wrote synchronously — the orphaned _writeQueue/_processQueue
 * were never wired up. Two concurrent setItem calls for the same key could
 * therefore land out of order (the slower encryption could finish last and
 * overwrite a newer value), and a removeItem/clear issued after a setItem could
 * run on disk before that setItem. These tests pin the ordering guarantees:
 * all mutations go through one serialized writer and reads stay consistent
 * synchronously via in-memory state.
 */

import assert from "node:assert/strict";
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

let delayNextEncrypt = false;
const DELAY_MS = 50;

class CryptoStub {
  getRandomValues(array) {
    for (let i = 0; i < array.length; i++) array[i] = Math.floor(Math.random() * 256);
    return array;
  }
  get subtle() {
    return {
      importKey: async () => ({ type: 'raw' }),
      deriveKey: async () => ({ type: 'derived' }),
      encrypt: async (_algo, _key, data) => {
        if (delayNextEncrypt) {
          delayNextEncrypt = false;
          await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
        }
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
  location: { origin: 'http://localhost' },
  isSecureContext: true,
  crypto: new CryptoStub(),
};
Object.defineProperty(global, 'crypto', { value: new CryptoStub(), writable: true, configurable: true });

const { syncSecureStorage } = await import("../src/utils/secureStorage.js");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("secureStorage serialized mutation queue (#14613)", () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  afterEach(async () => {
    mockStorage.clear();
    await delay(20);
  });

  it("concurrent setItem calls land in call order (last-write-wins on disk)", async () => {
    // First write is artificially slow. Without the queue the fast write would
    // hit localStorage first and the slow write would then overwrite it, so
    // the disk would end up with the OLD value. With the queue, the first call
    // is fully flushed before the second starts.
    delayNextEncrypt = true;
    const first = syncSecureStorage.setItem("k", "first");
    const second = syncSecureStorage.setItem("k", "second");
    await Promise.all([first, second]);
    const decrypted = await syncSecureStorage.getItemAsync("k");
    assert.strictEqual(decrypted, "second", "newer value must win, not the slower one");
  });

  it("setItem then removeItem keeps the removal after the write on disk", async () => {
    await syncSecureStorage.setItem("k", "value");
    syncSecureStorage.removeItem("k");
    assert.strictEqual(syncSecureStorage.getItem("k"), null, "read sees the removal immediately");
    await delay(DELAY_MS + 40);
    assert.strictEqual(mockStorage.getItem("k"), null, "disk removal lands after the write");
  });

  it("removeItem enqueued while a write is in flight still wins", async () => {
    delayNextEncrypt = true;
    const pending = syncSecureStorage.setItem("k", "value");
    syncSecureStorage.removeItem("k");
    await pending;
    await delay(DELAY_MS + 40);
    assert.strictEqual(mockStorage.getItem("k"), null, "queued remove beats the queued write");
    assert.strictEqual(await syncSecureStorage.getItemAsync("k"), null);
  });

  it("clear() is serialized after prior writes", async () => {
    await syncSecureStorage.setItem("a", "1");
    await syncSecureStorage.setItem("b", "2");
    syncSecureStorage.clear();
    assert.strictEqual(syncSecureStorage.getItem("a"), null, "clear is visible to reads immediately");
    assert.strictEqual(syncSecureStorage.getItem("b"), null);
    await delay(DELAY_MS + 40);
    assert.strictEqual(mockStorage.getItem("a"), null, "disk wipe lands after prior writes");
    assert.strictEqual(mockStorage.getItem("b"), null);
  });

  it("clear() enqueued behind a slow write clears it, not the reverse", async () => {
    delayNextEncrypt = true;
    const pending = syncSecureStorage.setItem("a", "1");
    syncSecureStorage.clear();
    await pending;
    await delay(DELAY_MS + 40);
    assert.strictEqual(mockStorage.getItem("a"), null, "clear runs after the queued write");
  });

  it("a new setItem clears the remove tombstone", async () => {
    await syncSecureStorage.setItem("k", "old");
    syncSecureStorage.removeItem("k");
    assert.strictEqual(syncSecureStorage.getItem("k"), null);
    await syncSecureStorage.setItem("k", "new");
    assert.strictEqual(await syncSecureStorage.getItemAsync("k"), "new");
  });

  it("sequential setItem calls for the same key are ordered", async () => {
    await syncSecureStorage.setItem("k", "one");
    await syncSecureStorage.setItem("k", "two");
    await syncSecureStorage.setItem("k", "three");
    assert.strictEqual(await syncSecureStorage.getItemAsync("k"), "three");
  });

  it("a setItem still resolves false when localStorage.setItem throws", async () => {
    const original = mockStorage.setItem.bind(mockStorage);
    try {
      mockStorage.setItem = () => { throw new Error("QuotaExceededError"); };
      const result = await syncSecureStorage.setItem("k", "v");
      assert.strictEqual(result, false);
    } finally {
      mockStorage.setItem = original;
    }
  });

  it("multiple keys serialize through the single writer without loss", async () => {
    const keys = ["a", "b", "c", "d"];
    await Promise.all(keys.map((k, i) => syncSecureStorage.setItem(k, `v${i}`)));
    for (let i = 0; i < keys.length; i++) {
      assert.strictEqual(await syncSecureStorage.getItemAsync(keys[i]), `v${i}`);
    }
  });
});
