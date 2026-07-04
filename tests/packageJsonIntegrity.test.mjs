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

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

assert.ok(
  packageJson.devDependencies?.jsdom,
  "jsdom must stay in devDependencies because sanitizer unit tests create a JSDOM window"
);

console.log("package JSON integrity tests passed");
