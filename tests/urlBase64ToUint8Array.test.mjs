import assert from "node:assert/strict";
import { urlBase64ToUint8Array } from "../src/utils/notificationPreferences.js";

globalThis.window = globalThis.window || {};
if (!globalThis.window.atob) {
  globalThis.window.atob = (str) => Buffer.from(str, "base64").toString("binary");
}

const result1 = urlBase64ToUint8Array("AQID");
assert.ok(result1 instanceof Uint8Array, "returns Uint8Array");
assert.equal(result1.length, 3, "AQID decodes to 3 bytes");
assert.equal(result1[0], 1, "first byte is 1");
assert.equal(result1[1], 2, "second byte is 2");
assert.equal(result1[2], 3, "third byte is 3");

const result2 = urlBase64ToUint8Array("AQIDBA==");
assert.ok(result2 instanceof Uint8Array, "padded base64 returns Uint8Array");
assert.equal(result2.length, 4, "padded decodes to 4 bytes");
assert.equal(result2[0], 1, "first byte is 1");
assert.equal(result2[1], 2, "second byte is 2");
assert.equal(result2[2], 3, "third byte is 3");
assert.equal(result2[3], 4, "fourth byte is 4");

const result3 = urlBase64ToUint8Array("");
assert.ok(result3 instanceof Uint8Array, "empty string returns Uint8Array");
assert.equal(result3.length, 0, "empty string decodes to 0 bytes");

const result4 = urlBase64ToUint8Array("AAAA");
assert.ok(result4 instanceof Uint8Array, "AAAA decodes to Uint8Array");
assert.equal(result4.length, 3, "AAAA decodes to 3 bytes [0, 0, 0]");

const result5 = urlBase64ToUint8Array("dGVzdA==");
const expected5 = new TextEncoder().encode("test");
assert.equal(result5.length, expected5.length, "test encodes to correct length");
for (let i = 0; i < result5.length; i++) {
  assert.equal(result5[i], expected5[i], `byte ${i} matches`);
}

console.log("All urlBase64ToUint8Array tests passed!");