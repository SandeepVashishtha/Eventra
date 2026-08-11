import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appPath = "src/App.jsx";
const appSource = readFileSync(appPath, "utf8");

// Test 1: ErrorButton must be wrapped in development-only check
assert.match(
  appSource,
  /import\.meta\.env\.DEV\s*&&\s*<ErrorButton\s*\/>/,
  `${appPath} must wrap ErrorButton with import.meta.env.DEV check to prevent production exposure`
);

// Test 2: ErrorButton component must still exist for development testing
assert.match(
  appSource,
  /function ErrorButton\(\)/,
  `${appPath} must retain ErrorButton component definition for development testing`
);

// Test 3: ErrorButton must not be rendered unconditionally
assert.doesNotMatch(
  appSource,
  /^\s*<ErrorButton\s*\/>\s*$/m,
  `${appPath} must not render ErrorButton unconditionally (must be dev-only)`
);

// Test 4: Verify the error-throwing behavior is preserved
assert.match(
  appSource,
  /throw new Error\(['"]This is your first error!['"]\)/,
  `${appPath} must preserve ErrorButton error-throwing behavior for development testing`
);

console.log("error button production safety tests passed ✓");
