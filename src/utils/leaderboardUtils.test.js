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
} from "./leaderboardUtils";

// ---------------------------------------------------------------------------
// normalizeLabel
// ---------------------------------------------------------------------------

describe("normalizeLabel", () => {
  it("lowercases and removes non-alphanumeric characters", () => {
    expect(normalizeLabel("GSSoC Level1")).toBe("gssoclevel1");
    expect(normalizeLabel("gssoc-level-1")).toBe("gssoclevel1");
    expect(normalizeLabel("GSSOC_LEVEL_1")).toBe("gssoclevel1");
  });

  it("handles empty string", () => {
    expect(normalizeLabel("")).toBe("");
  });

  it("handles default parameter (no argument)", () => {
    expect(normalizeLabel()).toBe("");
  });
});

// ---------------------------------------------------------------------------
// calculatePrPoints
// ---------------------------------------------------------------------------

describe("calculatePrPoints", () => {
  it("returns level3 points for a level3 label", () => {
    expect(calculatePrPoints(["gssoclevel3"])).toBe(LABEL_POINTS.gssoclevel3);
  });

  it("sums multiple recognised labels", () => {
    expect(calculatePrPoints(["gssoclevel1", "gssoclevel2"])).toBe(
      LABEL_POINTS.gssoclevel1 + LABEL_POINTS.gssoclevel2
    );
  });

  it("returns DEFAULT_MERGED_PR_POINTS for unrecognised labels", () => {
    expect(calculatePrPoints(["random-label"])).toBe(DEFAULT_MERGED_PR_POINTS);
  });

  it("returns DEFAULT_MERGED_PR_POINTS for empty labels array", () => {
    expect(calculatePrPoints([])).toBe(DEFAULT_MERGED_PR_POINTS);
  });

  it("returns DEFAULT_MERGED_PR_POINTS when labels is not an array", () => {
    expect(calculatePrPoints(null)).toBe(DEFAULT_MERGED_PR_POINTS);
    expect(calculatePrPoints(undefined)).toBe(DEFAULT_MERGED_PR_POINTS);
    expect(calculatePrPoints("string")).toBe(DEFAULT_MERGED_PR_POINTS);
  });

  it("normalises mixed-case and hyphenated label strings", () => {
    expect(calculatePrPoints(["GSSoC Level3"])).toBe(LABEL_POINTS.gssoclevel3);
    expect(calculatePrPoints(["gssoc-level-2"])).toBe(LABEL_POINTS.gssoclevel2);
  });
});

// ---------------------------------------------------------------------------
// applyAchievementBonus — the core bug fix (issue #7038)
// ---------------------------------------------------------------------------

describe("applyAchievementBonus", () => {
  const maxThreshold = Math.max(...ACHIEVEMENT_THRESHOLDS.map((t) => t.minPrs));
  const maxBonus = ACHIEVEMENT_THRESHOLDS.find((t) => t.minPrs === maxThreshold)?.bonus ?? 0;
  const minThreshold = Math.min(...ACHIEVEMENT_THRESHOLDS.map((t) => t.minPrs));
  const minBonus = ACHIEVEMENT_THRESHOLDS.find((t) => t.minPrs === minThreshold)?.bonus ?? 0;

  it("applies the highest-tier bonus when prs meets the highest threshold", () => {
    const contributor = { username: "alice", prs: maxThreshold, points: 50 };
    const result = applyAchievementBonus(contributor);
    expect(result.points).toBe(50 + maxBonus);
  });

  it("applies the lower-tier bonus when prs meets only the lower threshold", () => {
    const contributor = { username: "bob", prs: minThreshold, points: 20 };
    const result = applyAchievementBonus(contributor);
    expect(result.points).toBe(20 + minBonus);
  });

  it("returns unchanged points when prs is below all thresholds", () => {
    const contributor = { username: "carol", prs: 0, points: 10 };
    const result = applyAchievementBonus(contributor);
    expect(result.points).toBe(10);
  });

  // Critical regression test for issue #7038:
  // Callers who follow the old "mutates in-place" JSDoc and discard the
  // return value must NOT lose the bonus.
  it("returned object has the bonus — original object not relied on for bonus value", () => {
    const original = { username: "dave", prs: maxThreshold, points: 30 };
    const returned = applyAchievementBonus(original);
    // The fix is to always use the RETURN VALUE
    expect(returned.points).toBe(30 + maxBonus);
  });

  it("always returns a NEW object — never the original reference", () => {
    const original = { username: "eve", prs: 0, points: 5 };
    const result = applyAchievementBonus(original);
    // Even when no bonus is applied, a new object must be returned
    expect(result).not.toBe(original);
  });

  it("returned object reference is always different from input (bonus case)", () => {
    const original = { username: "frank", prs: maxThreshold, points: 100 };
    const result = applyAchievementBonus(original);
    expect(result).not.toBe(original);
  });

  it("preserves all original contributor fields", () => {
    const original = { username: "grace", prs: 3, points: 15, avatar: "url" };
    const result = applyAchievementBonus(original);
    expect(result.username).toBe("grace");
    expect(result.prs).toBe(3);
    expect(result.avatar).toBe("url");
  });

  it("does not mutate the original object", () => {
    const original = { username: "henry", prs: maxThreshold, points: 40 };
    const originalPoints = original.points;
    applyAchievementBonus(original);
    expect(original.points).toBe(originalPoints);
  });
});

