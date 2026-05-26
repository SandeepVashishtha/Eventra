import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCode,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaAward,
  FaTrophy,
  FaMedal,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
} from "react-icons/fa";
import confetti from "canvas-confetti";
import GSSoCContribution from "./GSSoCContribution";
import StyledDropdown from "../../components/StyledDropdown";
import SkeletonLeaderboard, {
  LeaderboardStatCardSkeleton,
} from "../../components/common/SkeletonLeaderboard";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useLeaderboardStream, SSE_STATUS } from "../../context/RealTimeContext";

// ─── Category filter definitions ───────────────────────────────────────────────
const CATEGORY_FILTERS = [
  { id: "overall", label: "Overall Leaders", icon: "🏆" },
  { id: "monthly", label: "Monthly Stars", icon: "⭐" },
  { id: "mentors", label: "Project Mentors", icon: "🎓" },
];

// ─── Deterministic rank movement generator (seeded by username hash) ──────────
function getRankMovement(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = ((hash << 5) - hash) + username.charCodeAt(i);
    hash |= 0;
  }
  const mod = Math.abs(hash) % 10;
  if (mod < 4) return { direction: "up", delta: (mod % 3) + 1 };
  if (mod < 7) return { direction: "stable", delta: 0 };
  return { direction: "down", delta: (mod % 2) + 1 };
}

function RankMovementIndicator({ username }) {
  const { direction, delta } = getRankMovement(username);
  if (direction === "up") {
    return (
      <motion.span
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-500"
        title={`Up ${delta} position${delta > 1 ? 's' : ''}`}
      >
        <FaArrowUp className="w-2.5 h-2.5" /> {delta}
      </motion.span>
    );
  }
  if (direction === "down") {
    return (
      <motion.span
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-0.5 text-[10px] font-black text-rose-500"
        title={`Down ${delta} position${delta > 1 ? 's' : ''}`}
      >
        <FaArrowDown className="w-2.5 h-2.5" /> {delta}
      </motion.span>
    );
  }
  return (
    <span className="inline-flex items-center text-[10px] font-bold text-slate-400" title="No change">
      <FaMinus className="w-2 h-2" />
    </span>
  );
}

// Repository constant — update if the leaderboard should point to another repo
const GITHUB_REPO = "SandeepVashishtha/Eventra";
// Token is managed securely by the backend proxy
const LEADERBOARD_CACHE_KEY = "leaderboardData:v2";

// Points mapping for PR labels (keeps scoring logic centralized)
const POINTS = {
  gssoclevel1: 3,
  gssoclevel2: 7,
  gssoclevel3: 10,
};
const DEFAULT_MERGED_PR_POINTS = 1;

const normalizeLabel = (label = "") =>
  label.toLowerCase().replace(/[^a-z0-9]/g, "");

const calculatePrPoints = (labels) => {
  const levelPoints = labels.reduce((total, label) => {
    const normalized = normalizeLabel(label);
    return total + (POINTS[normalized] || 0);
  }, 0);

  return levelPoints || DEFAULT_MERGED_PR_POINTS;
};

// Custom lightweight high-performance count-up component
const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end)) return;
    if (start === end) {
      setCount(end);
      return;
    }
    const duration = 1200; // 1.2s total count duration
    const steps = Math.min(end, 50);
    const increment = Math.ceil(end / steps);
    const stepTime = Math.floor(duration / steps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
};

