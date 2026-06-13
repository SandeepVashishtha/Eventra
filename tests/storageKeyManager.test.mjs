import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { JSDOM } from "jsdom";

process.env.TEST_OPACITY = "true";

// Setup JSDOM environment for localStorage
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost",
});
globalThis.window = dom.window;
globalThis.localStorage = dom.window.localStorage;

// Import target under test
const { getOpaqueKey, getOrMigrateKey } = await import("../src/utils/storageKeyManager.js");

describe("storageKeyManager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("key hashing generates opaque keys utilizing SHA-256", () => {
    const key = getOpaqueKey("bookmarks", "user-123");
    assert.match(key, /^bookmarks_[a-f0-9]{64}$/);
  });

  it("handles guest fallback", () => {
    const keyWithNull = getOpaqueKey("bookmarks", null);
    assert.strictEqual(keyWithNull, "bookmarks_guest");

    const keyWithUndefined = getOpaqueKey("bookmarks", undefined);
    assert.strictEqual(keyWithUndefined, "bookmarks_guest");

    const keyWithGuest = getOpaqueKey("bookmarks", "guest");
    assert.strictEqual(keyWithGuest, "bookmarks_guest");
  });

  it("no raw userId leakage", () => {
    const userId = "highly_sensitive_user_id_12345";
    const key = getOpaqueKey("bookmarks", userId);
    assert.strictEqual(key.includes(userId), false);
  });

  it("deterministic behavior", () => {
    const key1 = getOpaqueKey("bookmarks", "user-456");
    const key2 = getOpaqueKey("bookmarks", "user-456");
    assert.strictEqual(key1, key2);
  });

  it("uniqueness between different users", () => {
    const key1 = getOpaqueKey("bookmarks", "user-1");
    const key2 = getOpaqueKey("bookmarks", "user-2");
    assert.notStrictEqual(key1, key2);
  });

  it("uniqueness between different namespaces", () => {
    const key1 = getOpaqueKey("bookmarks", "user-1");
    const key2 = getOpaqueKey("drafts", "user-1");
    assert.notStrictEqual(key1, key2);
  });

  it("migration correctly moves data and removes legacy key", () => {
    const legacyKey = "bookmarks_user-789";
    const testData = JSON.stringify([{ id: "event-1", title: "Test Event" }]);

    localStorage.setItem(legacyKey, testData);

    const resolvedKey = getOrMigrateKey("bookmarks", "user-789", legacyKey);

    assert.strictEqual(localStorage.getItem(resolvedKey), testData);
    assert.strictEqual(localStorage.getItem(legacyKey), null);
  });

  it("migration is a no-op if legacy key is empty", () => {
    const legacyKey = "bookmarks_user-abc";
    const resolvedKey = getOrMigrateKey("bookmarks", "user-abc", legacyKey);

    assert.strictEqual(localStorage.getItem(resolvedKey), null);
    assert.strictEqual(localStorage.getItem(legacyKey), null);
  });
});
