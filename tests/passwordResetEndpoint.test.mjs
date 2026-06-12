import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/components/auth/PasswordReset.js", "utf8");

assert.match(source, /API_ENDPOINTS\.AUTH\.RESET_PASSWORD/);
assert.doesNotMatch(source, /\/api\/auth\/password-reset/);