function LiveStatusBadge({ status }) {
  if (status === SSE_STATUS.CONNECTED) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Live
      </span>
    );
  }
  if (status === SSE_STATUS.RECONNECTING) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-amber-500 dark:text-amber-400">
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        Reconnecting…
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
      <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
      Offline
    </span>
  );
}
const getAchievementBadge = (rank, prs, points) => {
  if (rank === 1) {
    return {
      label: "Diamond Tier",
      color: "from-sky-300 via-indigo-400 to-pink-300 text-indigo-950 border-indigo-300/40 shadow-[0_0_12px_rgba(99,102,241,0.4)]",
      icon: FaTrophy
    };
  }
  if (rank === 2 || rank === 3) {
    return {
      label: "Platinum Tier",
      color: "from-teal-300 via-emerald-400 to-cyan-300 text-emerald-950 border-teal-300/40 shadow-[0_0_12px_rgba(20,184,166,0.3)]",
      icon: FaAward
    };
  }
  if (rank >= 4 && rank <= 10) {
    return {
      label: "Gold Tier",
      color: "from-yellow-300 via-amber-400 to-yellow-500 text-amber-950 border-yellow-300/40 shadow-[0_0_8px_rgba(234,179,8,0.25)]",
      icon: FaStar
    };
  }
  return {
    label: "Silver Tier",
    color: "from-slate-100 via-zinc-200 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 text-slate-800 dark:text-slate-200 border-slate-200/50 dark:border-slate-700/20",
    icon: FaCode
  };
};

