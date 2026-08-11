import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/Pages/Events/EventDetails.js", "utf8");

assert.match(source, /<ReminderControls\s+event=\{event\}/);
assert.match(source, /canSetReminder=\{canSetReminder\}/);
assert.doesNotMatch(source, /import EventMaterials/);

console.log("event details reminder controls contract passed");
