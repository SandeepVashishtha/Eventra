import assert from "node:assert/strict";
import { logAbuseAttempt } from "../src/utils/abuseLogger.js";

const store = {};
globalThis.localStorage = {
  getItem(key) { return store[key] || null; },
  setItem(key, value) { store[key] = String(value); }
};

logAbuseAttempt("test_type", { foo: "bar" });
const logs = JSON.parse(store["eventra_abuse_logs"]);
assert.equal(logs.length, 1);
assert.equal(logs[0].type, "test_type");
assert.equal(logs[0].details.foo, "bar");
console.log("abuseLogger tests passed ✓");
