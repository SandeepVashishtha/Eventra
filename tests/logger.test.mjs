import assert from "node:assert/strict";

const logged = [];
globalThis.console = {
  log: (...args) => logged.push(args),
  info: (...args) => logged.push(args),
  warn: (...args) => logged.push(args),
  error: (...args) => logged.push(args),
};

import { logger } from "../src/utils/logger.js";

logger.warn("Attention");
assert.equal(logged.some(([msg]) => msg === "[WARN] Attention"), true);

logger.error("Failed");
assert.equal(logged.some(([msg]) => msg === "[ERROR] Failed"), true);

logger.info("User login", {
  email: "person@example.com",
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature_123456789",
  password: "super-secret",
});

const infoEntry = logged.find(([msg]) => msg === "[INFO] User login");
assert.ok(infoEntry, "Should log info entry");
assert.equal(infoEntry[1].email, "[REDACTED_SECRET]");
assert.equal(infoEntry[1].Authorization, "[REDACTED_SECRET]");
assert.equal(infoEntry[1].password, "[REDACTED_SECRET]");

console.log("logger tests passed");
