import assert from "node:assert/strict";
import { announceToScreenReader } from "../src/utils/announcer.js";

assert.strictEqual(typeof announceToScreenReader, "function");
console.log("announcer tests loaded ✓");
