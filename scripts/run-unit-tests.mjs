import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const testsDir = path.resolve("tests");
const loaderUrl = pathToFileURL(path.resolve("tests/loaders/jsExtension.mjs")).href;
const unitTestFilePattern = /(?:\.test|\.edge\.test|-edge\.test)\.mjs$/;

const testFiles = readdirSync(testsDir)
  .filter((fileName) => unitTestFilePattern.test(fileName))
  .sort((a, b) => a.localeCompare(b))
  .map((fileName) => path.join(testsDir, fileName));

const failedTests = [];

console.log(`Discovered ${testFiles.length} unit test files.`);
console.log("Excluded from this runner: tests/e2e/*.spec.js (run with npm run test:e2e) and non-Node .js test files.");

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
    failedTests.push(relativeTestFile);
  }
}

console.log(`\nRan ${testFiles.length} unit test files.`);

if (failedTests.length > 0) {
  console.error(`\n${failedTests.length} unit test file(s) failed:`);
  for (const testFile of failedTests) {
    console.error(`- ${testFile}`);
  }
  process.exit(1);
}
