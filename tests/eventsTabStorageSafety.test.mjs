import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/components/user/EventsTab.js", import.meta.url),
  "utf8"
);

assert.match(
  source,
  /safeParseJson\(localStorage\.getItem\("recentEvents"\), \[\]\)/,
  "EventsTab must parse recentEvents with the safe JSON helper"
);

assert.doesNotMatch(
  source,
  /JSON\.parse\(\s*localStorage\.getItem\("recentEvents"\)\s*\|\|\s*"\[\]"\s*\)/,
  "EventsTab must not use raw JSON.parse for recentEvents storage"
);

console.log("EventsTab storage safety tests passed");
