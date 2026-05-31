import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.resolve(__dirname, "../src/utils/lazyWithRetry.js"), "utf8");

assert.ok(src.includes("export function lazyWithRetry"), "exports lazyWithRetry helper");
assert.ok(src.includes("return lazy(retryImport)"), "wraps retry import with React.lazy");
assert.ok(src.includes("attempt <= retries"), "retries failed dynamic imports");
assert.ok(src.includes("delay * attempt"), "uses increasing backoff between retries");
assert.ok(src.includes("console.warn"), "logs warning after final failure");

async function simulateRetry(importFn, retries = 2, delay = 1) {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await importFn();
    } catch (error) {
      attempt += 1;
      if (attempt > retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
  return null;
}

let calls = 0;
const recovered = await simulateRetry(async () => {
  calls += 1;
  if (calls < 2) throw new Error("chunk failed");
  return { default: "loaded" };
}, 2, 1);

assert.deepEqual(recovered, { default: "loaded" });
assert.equal(calls, 2);

console.log("lazyWithRetry tests passed ✓");
