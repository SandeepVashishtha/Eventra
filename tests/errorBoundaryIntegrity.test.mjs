import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const errorBoundaryPath = "src/components/common/ErrorBoundary.jsx";
const errorBoundarySource = readFileSync(errorBoundaryPath, "utf8");

assert.doesNotMatch(
  errorBoundarySource,
  /^(<<<<<<<|=======|>>>>>>>)/m,
  `${errorBoundaryPath} must not contain unresolved Git conflict markers`
);

console.log("error boundary integrity tests passed");
