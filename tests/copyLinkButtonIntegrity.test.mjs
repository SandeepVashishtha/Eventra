import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sourcePath = "src/components/common/CopyLinkButton.jsx";
const source = readFileSync(sourcePath, "utf8");

assert.match(
  source,
  /type="button"/,
  "CopyLinkButton must have explicit type='button' attribute"
);

assert.match(
  source,
  /aria-label="Copy event link"/,
  "CopyLinkButton must have accessiblity aria-label"
);

console.log("CopyLinkButton integrity tests passed");
