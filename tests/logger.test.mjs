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
assert.equal(
  logged.some(([prefix, msg]) => prefix === "[WARN]" && msg === "Attention"),
  true,
);

logger.error("Failed");
assert.equal(
  logged.some(([prefix, msg]) => prefix === "[ERROR]" && msg === "Failed"),
  true,
);

logger.info("User login", {
  email: "person@example.com",
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature_123456789",
  password: "super-secret",
});

const infoEntry = logged.find(([prefix]) => prefix === "[INFO]");
assert.ok(infoEntry, "Should log info entry");
assert.equal(infoEntry[1], "User login");
assert.equal(infoEntry[2].email, "[REDACTED_SECRET]");
assert.equal(infoEntry[2].Authorization, "[REDACTED_SECRET]");
assert.equal(infoEntry[2].password, "[REDACTED_SECRET]");

logger.security("csrf_token_missing", { token: "super-secret-token" });
const securityEntry = logged.find(([prefix]) => prefix === "[SECURITY]");
assert.ok(securityEntry, "Should log security entry");
assert.equal(securityEntry[1].token, "[REDACTED_SECRET]");

console.log("logger tests passed");
