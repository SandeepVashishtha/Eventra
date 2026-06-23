import assert from "node:assert/strict";
import { lockBodyScroll, unlockBodyScroll } from "../src/utils/scrollLock.js";

assert.strictEqual(typeof lockBodyScroll, "function");
console.log("scrollLock tests loaded ✓");
