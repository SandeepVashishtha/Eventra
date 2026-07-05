import assert from "node:assert/strict";
import { playNotificationSound } from "../src/utils/soundHelper.js";

assert.strictEqual(typeof playNotificationSound, "function");
console.log("soundHelper tests loaded ✓");
