import assert from "node:assert/strict";
import { debounceAsync } from "../src/utils/debounceUtils.js";

let count = 0;
const fn = debounceAsync(async () => { count++; }, 10);
const p1 = fn();
const p2 = fn();

await assert.rejects(p1);
await p2;
assert.equal(count, 1);
console.log("debounceUtils edge tests passed ✓");
