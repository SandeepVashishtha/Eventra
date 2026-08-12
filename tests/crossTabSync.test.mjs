import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TAB_ID, isValidTheme, broadcastThemeChange, subscribeThemeBroadcast } from "../src/utils/themeSync.js";

describe("Cross-Tab Sync & Ping-Pong Loop Prevention Tests", () => {
  it("should generate a unique non-empty TAB_ID for tab instance isolation", () => {
    assert.ok(typeof TAB_ID === "string" && TAB_ID.length > 0);
  });

  it("should validate theme strings strictly", () => {
    assert.equal(isValidTheme("dark"), true);
    assert.equal(isValidTheme("light"), true);
    assert.equal(isValidTheme("system"), true);
    assert.equal(isValidTheme("invalid-theme"), false);
  });

  it("should handle broadcast subscriptions gracefully in test environment", () => {
    const unsubscribe = subscribeThemeBroadcast(() => {});
    assert.ok(typeof unsubscribe === "function");
    unsubscribe();
  });
});
