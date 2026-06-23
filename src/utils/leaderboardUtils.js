import { Trophy, Award, Star, Zap } from "lucide-react";

export const DIFFICULTY_POINTS = {
  "level:beginner":     20,
  "level:intermediate": 35,
  "level:advanced":     55,
  "level:critical":     80,
};

export const QUALITY_MULTIPLIERS = {
  "quality:clean":       1.2,
  "quality:exceptional": 1.5,
};

export const TYPE_BONUSES = {
  "type:security":    10,
  "type:performance": 5,
};

export const DEFAULT_MERGED_PR_POINTS = 1;

export const ACHIEVEMENT_THRESHOLDS = [
  { minPrs: 20, bonus: 30 },
  { minPrs: 10, bonus: 15 },
  { minPrs: 5,  bonus: 5  },
];

export function normalizeLabel(label = "") {
  return label.toLowerCase().trim();
}

export function calculatePrPoints(labels) {
  if (!Array.isArray(labels)) return DEFAULT_MERGED_PR_POINTS;

  const normalised = labels.map(normalizeLabel);

  const difficultyValues = Object.entries(DIFFICULTY_POINTS)
    .filter(([key]) => normalised.includes(key))
    .map(([, pts]) => pts);

  const difficultyPts =
    difficultyValues.length > 0
      ? Math.min(...difficultyValues)
      : DEFAULT_MERGED_PR_POINTS;

  const multiplier = normalised.reduce((best, label) => {
    return Math.max(best, QUALITY_MULTIPLIERS[label] || 1.0);
  }, 1.0);

  const typeBonus = normalised.reduce((sum, label) => {
    return sum + (TYPE_BONUSES[label] || 0);
  }, 0);

  return Math.floor(difficultyPts * multiplier) + typeBonus;
}

export function applyAchievementBonus(contributor) {
  for (const { minPrs, bonus } of ACHIEVEMENT_THRESHOLDS) {
    if (contributor.prs >= minPrs) {
      return { ...contributor, points: contributor.points + bonus };
    }
  }
  return { ...contributor };
}

export function filterContributors(contributors, search, activeCategory) {
  const q = (search || "").trim().toLowerCase();

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

export function sortContributors(contributors, sortBy) {
  return [...contributors].sort((a, b) => {
    if (sortBy === "prs")      return b.prs - a.prs;
    if (sortBy === "username") return a.username.localeCompare(b.username);
    return b.points - a.points;
  });
}

export function paginateContributors(sorted, currentPage, perPage) {
  const indexOfLast  = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  return sorted.slice(indexOfFirst, indexOfLast);
}

export function totalLeaderboardPages(totalItems, perPage) {
  return Math.max(1, Math.ceil(totalItems / perPage));
}

export function buildRanksMap(contributors) {
  const map = {};
  contributors.forEach((c, i) => {
    map[c.username] = i + 1;
  });
  return map;
}

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