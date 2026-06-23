import assert from "node:assert/strict";
import { simpleCompress, simpleDecompress } from "../src/utils/compressor.js";

const raw = "hello-offline-data";
const comp = simpleCompress(raw);
assert.strictEqual(simpleDecompress(comp), raw);
console.log("compressor tests passed ✓");
