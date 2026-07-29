import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/hooks/useEventRegistration.js", "utf8");

assert.match(source, /export const MAX_NOTES_CHARS = 500/);
assert.match(source, /const handleRegistrationChange = useCallback/);
assert.match(source, /value\.slice\(0, MAX_NOTES_CHARS\)/);
assert.match(source, /additionalInfo:\s*formData\.additionalInfo\.slice\(0, MAX_NOTES_CHARS\)/);

console.log("event registration notes limit contract passed");
