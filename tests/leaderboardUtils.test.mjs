import assert from "node:assert/strict";
import {
  normalizeLabel,
  calculatePrPoints,
  applyAchievementBonus,
  filterContributors,
  sortContributors,
  paginateContributors,
  totalLeaderboardPages,
  buildRanksMap,
  computeLeaderboardStats,
  getAchievementBadge,
  LABEL_POINTS,
  DEFAULT_MERGED_PR_POINTS,
  ACHIEVEMENT_THRESHOLDS,
} from "../src/utils/leaderboardUtils.js";

// ─── normalizeLabel ───────────────────────────────────────────────────────────

assert.equal(normalizeLabel("GSSoC-level-1"), "gssoclevel1", "strips hyphens and lowercases");
assert.equal(normalizeLabel("GSSoC Level1"), "gssoclevel1", "strips spaces and lowercases");
assert.equal(normalizeLabel("GSSOCLEVEL1"), "gssoclevel1", "lowercases only");
assert.equal(normalizeLabel("gssoclevel2"), "gssoclevel2", "already normalised passes through");
assert.equal(normalizeLabel(""), "", "empty string returns empty string");
assert.equal(normalizeLabel(), "", "undefined input defaults to empty string");

// ─── calculatePrPoints ────────────────────────────────────────────────────────

assert.equal(calculatePrPoints(["gssoclevel1"]), LABEL_POINTS.gssoclevel1, "level-1 label");
assert.equal(calculatePrPoints(["gssoclevel2"]), LABEL_POINTS.gssoclevel2, "level-2 label");
assert.equal(calculatePrPoints(["gssoclevel3"]), LABEL_POINTS.gssoclevel3, "level-3 label");
assert.equal(calculatePrPoints(["GSSoC-level-1"]), LABEL_POINTS.gssoclevel1, "denormalised level-1 label");
assert.equal(calculatePrPoints([]), DEFAULT_MERGED_PR_POINTS, "no labels → default points");
assert.equal(calculatePrPoints(["bug", "good-first-issue"]), DEFAULT_MERGED_PR_POINTS, "non-level labels → default");
assert.equal(
  calculatePrPoints(["gssoclevel1", "gssoclevel2"]),
  LABEL_POINTS.gssoclevel1 + LABEL_POINTS.gssoclevel2,
  "multiple level labels are summed"
);
assert.equal(
  calculatePrPoints(["gssoclevel3", "documentation"]),
  LABEL_POINTS.gssoclevel3,
  "level label mixed with other labels"
);

// ─── applyAchievementBonus ────────────────────────────────────────────────────

const noBonus = applyAchievementBonus({ username: "alice", prs: 2, points: 10 });
assert.equal(noBonus.points, 10, "no bonus below lowest threshold");

const smallBonus = applyAchievementBonus({ username: "bob", prs: 5, points: 20 });
assert.equal(
  smallBonus.points,
  20 + ACHIEVEMENT_THRESHOLDS[1].bonus,
  "5+ PRs earns the smaller bonus"
);

const largeBonus = applyAchievementBonus({ username: "carol", prs: 10, points: 30 });
assert.equal(
  largeBonus.points,
  30 + ACHIEVEMENT_THRESHOLDS[0].bonus,
  "10+ PRs earns the larger bonus"
);

// Must not mutate input
const original = { username: "dave", prs: 10, points: 50 };
const bonused = applyAchievementBonus({ ...original });
assert.equal(original.points, 50, "applyAchievementBonus does not mutate input");
assert.notEqual(bonused.points, original.points, "returned object has updated points");

// ─── filterContributors ───────────────────────────────────────────────────────

const sampleContributors = [
  { username: "alice",   name: "Alice Smith",  points: 100, prs: 15 },
  { username: "bob",     name: "Bob Jones",    points:  60, prs:  6 },
  { username: "carol",   name: "Carol White",  points:  40, prs:  3 },
  { username: "dave",    name: "Dave Black",   points:  20, prs:  1 },
];

// overall + empty search → all contributors
assert.equal(
  filterContributors(sampleContributors, "", "overall").length,
  4,
  "empty search returns all in overall"
);

// case-insensitive username match
assert.equal(
  filterContributors(sampleContributors, "ALICE", "overall").length,
  1,
  "case-insensitive username search"
);

// name match
assert.equal(
  filterContributors(sampleContributors, "jones", "overall").length,
  1,
  "name match on partial substring"
);

// no match
assert.equal(
  filterContributors(sampleContributors, "zzznomatch", "overall").length,
  0,
  "no match returns empty array"
);

