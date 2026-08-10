import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync(
  "Backend/src/main/java/com/sandeep/eventrabackend/config/SecurityConfig.java",
  "utf8",
);

for (const token of [
  '"PATCH"',
  '"X-CSRF-Token"',
  '"Idempotency-Key"',
  '"X-Request-Integrity"',
  '"X-Timestamp"',
  '"X-Nonce"',
  '"X-Signature"',
]) {
  assert.equal(source.includes(token), true, `SecurityConfig CORS allowlist should include ${token}`);
}

console.log("CORS security config contract checks passed");
