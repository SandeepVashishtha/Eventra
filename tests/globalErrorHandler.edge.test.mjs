import assert from "node:assert/strict";
import { initializeGlobalErrorHandling } from "../src/utils/globalErrorHandler.js";

initializeGlobalErrorHandling();

let onerrorRegistered = false;
let onunhandledrejectionRegistered = false;

globalThis.window = {
  set onerror(val) { onerrorRegistered = true; },
  set onunhandledrejection(val) { onunhandledrejectionRegistered = true; }
};

initializeGlobalErrorHandling();
assert.equal(onerrorRegistered, true);
assert.equal(onunhandledrejectionRegistered, true);

console.log("globalErrorHandler edge tests passed ✓");
