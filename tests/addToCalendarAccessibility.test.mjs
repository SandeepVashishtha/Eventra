import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/components/common/AddToCalendar.jsx", import.meta.url),
  "utf8"
);

assert.match(source, /alt="Google Calendar icon"/, "Google Calendar icon needs descriptive alt text");
assert.match(source, /alt="Outlook Calendar icon"/, "Outlook Calendar icon needs descriptive alt text");
assert.doesNotMatch(source, /alt=""/, "AddToCalendar should not use empty alt text for meaningful icons");

console.log("AddToCalendar accessibility tests passed");
