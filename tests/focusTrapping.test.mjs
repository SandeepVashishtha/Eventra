import assert from "node:assert/strict";
import { shiftFocusToElement } from "../src/utils/focusTrapping.js";

assert.strictEqual(typeof shiftFocusToElement, "function");
console.log("focusTrapping tests loaded ✓");
