import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const testsDir = path.resolve("tests");
const loaderUrl = pathToFileURL(path.resolve("tests/loaders/jsExtension.mjs")).href;

const nonUtilityTests = new Set([
  "animatedCounter.test.mjs",
  "appShellIntegrity.test.mjs",
  "backToTopButtonIntegrity.test.mjs",
  "contributorsCarousel.test.mjs",
  "errorBoundaryIntegrity.test.mjs",
  "eventCreationAuth.test.mjs",
  "eventDetails.test.mjs",
  "floorPlanAccessibility.test.mjs",
  "globalErrorHandler.test.mjs",
  "highlightMatch.contract.test.mjs",
  "packageJsonIntegrity.test.mjs",
]);

const testFiles = readdirSync(testsDir)
  .filter((fileName) => fileName.endsWith(".mjs"))
  .filter((fileName) => !nonUtilityTests.has(fileName))
  .sort((a, b) => a.localeCompare(b))
  .map((fileName) => path.join(testsDir, fileName));

for (const testFile of testFiles) {
  const relativeTestFile = path.relative(process.cwd(), testFile);
  console.log(`\n> ${relativeTestFile}`);

  const result = spawnSync(
    process.execPath,
    ["--loader", loaderUrl, testFile],
    {
      env: {
        ...process.env,
        NODE_NO_WARNINGS: "1",
      },
      stdio: "inherit",
    }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`\nRan ${testFiles.length} unit test files.`);
