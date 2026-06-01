import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appShellPath = "src/App.jsx";
const appShellSource = readFileSync(appShellPath, "utf8");
const malformedSeparatorPattern = /\u00e2\u20ac\u201d/;

assert.doesNotMatch(
  appShellSource,
  /^(<<<<<<<|=======|>>>>>>>)/m,
  `${appShellPath} must not contain unresolved Git conflict markers`
);

assert.doesNotMatch(
  appShellSource,
  malformedSeparatorPattern,
  `${appShellPath} must not contain malformed separator text`
);

console.log("app shell integrity tests passed");
