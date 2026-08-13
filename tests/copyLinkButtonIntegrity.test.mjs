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
  /aria-label/,
  "CopyLinkButton must have an accessibility aria-label"
);

assert.match(
  source,
  /"Share event invite"/,
  "CopyLinkButton must expose the native-share aria-label branch"
);

assert.match(
  source,
  /"Copy event link"/,
  "CopyLinkButton must expose the copy-invite aria-label branch"
);

console.log("CopyLinkButton integrity tests passed");
