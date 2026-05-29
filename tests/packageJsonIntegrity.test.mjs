import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const packageFiles = ["package.json", "package-lock.json"];
const conflictMarkerPattern = /^(<<<<<<<|=======|>>>>>>>)/m;

for (const filePath of packageFiles) {
  const fileContents = readFileSync(filePath, "utf8");

  assert.doesNotMatch(
    fileContents,
    conflictMarkerPattern,
    `${filePath} must not contain unresolved Git conflict markers`
  );

  assert.doesNotThrow(
    () => JSON.parse(fileContents),
    `${filePath} must remain valid JSON`
  );
}

console.log("package JSON integrity tests passed");
