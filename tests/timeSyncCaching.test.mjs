import assert from "node:assert/strict";
import { setServerClockOffsetMs, getServerClockOffsetMs } from "../src/utils/timeSync.js";

globalThis.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = String(value); }
};

try {
  setServerClockOffsetMs(15000);
  assert.equal(getServerClockOffsetMs(), 15000, "Should match set offset");
  assert.equal(localStorage.getItem("eventra_server_time_offset"), "15000", "Should cache offset in localStorage");
  
  console.log("timeSync localstorage caching tests passed ✓");
} finally {
  delete globalThis.localStorage;
}
