import { strict as assert } from "node:assert";
import { describe, it, beforeEach } from "node:test";

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
}

const mockStorage = new LocalStorageMock();
global.localStorage = mockStorage;

// Import after setting global.localStorage
const { logAbuseAttempt } = await import("../src/utils/abuseLogger.js");

describe("abuseLogger robustness", () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it("should successfully log attempt when storage is empty", () => {
    logAbuseAttempt("XSS", { payload: "<script>" });
    const raw = mockStorage.getItem("eventra_abuse_logs");
    assert.ok(raw);
    const parsed = JSON.parse(raw);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].type, "XSS");
    assert.equal(parsed[0].details.payload, "<script>");
  });

  it("should recover and log attempt when storage contains invalid JSON", () => {
    mockStorage.setItem("eventra_abuse_logs", "{invalidjson");
    logAbuseAttempt("SQLI", { payload: "1' OR '1'='1" });

    const raw = mockStorage.getItem("eventra_abuse_logs");
    assert.ok(raw);
    const parsed = JSON.parse(raw);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].type, "SQLI");
  });

  it("should recover and log attempt when storage contains a non-array JSON value", () => {
    mockStorage.setItem("eventra_abuse_logs", JSON.stringify({ notAnArray: true }));
    logAbuseAttempt("CSRF", { payload: "malicious-origin" });

    const raw = mockStorage.getItem("eventra_abuse_logs");
    assert.ok(raw);
    const parsed = JSON.parse(raw);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].type, "CSRF");
  });

  it("should append logs up to a maximum limit of 100", () => {
    // Populate with 105 logs
    const initialLogs = Array.from({ length: 105 }, (_, i) => ({
      type: "DUMMY",
      timestamp: Date.now() - i,
      details: { i },
    }));
    mockStorage.setItem("eventra_abuse_logs", JSON.stringify(initialLogs));

    logAbuseAttempt("NEW_ATTEMPT", { key: "val" });

    const raw = mockStorage.getItem("eventra_abuse_logs");
    const parsed = JSON.parse(raw);
    assert.equal(parsed.length, 100);
    assert.equal(parsed[99].type, "NEW_ATTEMPT");
  });
});