export default function LeaderBoard() {
  useDocumentTitle("Eventra | Leaderboard");
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [search, setSearch] = useState("");
  const [
  recentSearches,
  setRecentSearches,
] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("points");
  const [activeCategory, setActiveCategory] = useState("overall");

  const { contributors: streamContributors, lastSynced, status: streamStatus } = useLeaderboardStream();
  // Track which stream snapshot we've already applied to avoid duplicate merges
  const lastAppliedSyncRef = useRef(null);

  // Constants for pagination and UI
  const CONTRIBUTORS_PER_PAGE = 10;

  // 🎉 Celebratory confetti on load
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { x: 0.5, y: 0.65 },
      startVelocity: 40,
      gravity: 0.85,
      scalar: 1.15
    });
  }, []);

  // Merge real-time contributor updates from SSE stream into local state
  useEffect(() => {
    if (
      streamContributors.length === 0 ||
      lastSynced === lastAppliedSyncRef.current
    ) return;
    lastAppliedSyncRef.current = lastSynced;
    setContributors(streamContributors);
    setLastUpdated(`Live update: ${new Date(lastSynced).toLocaleString()}`);
    localStorage.setItem(
      LEADERBOARD_CACHE_KEY,
      JSON.stringify({ data: streamContributors, timestamp: lastSynced }),
    );
  }, [streamContributors, lastSynced]);

  useEffect(() => {
  const savedSearches =
    JSON.parse(
      localStorage.getItem(
        "recentSearches"
      )
    ) || [];

  setRecentSearches(
    savedSearches
  );
}, []);
  // Load data from cache or network will be handled by effect below

  const fetchContributors = async () => {
    try {
      let contributorsMap = {};
      let page = 1;
      let hasMore = true;

      const proxyUrl = `/api/github-proxy?path=${encodeURIComponent(`/repos/${GITHUB_REPO}/contributors`)}`;
      const contributorsRes = await fetch(proxyUrl);

      if (!contributorsRes.ok) throw new Error("Failed to fetch contributors");
      const contributorsData = await contributorsRes.json();
      const contributorsInfo = {};

      contributorsData.forEach((contributor) => {
        contributorsInfo[contributor.login] = {
          name: contributor.name || contributor.login,
          avatar: contributor.avatar_url,
          profile: contributor.html_url
        };
      });

      while (hasMore) {
        const proxyUrl = `/api/github-proxy?path=${encodeURIComponent(`/repos/${GITHUB_REPO}/pulls?state=closed&per_page=100&page=${page}`)}`;
        const res = await fetch(proxyUrl);

        if (!res.ok) {
          console.warn(`GitHub API request failed with status: ${res.status}`);
          hasMore = false;
          break;
        }

        const prs = await res.json();
        if (!Array.isArray(prs) || prs.length === 0) {
          hasMore = false;
          break;
        }

        prs.forEach((pr) => {
          if (!pr.merged_at) return;

          const labels = pr.labels.map((l) => l.name.toLowerCase());
          const hasGsocLabel = labels.some(
            (label) => label.includes("gssoc") || label.includes("gsoc")
          );
          if (!hasGsocLabel) return;

          const author = pr.user.login;
          const points = calculatePrPoints(labels);

          if (!contributorsMap[author]) {
            const contributorInfo = contributorsInfo[author] || {
              name: author,
              avatar: pr.user.avatar_url,
              profile: pr.user.html_url
            };
            contributorsMap[author] = {
              username: author,
              name: contributorInfo.name,
              avatar: contributorInfo.avatar,
              profile: contributorInfo.profile,
              points: 0,
              prs: 0
            };
          }

          contributorsMap[author].points += points;
          contributorsMap[author].prs += 1;
        });

        page++;
      }

      // Add achievement-based bonus points to gamify contributors
      Object.keys(contributorsMap).forEach((user) => {
        const count = contributorsMap[user].prs;
        if (count >= 10) {
          contributorsMap[user].points += 10;
        } else if (count >= 5) {
          contributorsMap[user].points += 5;
        }
      });

      const sortedContributors = Object.values(contributorsMap).sort(
        (a, b) => b.points - a.points
      );

      setContributors(sortedContributors);
      setLastUpdated(new Date().toLocaleString());
      localStorage.setItem(
        LEADERBOARD_CACHE_KEY,
        JSON.stringify({ data: sortedContributors, timestamp: Date.now() })
      );
    } catch (err) {
      console.error("Error fetching contributors:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load data from cache or network on mount
  useEffect(() => {
    const doLoad = async () => {
      setLoading(true);
      const cachedData = localStorage.getItem(LEADERBOARD_CACHE_KEY);
      const now = Date.now();

      if (cachedData) {
        try {
          const { data, timestamp } = JSON.parse(cachedData);
          if (now - timestamp < 60 * 60 * 1000) {
            setContributors(data);
            setLastUpdated(
              `Last updated: ${new Date(timestamp).toLocaleString()} (cached)`
            );
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error parsing cached data:", error);
        }
      }
      await fetchContributors();
    };
    doLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchContributors is stable across renders
  }, []);

  const saveRecentSearch =
  (query) => {
    if (!query.trim()) return;

    const updatedSearches = [
      query,
      ...recentSearches.filter(
        (item) => item !== query
      ),
    ].slice(0, 5);

    setRecentSearches(
      updatedSearches
    );

    localStorage.setItem(
      "recentSearches",
      JSON.stringify(
        updatedSearches
      )
    );
  };
  const filteredContributors = contributors.filter((c) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || c.username.toLowerCase().includes(q) || (c.name && c.name.toLowerCase().includes(q));
    if (!matchSearch) return false;

    // Category filters (deterministic simulation based on username hash)
    if (activeCategory === "monthly") {
      // Show top ~40% as "monthly stars" based on points threshold
      const threshold = contributors.length > 0
        ? contributors[Math.floor(contributors.length * 0.4)]?.points || 0
        : 0;
      return c.points >= threshold;
    }
    if (activeCategory === "mentors") {
      // Show contributors with 5+ PRs as "mentors"
      return c.prs >= 5;
    }
    return true; // "overall" shows everyone
  });

  const sortedContributors = [...filteredContributors].sort((a, b) => {
    if (sortBy === "points") return b.points - a.points;
    if (sortBy === "prs") return b.prs - a.prs;
    if (sortBy === "username") return a.username.localeCompare(b.username);
    return 0;
  });

  const indexOfLast = currentPage * CONTRIBUTORS_PER_PAGE;
  const indexOfFirst = indexOfLast - CONTRIBUTORS_PER_PAGE;
  const currentContributors = sortedContributors.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(
    sortedContributors.length / CONTRIBUTORS_PER_PAGE
  );

  const ranksMap = {};
  contributors.forEach((c, i) => {
    ranksMap[c.username] = i + 1;
  });

  const stats = {
    totalContributors: contributors.length,
    flooredTotalPRs: contributors.reduce((sum, c) => sum + c.prs, 0),
    flooredTotalPoints: contributors.reduce((sum, c) => sum + c.points, 0)
  };

  const sortOptions = [
    { label: "Points", value: "points" },
    { label: "PRs", value: "prs" },
    { label: "Username", value: "username" }
  ];

  // Extraction of Top 3 for visual Olympic Podium
  const top3 = sortedContributors.slice(0, 3);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24 py-12 sm:py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO TITLE */}
        <div className="text-center mb-12 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest"
          >
            🏆 GSSoC'26 Contribution Arena
          </motion.div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Community <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Leaderboard</span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Honoring our elite open-source creators driving the core features of Eventra with robust code and design improvements.
          </p>
        </div>

        {/* ── HIGH-FIDELITY OLYMPIC PODIUM (Top 3) ───────────────────────────── */}
        {!loading && top3.length > 0 && (
          <div className="mb-14">
            <h2 className="text-center text-xs font-black uppercase tracking-widest text-indigo-500 mb-8">
              Contributor Hall of Fame
            </h2>

            {/* Responsive grid: Desktop side-by-side, mobile stacked */}
            <div className="flex flex-col md:flex-row items-end justify-center gap-6 max-w-4xl mx-auto">
              
              {/* 2nd Place Card (Left Column) */}
              {top3[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.15 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="w-full md:w-72 order-2 md:order-1 flex flex-col items-center bg-white/70 dark:bg-slate-900/75 backdrop-blur-md rounded-3xl p-6 border-b-8 border-slate-300 dark:border-slate-700 border border-slate-200/50 dark:border-slate-800/40 shadow-xl"
                >
                  <div className="relative mb-4">
                    {/* Prestige Aura/Laurel Ring */}
                    <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-slate-200 to-zinc-400 blur-sm opacity-80" />
                    <img
                      src={top3[1].avatar}
                      alt={top3[1].username}
                      className="relative h-18 w-18 rounded-full border-4 border-slate-300 shadow-md object-cover"
                    />
                    <div className="absolute -bottom-2 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-slate-800 text-[10px] font-black uppercase tracking-tight shadow">
                      2nd
                    </div>
                  </div>

                  <a
                    href={top3[1].profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-black text-slate-900 dark:text-white hover:text-indigo-500 transition-colors truncate max-w-[200px]"
                  >
                    {top3[1].username}
                  </a>

                  <div className="mt-2.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/40">
                    Platinum Contributor
                  </div>

                  <div className="mt-4 flex items-center justify-around w-full border-t border-slate-200/50 dark:border-slate-800/40 pt-4">
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Points</span>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">
                        <AnimatedCounter value={top3[1].points} />
                      </p>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PRs</span>
                      <p className="text-lg font-black text-indigo-500 mt-0.5">
                        <AnimatedCounter value={top3[1].prs} />
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 1st Place Card (Middle Column - Tallest) */}
              {top3[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className="w-full md:w-80 order-1 md:order-2 flex flex-col items-center bg-white dark:bg-slate-900 backdrop-blur-lg rounded-3xl p-7 border-b-8 border-yellow-400 dark:border-yellow-500 border border-slate-200/60 dark:border-slate-800/60 shadow-2xl relative overflow-hidden"
                >
                  {/* Amber ambient backlight glow */}
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/10 dark:bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative mb-5">
                    {/* Breathing Golden Halo Aura */}
                    <span className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 blur opacity-75 animate-pulse" />
                    <img
                      src={top3[0].avatar}
                      alt={top3[0].username}
                      className="relative h-22 w-22 rounded-full border-4 border-yellow-400 dark:border-yellow-500 shadow-lg object-cover"
                    />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">
                      👑
                    </div>
                    <div className="absolute -bottom-2 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 text-xs font-black uppercase tracking-tight shadow-[0_2px_8px_rgba(234,179,8,0.4)]">
                      1st
                    </div>
                  </div>

                  <a
                    href={top3[0].profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-black bg-gradient-to-r from-slate-950 via-indigo-950 to-pink-950 dark:from-white dark:via-indigo-200 dark:to-pink-100 bg-clip-text text-transparent hover:text-indigo-500 transition-colors truncate max-w-[220px]"
                  >
                    {top3[0].username}
                  </a>

                  <div className="mt-2.5 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-yellow-400 text-yellow-950 shadow-[0_2px_10px_rgba(234,179,8,0.3)] border border-yellow-300/30">
                    Grandmaster / Diamond Tier
                  </div>

                  <div className="mt-4 flex items-center justify-around w-full border-t border-slate-200/50 dark:border-slate-800/40 pt-4">
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Points</span>
                      <p className="text-xl font-black text-amber-500 mt-0.5">
                        <AnimatedCounter value={top3[0].points} />
                      </p>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PRs</span>
                      <p className="text-xl font-black text-indigo-500 mt-0.5">
                        <AnimatedCounter value={top3[0].prs} />
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3rd Place Card (Right Column) */}
              {top3[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.2 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="w-full md:w-72 order-3 md:order-3 flex flex-col items-center bg-white/70 dark:bg-slate-900/75 backdrop-blur-md rounded-3xl p-6 border-b-8 border-amber-600 dark:border-orange-700 border border-slate-200/50 dark:border-slate-880/40 shadow-xl"
                >
                  <div className="relative mb-4">
                    {/* Prestige Aura/Laurel Ring */}
                    <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 blur-sm opacity-80" />
                    <img
                      src={top3[2].avatar}
                      alt={top3[2].username}
                      className="relative h-18 w-18 rounded-full border-4 border-amber-600 dark:border-orange-700 shadow-md object-cover"
                    />
                    <div className="absolute -bottom-2 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-[10px] font-black uppercase tracking-tight shadow">
                      3rd
                    </div>
                  </div>

                  <a
                    href={top3[2].profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-black text-slate-900 dark:text-white hover:text-indigo-500 transition-colors truncate max-w-[200px]"
                  >
                    {top3[2].username}
                  </a>

                  <div className="mt-2.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-300 border border-orange-200/40">
                    Platinum Contributor
                  </div>

                  <div className="mt-4 flex items-center justify-around w-full border-t border-slate-200/50 dark:border-slate-800/40 pt-4">
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Points</span>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-0.5">
                        <AnimatedCounter value={top3[2].points} />
                      </p>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PRs</span>
                      <p className="text-lg font-black text-indigo-500 mt-0.5">
                        <AnimatedCounter value={top3[2].prs} />
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          </div>
        )}

        {/* ── CATEGORY FILTER TABS ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {CATEGORY_FILTERS.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setCurrentPage(1); }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border backdrop-blur-xl
                ${activeCategory === cat.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'
                  : 'bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/40 hover:border-indigo-300 dark:hover:border-slate-700'
                }
              `}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* SEARCH & FILTERS GRID */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/40">
          <input
            type="text"
            
            value={search}
            onChange={(e) => {
  setSearch(e.target.value);

  saveRecentSearch(
    e.target.value
  );

  setCurrentPage(1);
}}
            placeholder="Search creators..."
            className="w-full sm:max-w-xs px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-950 dark:text-white"
          />
          
          <StyledDropdown
            label="Filter & Sort"
            value={sortOptions.find((opt) => opt.value === sortBy)?.label || "Select Sort"}
            options={sortOptions.map((opt) => opt.label)}
            onChange={(value) => {
              const selectedOption = sortOptions.find(
                (opt) => opt.label === value
              );
              if (selectedOption) setSortBy(selectedOption.value);
            }}
            placeholder="Sort by"
          />
        </div>
{/* AGGREGATED STATS CARDS */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {[
    {
      title: "Active Contributors",
      value: stats.totalContributors,
      color:
        "from-blue-500/10 to-indigo-500/10 border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400",
      icon: FaUsers,
    },
    {
      title: "Merged Pull Requests",
      value: stats.flooredTotalPRs,
      color:
        "from-emerald-500/10 to-teal-500/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      icon: FaCode,
    },
    {
      title: "Aggregated Arena Points",
      value: stats.flooredTotalPoints,
      color:
        "from-amber-500/10 to-orange-500/10 border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400",
      icon: FaStar,
    },
  ].map((card, idx) => (
    <motion.div
      key={idx}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} border shadow-sm flex items-center gap-4`}
    >
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
        <card.icon className="text-2xl" />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {card.title}
        </p>

        <p className="text-3xl font-extrabold text-slate-950 dark:text-white mt-1">
          {loading ? (
            "..."
          ) : (
            <AnimatedCounter value={card.value} />
          )}
        </p>
      </div>
    </motion.div>
  ))}
</div>

        {/* LEADERBOARD ARENA GRID */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          {loading ? (
            <SkeletonLeaderboard rows={CONTRIBUTORS_PER_PAGE} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Contributor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Achievement Badge
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Points
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Merged PRs
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                  <AnimatePresence>
                    {currentContributors.map((c, index) => {
                      const rank = ranksMap[c.username];
                      const badge = getAchievementBadge(rank, c.prs, c.points);
                      return (
                        <motion.tr
                          key={c.username}
                          layout
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -16 }}
                          transition={{ type: "spring", stiffness: 260, damping: 22, delay: index * 0.04 }}
                          whileHover={{ backgroundColor: "rgba(99,102,241,0.04)" }}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                        >
                          {/* RANK INDEX BADGES + MOVEMENT INDICATOR */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                                  rank === 1
                                    ? "bg-yellow-400 text-yellow-950 shadow-md shadow-yellow-400/20"
                                    : rank === 2
                                    ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                    : rank === 3
                                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                                    : "bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                                }`}
                              >
                                {rank}
                              </span>
                              <RankMovementIndicator username={c.username} />
                            </div>
                          </td>

                          {/* AVATAR + LINKS */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {/* Small prestige indicator halo ring in the row */}
                                {rank <= 3 && (
                                  <span className={`absolute -inset-0.5 rounded-full blur-xs opacity-75 animate-pulse bg-gradient-to-r ${
                                    rank === 1 ? "from-yellow-400 to-amber-500" : rank === 2 ? "from-slate-200 to-zinc-400" : "from-amber-600 to-orange-500"
                                  }`} />
                                )}
                                <img
                                  loading="lazy"
                                  decoding="async"
                                  width="40"
                                  height="40"
                                  className={`relative h-10 w-10 rounded-full border-2 bg-slate-100 shadow-sm object-cover ${
                                    rank === 1 ? "border-yellow-400 shadow-yellow-500/10" : rank === 2 ? "border-slate-300" : rank === 3 ? "border-amber-600" : "border-indigo-100 dark:border-slate-800"
                                  }`}
                                  src={c.avatar}
                                  alt={c.username}
                                />
                              </div>
                              <div>
                                <a
                                  href={c.profile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                  {c.username}
                                </a>
                                {c.name && c.name !== c.username && (
                                  <div className="text-xs text-slate-400 mt-0.5">
                                    {c.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* GAMIFICATION BADGES */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <motion.div
                              whileHover={{ scale: 1.06 }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r border shadow-sm transition-all select-none cursor-default ${badge.color}`}
                            >
                              <badge.icon className="w-3.5 h-3.5" />
                              {badge.label}
                            </motion.div>
                          </td>

                          {/* POINTS METRICS */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                              <FaStar className="text-yellow-400 text-xs animate-spin-slow" />
                              <span className="font-extrabold">
                                <AnimatedCounter value={c.points} />
                              </span>
                            </div>
                          </td>

                          {/* PR METRICS */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                              <FaCode className="text-indigo-500 text-xs" />
                              <span className="font-extrabold">
                                <AnimatedCounter value={c.prs} />
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>

              {/* PAGINATION BAR */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center py-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <span className="text-xs font-medium text-slate-500">
                    Showing page {currentPage} of {totalPages}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 bg-transparent transition-all"
                    >
                      <FaChevronLeft className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 bg-transparent transition-all"
                    >
                      <FaChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Table footer: last updated + live connection badge */}
          <div className="bg-gray-50 dark:bg-black/70 px-6 py-2 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            {lastUpdated && (
              <span className="text-xs font-medium text-slate-400">
                {lastUpdated}
              </span>
            )}
            <LiveStatusBadge status={streamStatus} />
          </div>
        </div>
      </div>
      <GSSoCContribution />
    </div>
  );
}
