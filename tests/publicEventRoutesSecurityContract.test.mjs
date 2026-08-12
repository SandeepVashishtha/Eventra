import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync(
  "Backend/src/main/java/com/sandeep/eventrabackend/config/SecurityConfig.java",
  "utf8",
);

for (const route of ['"/api/events/search"', '"/api/events/alternatives"']) {
  assert.equal(source.includes(route), true, `${route} should be permitted for public GET requests`);
}

console.log("public event route security contract checks passed");