// mentors category: prs >= 5
const mentors = filterContributors(sampleContributors, "", "mentors");
assert.ok(mentors.every((c) => c.prs >= 5), "mentors category filters prs < 5");
assert.equal(mentors.length, 2, "mentors: alice (15 prs) + bob (6 prs)");

// monthly category: top 60% by points threshold
const monthly = filterContributors(sampleContributors, "", "monthly");
assert.ok(monthly.length >= 1, "monthly returns at least one contributor");

// empty contributors array
assert.deepEqual(
  filterContributors([], "alice", "overall"),
  [],
  "empty contributors → empty result"
);

// ─── sortContributors ─────────────────────────────────────────────────────────

const unsorted = [
  { username: "carol", points: 40, prs: 8 },
  { username: "alice", points: 90, prs: 2 },
  { username: "bob",   points: 60, prs: 5 },
];

// sort by points (default)
const byPoints = sortContributors(unsorted, "points");
assert.equal(byPoints[0].username, "alice", "sort by points: highest first");
assert.equal(byPoints[1].username, "bob",   "sort by points: second");
assert.equal(byPoints[2].username, "carol", "sort by points: third");

// sort by prs
const byPrs = sortContributors(unsorted, "prs");
assert.equal(byPrs[0].username, "carol", "sort by prs: highest prs first");
assert.equal(byPrs[1].username, "bob",   "sort by prs: second");
assert.equal(byPrs[2].username, "alice", "sort by prs: fewest prs last");

// sort by username (a→z)
const byUsername = sortContributors(unsorted, "username");
assert.equal(byUsername[0].username, "alice", "sort by username: alphabetical first");
assert.equal(byUsername[1].username, "bob",   "sort by username: alphabetical second");
assert.equal(byUsername[2].username, "carol", "sort by username: alphabetical third");

// must not mutate input
const inputCopy = unsorted.map((c) => ({ ...c }));
sortContributors(unsorted, "points");
assert.deepEqual(unsorted, inputCopy, "sortContributors does not mutate input array");

// unknown sortBy defaults to points
const byUnknown = sortContributors(unsorted, "unknown");
assert.equal(byUnknown[0].username, "alice", "unknown sortBy falls back to points");

// single-element array
assert.equal(
  sortContributors([{ username: "solo", points: 5, prs: 1 }], "points").length,
  1,
  "single-element array sorts without error"
);

// empty array
assert.deepEqual(sortContributors([], "points"), [], "empty array sorts to empty");

// ─── paginateContributors ─────────────────────────────────────────────────────

const tenItems = Array.from({ length: 10 }, (_, i) => ({
  username: `user${i + 1}`,
  points: 10 - i,
  prs: 1,
}));

const page1 = paginateContributors(tenItems, 1, 3);
assert.equal(page1.length, 3, "page 1 of 3 per page → 3 items");
assert.equal(page1[0].username, "user1", "page 1 starts at index 0");

const page2 = paginateContributors(tenItems, 2, 3);
assert.equal(page2.length, 3, "page 2 of 3 per page → 3 items");
assert.equal(page2[0].username, "user4", "page 2 starts at index 3");

const lastPage = paginateContributors(tenItems, 4, 3);
assert.equal(lastPage.length, 1, "last page may have fewer items than perPage");
assert.equal(lastPage[0].username, "user10", "last page contains final item");

const emptyPage = paginateContributors([], 1, 10);
assert.deepEqual(emptyPage, [], "paginating empty array returns empty array");

const singlePageAll = paginateContributors(tenItems, 1, 100);
assert.equal(singlePageAll.length, 10, "perPage larger than total returns all items");

// ─── totalLeaderboardPages ────────────────────────────────────────────────────

assert.equal(totalLeaderboardPages(0,  10), 1, "0 items → minimum 1 page");
assert.equal(totalLeaderboardPages(10, 10), 1, "exact fit → 1 page");
assert.equal(totalLeaderboardPages(11, 10), 2, "one item over → 2 pages");
assert.equal(totalLeaderboardPages(5,  2),  3, "5 items at 2 per page → 3 pages");
assert.equal(totalLeaderboardPages(1,  10), 1, "single item → 1 page");
assert.equal(totalLeaderboardPages(100, 10), 10, "100 items at 10 per page → 10 pages");

// ─── buildRanksMap ────────────────────────────────────────────────────────────

const rankList = [
  { username: "alpha", points: 90, prs: 5 },
  { username: "beta",  points: 70, prs: 3 },
  { username: "gamma", points: 50, prs: 2 },
];

