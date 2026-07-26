import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/utils/validationApi.js", "utf8");

// Test 1: Verify that silent catch blocks have been replaced
assert.ok(
  !source.includes("catch {}"),
  "Should not have empty catch blocks"
);
assert.ok(
  !source.includes("catch (e) {}"),
  "Should not have empty catch blocks with error variable"
);
assert.ok(
  !source.includes("catch (error) {}"),
  "Should not have empty catch blocks with error variable"
);

// Test 2: Verify error logging is present for sanitization failures
assert.ok(
  source.includes("[validationApi] Failed to sanitize request payload"),
  "Should log sanitization failures"
);
assert.ok(
  source.includes("console.error"),
  "Should use console.error for logging"
);

// Test 3: Verify error logging includes contextual information
assert.ok(
  source.includes("endpoint"),
  "Should include endpoint in error logs"
);
assert.ok(
  source.includes("method"),
  "Should include method in error logs"
);
assert.ok(
  source.includes("error: error.message"),
  "Should include error message in logs"
);
assert.ok(
  source.includes("stack: error.stack"),
  "Should include stack trace in logs"
);

// Test 4: Verify error logging for JSON parsing failures
assert.ok(
  source.includes("[validationApi] Failed to parse JSON response"),
  "Should log JSON parsing failures"
);

// Test 5: Verify HTML sanitization logic is still present
assert.ok(
  source.includes("replace(/<[^>]*>/g"),
  "Should still strip HTML tags"
);

// Test 6: Verify backward compatibility - original body is preserved on failure
assert.ok(
  source.includes("sanitizedBody = body"),
  "Should preserve original body when sanitization fails"
);

console.log("validationApi error handling tests passed");
