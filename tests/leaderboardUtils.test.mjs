import assert from "node:assert/strict";
import {
  normalizeLabel,
  calculatePrPoints,
  filterContributors,
  sortContributors,
  paginateContributors,
  totalLeaderboardPages,
  buildRanksMap,
  computeLeaderboardStats,
  getAchievementBadge
} from "../src/utils/leaderboardUtils.js";

assert.equal(normalizeLabel("GSSoC-level-1"), "gssoclevel1");
assert.equal(calculatePrPoints(["gssoclevel1"]), 3);
assert.equal(calculatePrPoints(["gssoclevel3"]), 10);
assert.equal(calculatePrPoints([]), 1);

const contributors = [
  { username: "alice", points: 15, prs: 3 },
  { username: "bob", points: 25, prs: 5 }
];

const sorted = sortContributors(contributors, "points");
assert.equal(sorted[0].username, "bob");

const filtered = filterContributors(contributors, "ali", "overall");
assert.equal(filtered.length, 1);

assert.equal(totalLeaderboardPages(5, 2), 3);
assert.deepEqual(paginateContributors(contributors, 1, 1).length, 1);

const ranks = buildRanksMap(contributors);
assert.equal(ranks["alice"], 1);

const stats = computeLeaderboardStats(contributors);
assert.equal(stats.totalContributors, 2);
assert.equal(stats.flooredTotalPRs, 8);

const badge = getAchievementBadge(1, 3, 15);
assert.equal(badge.label, "Diamond Tier");

console.log("leaderboardUtils tests passed ✓");
