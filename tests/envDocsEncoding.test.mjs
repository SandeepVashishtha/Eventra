import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const envDocFiles = [
  ".env.example",
  "README.md",
  "docs/ENV_SETUP_GUIDE.md",
];

const encodingArtifactPattern = /(?:â|ð|�|œ|Ÿ|ƒ|€|™|“|”|‘|’|†|‡|•|…)/;

for (const filePath of envDocFiles) {
  const source = readFileSync(filePath, "utf8");

  assert.doesNotMatch(
    source,
    encodingArtifactPattern,
    `${filePath} must not contain common encoding artifacts`
  );
}

console.log("environment documentation encoding tests passed");
