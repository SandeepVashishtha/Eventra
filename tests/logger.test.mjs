import assert from "node:assert/strict";

let logged = [];
globalThis.console = {
  log: (msg) => logged.push(msg),
  info: (msg) => logged.push(msg),
  warn: (msg) => logged.push(msg),
  error: (msg) => logged.push(msg)
};

import { logger } from "../src/utils/logger.js";

logger.warn("Attention");
assert.equal(logged.includes("[WARN] Attention"), true);

logger.error("Failed");
assert.equal(logged.includes("[ERROR] Failed"), true);

console.log("logger tests passed ✓");
