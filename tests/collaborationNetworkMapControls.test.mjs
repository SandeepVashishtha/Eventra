import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/components/visual/CollaborationNetworkMap.jsx", "utf8");

assert.match(source, /value=\{selectedRegion\}/);
assert.match(source, /setSelectedRegion\(e\.target\.value\)/);
assert.match(source, /checked=\{particlesEnabled\}/);
assert.match(source, /setParticlesEnabled\(e\.target\.checked\)/);
assert.match(source, /useReducedMotion/);

console.log("collaboration network map controls contract passed");
