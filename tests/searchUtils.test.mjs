import assert from "node:assert/strict";
import { normalizeSearchText, getRouteSearchResults } from "../src/utils/searchUtils.mjs";

try {
  assert.equal(normalizeSearchText("Hello World!"), "hello world");
  assert.equal(normalizeSearchText("Café"), "cafe");

  const items = [
    { title: "React Eventra", tags: ["tech"] },
    { title: "Nextjs Meetup", tags: ["tech"] },
  ];
  const results = getRouteSearchResults(items, "react", ["title"]);
  assert.equal(results.length, 1);
  assert.equal(results[0].title, "React Eventra");

  console.log("searchUtils tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
