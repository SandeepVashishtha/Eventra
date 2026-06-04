import { Trophy, Award, Star, Zap } from "lucide-react";

/**
 * Pure utility functions for leaderboard data processing.
 *
 * WHY THIS EXISTS
 * ───────────────
 * Leaderboard.jsx previously computed filteredContributors, sortedContributors,
 * currentContributors, ranksMap, and aggregate stats on every render cycle with
 * no memoization guards. For a 200-contributor dataset each of these operations
 * iterates the full array, meaning a single keystroke in the search box or a
 * state update from the SSE stream triggered six sequential O(N) passes before
 * anything was painted.
 *
 * Extracting the logic here enables each derived value to be wrapped in useMemo
 * in the component, so only the computations whose inputs actually changed are
 * re-run. Pure functions with no side effects are also straightforward to unit
 * test without mounting a React component.
 */


// ─── Scoring constants ────────────────────────────────────────────────────────

/** Points awarded per GSSoC label level. */
export const LABEL_POINTS = {
  gssoclevel1: 3,
  gssoclevel2: 7,
  gssoclevel3: 10,
};

/** Fallback points for merged PRs with no recognised level label. */
export const DEFAULT_MERGED_PR_POINTS = 1;

/** Bonus points thresholds for volume-based achievement badges. */
export const ACHIEVEMENT_THRESHOLDS = [
  { minPrs: 10, bonus: 10 },
  { minPrs: 5,  bonus: 5  },
];

// ─── Label normalisation ──────────────────────────────────────────────────────

/**
 * Strips non-alphanumeric characters and lowercases a label string so that
 * "GSSoC Level1", "gssoc-level-1", and "gssoclevel1" all normalise to the
 * same key.
 *
 * @param {string} label
 * @returns {string}
 */
