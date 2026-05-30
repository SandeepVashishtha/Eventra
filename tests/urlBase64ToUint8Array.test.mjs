import assert from "node:assert/strict";

global.window = {
  atob: (value) => Buffer.from(value, "base64").toString("binary"),
};

const { urlBase64ToUint8Array } = await import("../src/utils/notificationPreferences.js");

assert.deepEqual(Array.from(urlBase64ToUint8Array("AQID")), [1, 2, 3]);

const encoded = Buffer.from([10, 20, 30, 40]).toString("base64url").replace(/=/g, "");
assert.deepEqual(
  Array.from(urlBase64ToUint8Array(encoded)),
  [10, 20, 30, 40],
  "handles unpadded base64url input"
);

console.log("urlBase64ToUint8Array tests passed ✓");
