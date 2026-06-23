import assert from "node:assert/strict";
import { safeCookieStorage } from "../src/utils/safeCookieStorage.js";

// Basic environment setup for mock document
global.document = { cookie: "" };

safeCookieStorage.setItem("testKey", "testVal");
assert.ok(global.document.cookie.includes("testKey=testVal"));
assert.strictEqual(safeCookieStorage.getItem("testKey"), "testVal");
console.log("safeCookieStorage tests passed ✓");