export function normalizeLabel(label = "") {
  return label.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// ─── PR point calculation ─────────────────────────────────────────────────────

/**
 * Calculates the point value of a merged pull request from its labels.
 * Returns the sum of all recognised GSSoC level labels, or
 * DEFAULT_MERGED_PR_POINTS when no level label is present.
 *
 * @param {string[]} labels - Raw label names from the GitHub API
 * @returns {number}
 */
export function calculatePrPoints(labels) {
  // 🔥 FIX: Prevent fatal TypeError crash if API omits the labels array
  if (!Array.isArray(labels)) return DEFAULT_MERGED_PR_POINTS;

  const levelPoints = labels.reduce((total, label) => {
    const normalized = normalizeLabel(label);
    return total + (LABEL_POINTS[normalized] || 0);
  }, 0);

  return levelPoints || DEFAULT_MERGED_PR_POINTS;
}

/**
 * Applies volume-based achievement bonuses to a contributor's running point
 * total. Mutates the `contributor` object in-place (intended for use during
 * the initial data-building pass where mutation is safe).
 *
 * @param {{ prs: number, points: number }} contributor
 */
export function applyAchievementBonus(contributor) {
  for (const { minPrs, bonus } of ACHIEVEMENT_THRESHOLDS) {
    if (contributor.prs >= minPrs) {
      return { ...contributor, points: contributor.points + bonus };
    }
  }
  return contributor;
}

// ─── Filtering ────────────────────────────────────────────────────────────────

/**
 * Filters the full contributor list according to the active category and
 * search query.
 *
 * @param {Array}  contributors   - Full sorted contributor array
 * @param {string} search         - Raw search string (trimmed internally)
 * @param {string} activeCategory - One of "overall" | "monthly" | "mentors"
 * @returns {Array}
 */
export function filterContributors(contributors, search, activeCategory) {
  // 🔥 FIX: Prevent fatal TypeError crash if search is null/undefined
  const q = (search || "").trim().toLowerCase();

  // 🔥 FIX: Hoisted the threshold calculation OUTSIDE the filter loop.
  // Previously, this math was executing on every single iteration of the filter, 
  // causing a massive O(N) performance bottleneck on large contributor datasets.
  let monthlyThreshold = 0;
  if (activeCategory === "monthly" && contributors.length > 0) {
    monthlyThreshold = contributors[Math.floor(contributors.length * 0.4)]?.points || 0;
  }

  return contributors.filter((c) => {
    const matchSearch =
      !q ||
      c.username.toLowerCase().includes(q) ||
      (c.name && c.name.toLowerCase().includes(q));

    if (!matchSearch) return false;

    if (activeCategory === "monthly") {
      return c.points >= monthlyThreshold;
    }

    if (activeCategory === "mentors") {
      return c.prs >= 5;
    }

    return true;
  });
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

/**
 * Returns a new sorted copy of `contributors`.
 *
 * @param {Array}  contributors
 * @param {string} sortBy - One of "points" | "prs" | "username"
 * @returns {Array}
 */
export function sortContributors(contributors, sortBy) {
  return [...contributors].sort((a, b) => {
    if (sortBy === "prs")      return b.prs - a.prs;
    if (sortBy === "username") return a.username.localeCompare(b.username);
    return b.points - a.points; // default: "points"
  });
}

// ─── Pagination ───────────────────────────────────────────────────────────────

/**
 * Slices a sorted contributor array to a single page.
 *
 * @param {Array}  sorted           - Sorted+filtered contributor array
 * @param {number} currentPage      - 1-based current page
 * @param {number} perPage          - Items per page
 * @returns {Array}
 */
export function paginateContributors(sorted, currentPage, perPage) {
  const indexOfLast  = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  return sorted.slice(indexOfFirst, indexOfLast);
}

/**
 * Calculates the total number of pages.
 *
 * @param {number} totalItems
 * @param {number} perPage
 * @returns {number}
 */
export function totalLeaderboardPages(totalItems, perPage) {
  return Math.max(1, Math.ceil(totalItems / perPage));
}

// ─── Rank map ─────────────────────────────────────────────────────────────────

/**
 * Builds a lookup table mapping username → 1-based rank, derived from the
 * full (unfiltered, unsliced) contributor array as it arrived from the API.
 *
 * @param {Array} contributors - Full sorted contributor array
 * @returns {Object.<string, number>}
 */
export function buildRanksMap(contributors) {
  const map = {};
  contributors.forEach((c, i) => {
    map[c.username] = i + 1;
  });
  return map;
}

// ─── Aggregate statistics ─────────────────────────────────────────────────────

/**
 * Computes the three summary statistics shown in the stats cards row.
 * Kept as a pure function so the useMemo dependency array is just [contributors].
 *
 * @param {Array} contributors - Full contributor array
 * @returns {{ totalContributors: number, flooredTotalPRs: number, flooredTotalPoints: number }}
 */
export function computeLeaderboardStats(contributors) {
  let totalPRs = 0;
  let totalPoints = 0;

  for (const c of contributors) {
    totalPRs    += (c.prs || 0);
    totalPoints += (c.points || 0);
  }

  return {
    totalContributors: contributors.length,
    flooredTotalPRs: Math.floor(totalPRs),
    flooredTotalPoints: Math.floor(totalPoints),
  };
}

export const getAchievementBadge = (rank) => {
  if (rank === 1) {
    return {
      label: "Diamond Tier",
      color: "from-sky-300 via-indigo-400 to-pink-300 text-indigo-950 border-indigo-300/40 shadow-[0_0_12px_rgba(99,102,241,0.4)]",
      icon: Trophy,
      description: "Rank 1 - Top contributor"
    };
  }
  if (rank === 2 || rank === 3) {
    return {
      label: "Platinum Tier",
      color: "from-teal-300 via-emerald-400 to-cyan-300 text-emerald-950 border-teal-300/40 shadow-[0_0_12px_rgba(20,184,166,0.3)]",
      icon: Award,
      description: "Rank 2-3 - Elite contributor"
    };
  }
  if (rank >= 4 && rank <= 10) {
    return {
      label: "Gold Tier",
      color: "from-yellow-300 via-amber-400 to-yellow-500 text-amber-950 border-yellow-300/40 shadow-[0_0_8px_rgba(234,179,8,0.25)]",
      icon: Star,
      description: "Rank 4-10 - Gold contributor"
    };
  }
  if (rank >= 11 && rank <= 100) {
    return {
      label: "Silver Tier",
      color: "from-slate-300 via-slate-400 to-slate-500 text-slate-950 border-slate-300/40 shadow-[0_0_8px_rgba(148,163,184,0.25)]",
      icon: Zap,
      description: "Rank 11-100 - Silver contributor"
    };
  }
  return {
    label: "Bronze Tier",
    color: "from-orange-200 via-orange-300 to-red-400 text-orange-950 border-orange-300/40 shadow-[0_0_6px_rgba(217,119,6,0.2)]",
    icon: Zap,
    description: "Rank 101+ - Contributor"
  };
};