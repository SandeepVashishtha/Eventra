import assert from "node:assert/strict";
import { safeLocalStorage, safeSessionStorage, isLocalStorageAvailable } from "../src/utils/safeStorage.js";

globalThis.window = {
  localStorage: {
    store: {},
    setItem(k, v) { this.store[k] = v; },
    getItem(k) { return this.store[k] || null; },
    removeItem(k) { delete this.store[k]; },
    clear() { this.store = {}; },
    get length() { return Object.keys(this.store).length; }
  }
};

try {
  assert.equal(isLocalStorageAvailable(), true);
  safeLocalStorage.setItem("test", "val");
  assert.equal(safeLocalStorage.getItem("test"), "val");
  safeLocalStorage.setJson("obj", { a: 1 });
  assert.deepStrictEqual(safeLocalStorage.getJson("obj"), { a: 1 });

  console.log("safeStorage tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