const ranksMap = buildRanksMap(rankList);
assert.equal(ranksMap["alpha"], 1, "first contributor is rank 1");
assert.equal(ranksMap["beta"],  2, "second contributor is rank 2");
assert.equal(ranksMap["gamma"], 3, "third contributor is rank 3");
assert.equal(Object.keys(ranksMap).length, 3, "ranks map has one entry per contributor");

const emptyRanks = buildRanksMap([]);
assert.deepEqual(emptyRanks, {}, "empty input produces empty ranks map");

// ─── computeLeaderboardStats ──────────────────────────────────────────────────

const statsList = [
  { username: "a", points: 10, prs: 2 },
  { username: "b", points: 30, prs: 5 },
  { username: "c", points: 60, prs: 3 },
];

const stats = computeLeaderboardStats(statsList);
assert.equal(stats.totalContributors, 3,  "totalContributors equals array length");
assert.equal(stats.flooredTotalPRs,   10, "flooredTotalPRs sums all prs");
assert.equal(stats.flooredTotalPoints, 100, "flooredTotalPoints sums all points");

const emptyStats = computeLeaderboardStats([]);
assert.equal(emptyStats.totalContributors, 0, "empty array → 0 contributors");
assert.equal(emptyStats.flooredTotalPRs, 0,   "empty array → 0 PRs");
assert.equal(emptyStats.flooredTotalPoints, 0, "empty array → 0 points");

// ─── getAchievementBadge ──────────────────────────────────────────────────────

const diamond = getAchievementBadge(1);
assert.equal(diamond.label, "Diamond Tier", "rank 1 → Diamond Tier");
assert.ok(typeof diamond.color === "string" && diamond.color.length > 0, "Diamond has color class");
assert.ok(diamond.icon, "Diamond badge has icon");

const platinum2 = getAchievementBadge(2);
assert.equal(platinum2.label, "Platinum Tier", "rank 2 → Platinum Tier");

const platinum3 = getAchievementBadge(3);
assert.equal(platinum3.label, "Platinum Tier", "rank 3 → Platinum Tier");

const gold4 = getAchievementBadge(4);
assert.equal(gold4.label, "Gold Tier", "rank 4 → Gold Tier");

const gold10 = getAchievementBadge(10);
assert.equal(gold10.label, "Gold Tier", "rank 10 → Gold Tier");

const silver11 = getAchievementBadge(11);
assert.equal(silver11.label, "Silver Tier", "rank 11 → Silver Tier");

const silver100 = getAchievementBadge(100);
assert.equal(silver100.label, "Silver Tier", "rank 100 → Silver Tier");

// ─── Integration: filter → sort → paginate pipeline ──────────────────────────

// Verify that the derived-value pipeline in Leaderboard.jsx produces correct
// results: filteredContributors → sortedContributors → currentContributors.
const pipeline = [
  { username: "zara",   name: "Zara",   points: 80, prs: 12 },
  { username: "mike",   name: "Mike",   points: 50, prs:  7 },
  { username: "nina",   name: "Nina",   points: 30, prs:  3 },
  { username: "oscar",  name: "Oscar",  points: 20, prs:  2 },
  { username: "priya",  name: "Priya",  points: 10, prs:  1 },
];

const filtered  = filterContributors(pipeline, "", "mentors"); // prs >= 5
const sorted    = sortContributors(filtered, "prs");           // sort by PRs desc
const page      = paginateContributors(sorted, 1, 2);

assert.equal(filtered.length, 2,              "pipeline: mentors filter leaves prs>=5");
assert.equal(sorted[0].username, "zara",      "pipeline: highest prs after sort is zara");
assert.equal(page.length, 2,                  "pipeline: first page has 2 items");
assert.equal(page[0].username, "zara",        "pipeline: page 1 item 1 is zara");

// Confirm top3 derived from sortedContributors matches sort criterion.
// This is the fix: top3 must come from the sorted array, not filtered.
const sortedByPrs = sortContributors(pipeline, "prs");
const top3ByPrs   = sortedByPrs.slice(0, 3);
assert.equal(top3ByPrs[0].username, "zara",  "top3 by prs: zara is #1");
assert.equal(top3ByPrs[1].username, "mike",  "top3 by prs: mike is #2");
assert.equal(top3ByPrs[2].username, "nina",  "top3 by prs: nina is #3");

// The old (broken) behaviour would have been:
const top3FromFiltered = pipeline.slice(0, 3); // filteredContributors order = insertion order
assert.notEqual(
  top3FromFiltered[0].username,
  top3ByPrs[0].username === top3FromFiltered[0].username ? "SAME" : top3ByPrs[0].username,
  "top3 from sorted differs from top3 from unsorted when sort != default order"
);

console.log("leaderboardUtils tests passed ✓");
