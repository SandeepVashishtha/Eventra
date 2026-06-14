import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
  filterHackathons,
  matchesPrizeRange,
  normalizeFilterValue,
} from "../src/Pages/Hackathons/hackathonFilterUtils.mjs";

const require = createRequire(import.meta.url);
const hackathons = require("../src/Pages/Hackathons/hackathonMockData.json");

assert.equal(normalizeFilterValue(["Advanced"]), "Advanced");
assert.equal(normalizeFilterValue(" Beginner "), "Beginner");
assert.equal(normalizeFilterValue([]), "");

assert.equal(matchesPrizeRange("$750", "Under $1,000"), true);
assert.equal(matchesPrizeRange("$1,000", "Under $1,000"), false);
assert.equal(matchesPrizeRange("$1,000", "$1,000 - $5,000"), true);
assert.equal(matchesPrizeRange("$5,000", "$1,000 - $5,000"), true);
assert.equal(matchesPrizeRange("$50,000", "$5,000+"), true);
assert.equal(matchesPrizeRange("Prize TBA", "$5,000+"), false);

assert.deepEqual(
  filterHackathons(hackathons, {
    filters: { difficulty: ["Advanced"] },
  }).map((hackathon) => hackathon.difficulty),
  ["Advanced", "Advanced"],
  "legacy array difficulty filters still match hackathons",
);

assert.deepEqual(
  filterHackathons(hackathons, {
    filters: { prize: "$5,000+" },
  }).map((hackathon) => hackathon.title),
  hackathons.map((hackathon) => hackathon.title),
  "$5,000+ prize filter includes all seeded hackathons above the threshold",
);

assert.deepEqual(
  filterHackathons(hackathons, {
    filters: { location: ["new york"] },
  }).map((hackathon) => hackathon.location),
  ["New York, NY", "New York, NY"],
  "legacy array location filters are normalized and matched case-insensitively",
);

assert.deepEqual(
  filterHackathons(hackathons, {
    activeTab: "live",
    filters: {
      difficulty: "Intermediate",
      prize: "$5,000+",
      location: "Los Angeles",
    },
    selectedTags: ["Unity"],
  }).map((hackathon) => hackathon.title),
  ["Virtual Reality Hackathon"],
  "tab, dropdown, and technology filters compose correctly",
);

if (process.env.NODE_ENV === "development") {
  console.log("hackathon filter utilities passed");
}