// ---------------------------------------------------------------------------
// filterContributors
// ---------------------------------------------------------------------------

describe("filterContributors", () => {
  const contributors = [
    { username: "alice", name: "Alice", prs: 15, points: 100 },
    { username: "bob", name: "Bob", prs: 3, points: 20 },
    { username: "carol", name: "Carol", prs: 8, points: 60 },
  ];

  it("returns all when no search query and category is overall", () => {
    expect(filterContributors(contributors, "", "overall")).toHaveLength(3);
  });

  it("filters by username search (case-insensitive)", () => {
    const result = filterContributors(contributors, "alice", "overall");
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe("alice");
  });

  it("filters by name search", () => {
    const result = filterContributors(contributors, "Bob", "overall");
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe("bob");
  });

  it("handles null search gracefully", () => {
    expect(() => filterContributors(contributors, null, "overall")).not.toThrow();
    expect(filterContributors(contributors, null, "overall")).toHaveLength(3);
  });

  it("filters mentors as prs >= 5", () => {
    const result = filterContributors(contributors, "", "mentors");
    expect(result.every((c) => c.prs >= 5)).toBe(true);
    expect(result).toHaveLength(2); // alice (15) and carol (8)
  });

  it("returns empty array for search with no matches", () => {
    expect(filterContributors(contributors, "zzz", "overall")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// sortContributors
// ---------------------------------------------------------------------------

describe("sortContributors", () => {
  const contributors = [
    { username: "carol", prs: 5, points: 30 },
    { username: "alice", prs: 10, points: 80 },
    { username: "bob", prs: 3, points: 50 },
  ];

  it("sorts by points descending by default", () => {
    const sorted = sortContributors(contributors, "points");
    expect(sorted.map((c) => c.username)).toEqual(["alice", "bob", "carol"]);
  });

  it("sorts by prs descending", () => {
    const sorted = sortContributors(contributors, "prs");
    expect(sorted[0].username).toBe("alice");
  });

  it("sorts by username alphabetically", () => {
    const sorted = sortContributors(contributors, "username");
    expect(sorted.map((c) => c.username)).toEqual(["alice", "bob", "carol"]);
  });

  it("does not mutate the original array", () => {
    const original = [...contributors];
    sortContributors(contributors, "points");
    expect(contributors).toEqual(original);
  });
});

// ---------------------------------------------------------------------------
// paginateContributors and totalLeaderboardPages
// ---------------------------------------------------------------------------

describe("paginateContributors", () => {
  const items = Array.from({ length: 25 }, (_, i) => ({ username: `u${i}` }));

  it("returns the correct page slice", () => {
    const page1 = paginateContributors(items, 1, 10);
    expect(page1).toHaveLength(10);
    expect(page1[0].username).toBe("u0");

    const page3 = paginateContributors(items, 3, 10);
    expect(page3).toHaveLength(5);
    expect(page3[0].username).toBe("u20");
  });
});

describe("totalLeaderboardPages", () => {
  it("calculates correct page count", () => {
    expect(totalLeaderboardPages(25, 10)).toBe(3);
    expect(totalLeaderboardPages(10, 10)).toBe(1);
    expect(totalLeaderboardPages(0, 10)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// buildRanksMap
// ---------------------------------------------------------------------------

describe("buildRanksMap", () => {
  it("maps usernames to 1-based ranks", () => {
    const contributors = [
      { username: "alice" },
      { username: "bob" },
      { username: "carol" },
    ];
    const map = buildRanksMap(contributors);
    expect(map.alice).toBe(1);
    expect(map.bob).toBe(2);
    expect(map.carol).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// computeLeaderboardStats
// ---------------------------------------------------------------------------

describe("computeLeaderboardStats", () => {
  it("computes correct totals", () => {
    const contributors = [
      { prs: 10, points: 50 },
      { prs: 5, points: 30 },
    ];
    const stats = computeLeaderboardStats(contributors);
    expect(stats.totalContributors).toBe(2);
    expect(stats.flooredTotalPRs).toBe(15);
    expect(stats.flooredTotalPoints).toBe(80);
  });

  it("returns zeros for empty array", () => {
    const stats = computeLeaderboardStats([]);
    expect(stats.totalContributors).toBe(0);
    expect(stats.flooredTotalPRs).toBe(0);
    expect(stats.flooredTotalPoints).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getAchievementBadge
// ---------------------------------------------------------------------------

describe("getAchievementBadge", () => {
  it("returns Diamond Tier for rank 1", () => {
    expect(getAchievementBadge(1).label).toBe("Diamond Tier");
  });

  it("returns Platinum Tier for rank 2 and 3", () => {
    expect(getAchievementBadge(2).label).toBe("Platinum Tier");
    expect(getAchievementBadge(3).label).toBe("Platinum Tier");
  });

  it("returns Gold Tier for ranks 4–10", () => {
    expect(getAchievementBadge(4).label).toBe("Gold Tier");
    expect(getAchievementBadge(10).label).toBe("Gold Tier");
  });

  it("returns Silver Tier for ranks 11–100", () => {
    expect(getAchievementBadge(11).label).toBe("Silver Tier");
    expect(getAchievementBadge(100).label).toBe("Silver Tier");
  });

  it("returns Bronze Tier for rank 101+", () => {
    expect(getAchievementBadge(101).label).toBe("Bronze Tier");
    expect(getAchievementBadge(999).label).toBe("Bronze Tier");
  });
});
