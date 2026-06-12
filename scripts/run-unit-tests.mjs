import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const testsDir = "tests";
const loaderPath = "./tests/loaders/jsExtension.mjs";
const registerLoader = `data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("${loaderPath}", pathToFileURL("./"));`;
const testFiles = readdirSync(testsDir)
  .filter((fileName) => fileName.endsWith(".test.mjs"))
  .sort()
  .map((fileName) => join(testsDir, fileName));

if (testFiles.length === 0) {
  console.error("No .test.mjs files found in tests/");
  process.exit(1);
}

for (const testFile of testFiles) {
  const result = spawnSync(process.execPath, ["--import", registerLoader, testFile], {
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
