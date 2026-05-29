 feat/user-engagement-system
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCode,
  FaStar,
  FaUsers
} from "react-icons/fa";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import StyledDropdown from "../../components/StyledDropdown";
import GSSoCContribution from "./GSSoCContribution";


import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FeatureErrorBoundary from "../../components/common/FeatureErrorBoundary";
import { fetchWithTimeout } from "../../utils/fetchWithTimeout";
import {
  FaCode,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
} from "react-icons/fa";
import confetti from "canvas-confetti";
import GSSoCContribution from "./GSSoCContribution";
import StyledDropdown from "../../components/StyledDropdown";
import SkeletonLeaderboard from "../../components/common/SkeletonLeaderboard";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useLeaderboardStream, SSE_STATUS } from "../../context/RealTimeContext";
import {
  filterContributors,
  sortContributors,
  paginateContributors,
  totalLeaderboardPages,
  buildRanksMap,
  computeLeaderboardStats,
  calculatePrPoints,
  applyAchievementBonus,
} from "../../utils/leaderboardUtils";
import { getAchievementBadge } from "../../utils/leaderboardUtils";
import { logger } from "../../utils/logger";
import { storageManager } from "../../utils/storage/storageManager";
import { STORAGE_KEYS } from "../../utils/storage/storageKeys";
import { validators } from "../../utils/storage/storageValidators";
import { ENV } from "../../config/env";

// ─── Category filter definitions ───────────────────────────────────────────────
const CATEGORY_FILTERS = [
  { id: "overall", label: "Overall Leaders", icon: "🏆" },
  { id: "monthly", label: "Monthly Stars", icon: "⭐" },
  { id: "mentors", label: "Project Mentors", icon: "🎓" },
];

function RankMovementIndicator({ liveDifference }) {
  const diff = liveDifference !== undefined ? liveDifference : 0;
  if (diff > 0) {
    return (
      <motion.span
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-500"
        title={`Up ${diff} position${diff > 1 ? "s" : ""}`}
      >
        <FaArrowUp className="w-2.5 h-2.5 animate-bounce" /> {diff}
      </motion.span>
    );
  }
  if (diff < 0) {
    const absDiff = Math.abs(diff);
    return (
      <motion.span
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-0.5 text-[10px] font-black text-rose-500"
        title={`Down ${absDiff} position${absDiff > 1 ? "s" : ""}`}
      >
        <FaArrowDown className="w-2.5 h-2.5" /> {absDiff}
      </motion.span>
    );
  }
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold text-slate-400"
      title="No change"
    >
      <FaMinus className="w-2 h-2" />
    </span>
  );
}
 master

// Repository constant — update if the leaderboard should point to another repo
const GITHUB_REPO = ENV.GITHUB_REPO;
// Token is managed securely by the backend proxy
const LEADERBOARD_CACHE_KEY = "leaderboardData:v2";

// AnimatedCounter uses requestAnimationFrame instead of setInterval to keep
// count-up animations aligned with the browser's paint cycle, avoiding
// invisible ticks that setInterval fires even when the tab is hidden.
//
// React.memo prevents unnecessary re-renders from parent SSE updates: the
// leaderboard streams live data via useLeaderboardStream, causing the parent
// to re-render on every tick. Without React.memo, every AnimatedCounter on
// the page would cancel its in-progress RAF loop and restart the animation
// from zero — causing visible flicker on each stream update. With React.memo,
// an AnimatedCounter only re-renders (and restarts its animation) when its
// own `value` prop actually changes.

// Custom lightweight high-performance count-up component
const AnimatedCounter = React.memo(({ value }) => {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const end = parseInt(value, 10);
    if (isNaN(end)) return;
    if (end === 0) { setCount(0); return; }

    // Cancel any in-flight animation before starting a new one so that a
    // rapid value change does not leave two concurrent RAF loops running.
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const duration = 1200; // ms
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for a natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return <span>{count}</span>;
});

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

export default function LeaderBoard() {
  useDocumentTitle("Eventra | Leaderboard");
  const [contributors, setContributors] = useState([]);
  const [streaks, setStreaks] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [recentSearches, setRecentSearches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("points");
  const [activeCategory, setActiveCategory] = useState("overall");

  const {
    contributors: streamContributors,
    lastSynced,
    status: streamStatus,
  } = useLeaderboardStream();
  // Track which stream snapshot we've already applied to avoid duplicate merges
  const lastAppliedSyncRef = useRef(null);

  // Constants for pagination and UI
  const CONTRIBUTORS_PER_PAGE = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);
  // 🎉 Celebratory confetti on load
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { x: 0.5, y: 0.65 },
      startVelocity: 40,
      gravity: 0.85,
      scalar: 1.15,
    });
  }, []);

  // Merge real-time contributor updates from SSE stream into local state
  useEffect(() => {
    if (streamContributors.length === 0 || lastSynced === lastAppliedSyncRef.current) return;
    lastAppliedSyncRef.current = lastSynced;

    // Use a functional update to get the previous contributors without adding "contributors" as a dependency
    setContributors((prevContributors) => {
      setStreaks((prevStreaks) => {
        const updatedStreaks = { ...prevStreaks };

        // Map previous ranks
        const prevRanks = {};
        prevContributors.forEach((c, idx) => {
          prevRanks[c.username] = idx + 1;
        });

        // Map new ranks
        streamContributors.forEach((c, newIdx) => {
          const username = c.username;
          const newRank = newIdx + 1;
          const prevRank = prevRanks[username];

          if (prevRank !== undefined) {
            const rankDifference = prevRank - newRank; // positive means they moved up (e.g. 5 -> 2)
            const currentStreak = prevStreaks[username] || { consecutiveUp: 0, onFire: false };

            let consecutiveUp = currentStreak.consecutiveUp;
            if (rankDifference > 0) {
              consecutiveUp += 1;
            } else if (rankDifference < 0) {
              consecutiveUp = 0; // reset
            }

            // "On Fire" if they moved up by >= 3 positions in a single update OR moved up 3 times consecutively
            const onFire = rankDifference >= 3 || consecutiveUp >= 3;

            updatedStreaks[username] = {
              consecutiveUp,
              onFire,
              rankDifference
            };
          } else {
            updatedStreaks[username] = {
              consecutiveUp: 0,
              onFire: false,
              rankDifference: 0
            };
          }
        });

        return updatedStreaks;
      });

      return streamContributors;
    });

    setLastUpdated(`Live update: ${new Date(lastSynced).toLocaleString()}`);
    storageManager.set(STORAGE_KEYS.LEADERBOARD_CACHE, {
      data: streamContributors,
      timestamp: lastSynced,
    });
  }, [streamContributors, lastSynced]);

  useEffect(() => {
    const savedSearches =
      storageManager.get(STORAGE_KEYS.RECENT_SEARCHES, validators.isArray) || [];

    setRecentSearches(savedSearches);
  }, []);
  // Load data from cache or network will be handled by effect below

  const fetchContributors = async () => {
    try {
      // Fetch pre-computed leaderboard data from the new serverless backend
      const { data } = await fetchWithTimeout("/api/leaderboard", {}, 15000);

      if (!Array.isArray(data)) {
        throw new Error("Invalid payload format received from leaderboard API");
      }

      // Add achievement-based bonus points to gamify contributors
      data.forEach(applyAchievementBonus);

      const filteredContributors = [...data].sort((a, b) => b.points - a.points);
      setContributors(filteredContributors);
      setLastUpdated(new Date().toLocaleString());
      
      // Update local storage cache
      storageManager.set(STORAGE_KEYS.LEADERBOARD_CACHE, {
        data: data,
        timestamp: Date.now(),
      });
    } catch (err) {
      logger.error("Error fetching contributors:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load data from cache or network on mount
  useEffect(() => {
    const doLoad = async () => {
      setLoading(true);
      const cachedData = storageManager.get(STORAGE_KEYS.LEADERBOARD_CACHE, validators.isObject);
      const now = Date.now();

      if (cachedData?.data && cachedData?.timestamp) {
        if (now - cachedData.timestamp < 60 * 60 * 1000) {
          setContributors(cachedData.data);

          setLastUpdated(
            `Last updated: ${new Date(cachedData.timestamp).toLocaleString()} (cached)`
          );

          setLoading(false);
          return;
        }
      }
      await fetchContributors();
    };
    doLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchContributors is stable across renders
  }, []);

  // Each derived value is memoized — only recomputes when its specific inputs
  // change, preventing all six O(N) passes from running on every render.
  const filteredContributors = useMemo(
  () => filterContributors(contributors, search, activeCategory),
  [contributors, search, activeCategory]
);

const sortedContributors = useMemo(
  () => sortContributors(filteredContributors, sortBy),
  [filteredContributors, sortBy]
);


  const currentContributors = useMemo(
    () => paginateContributors(filteredContributors, currentPage, CONTRIBUTORS_PER_PAGE),
    [filteredContributors, currentPage]
  );
  const saveRecentSearch = (query) => {
    if (!query.trim()) return;

    const updatedSearches = [query, ...recentSearches.filter((item) => item !== query)].slice(0, 5);

    setRecentSearches(updatedSearches);

    storageManager.set(STORAGE_KEYS.RECENT_SEARCHES, updatedSearches);
  };
  const performanceData = [
  { name: "Participated", value: 80 },
  { name: "Won", value: 20 },
];

const COLORS = ["#6366F1", "#22C55E"];

  const totalPages = useMemo(
    () => totalLeaderboardPages(filteredContributors.length, CONTRIBUTORS_PER_PAGE),
    [filteredContributors.length]
  );

  const ranksMap = useMemo(
    () => buildRanksMap(contributors),
    [contributors]
  );

  const stats = useMemo(
    () => computeLeaderboardStats(contributors),
    [contributors]
  );

  const sortOptions = useMemo(() => [
    { label: "Points", value: "points" },
    { label: "PRs", value: "prs" },
    { label: "Username", value: "username" },
  ], []);

  // Extraction of Top 3 for visual Olympic Podium
  const top3 = filteredContributors.slice(0, 3);

  const podiumDisplay = useMemo(() => {
    return [
      { item: top3[1], position: "2nd", orderClass: "order-2 md:order-1", wClass: "w-full md:w-72", borderClass: "border-slate-300 dark:border-slate-700", ringClass: "from-slate-200 to-zinc-400", title: "Platinum Contributor", ptBadgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300", size: "h-18 w-18", pointsClass: "text-slate-800 dark:text-slate-100", medalColor: "bg-slate-300 text-slate-800", borderColor: "border-slate-300" },
      { item: top3[0], position: "1st", orderClass: "order-1 md:order-2", wClass: "w-full md:w-80", borderClass: "border-yellow-400 dark:border-yellow-500", ringClass: "from-yellow-300 via-amber-400 to-yellow-500", title: "Grandmaster / Diamond Tier", ptBadgeClass: "bg-yellow-400 text-yellow-950 shadow-[0_2px_10px_rgba(234,179,8,0.3)] border-yellow-300/30", size: "h-22 w-22", pointsClass: "text-amber-500", isFirst: true, medalColor: "bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 shadow-[0_2px_8px_rgba(234,179,8,0.4)]", borderColor: "border-yellow-400 dark:border-yellow-500" },
      { item: top3[2], position: "3rd", orderClass: "order-3 md:order-3", wClass: "w-full md:w-72", borderClass: "border-amber-600 dark:border-orange-700", ringClass: "from-amber-600 to-orange-500", title: "Platinum Contributor", ptBadgeClass: "bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-300 border border-orange-200/40", size: "h-18 w-18", pointsClass: "text-slate-800 dark:text-slate-100", medalColor: "bg-amber-600 text-white", borderColor: "border-amber-600 dark:border-orange-700" }
    ].filter(x => x.item);
  }, [top3]);

 feat/user-engagement-system
        {/* stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Contributors Card */}
          <div className="p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-indigo-50 to-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center">
              <div className="p-3 rounded-xl mr-4 bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <FaUsers className="text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contributors
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : stats.totalContributors}
                </p>
              </div>
            </div>
          </div>
          {/* User Engagement Dashboard */}
<div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg p-8 mb-10">
  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
    User Engagement Dashboard
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

    {/* Achievement Section */}
    <div>
      <div className="grid grid-cols-2 gap-4">

        <div className="bg-indigo-100 dark:bg-indigo-900 p-5 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Events Participated
          </h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            80
          </p>
        </div>

        <div className="bg-green-100 dark:bg-green-900 p-5 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Events Won
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            20
          </p>
        </div>

        <div className="bg-yellow-100 dark:bg-yellow-900 p-5 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Success Ratio
          </h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            25%
          </p>
        </div>

        <div className="bg-pink-100 dark:bg-pink-900 p-5 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Recent Activity
          </h3>
          <p className="text-md font-medium text-pink-600 mt-2">
            5 Events This Month
          </p>
        </div>

      </div>
    </div>

    {/* Pie Chart */}
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={performanceData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            dataKey="value"
            label
          >
            {performanceData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>

  </div>
</div>
          {/* Pull Requests Card */}
          <div className="p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-indigo-50 to-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center">
              <div className="p-3 rounded-xl mr-4 bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                <FaCode className="text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pull Requests
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : stats.flooredTotalPRs}
                </p>
              </div>
            </div>
          </div>
          {/* Total Points Card */}
          <div className="p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-indigo-50 to-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center">
              <div className="p-3 rounded-xl mr-4 bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                <FaStar className="text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Points
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : stats.flooredTotalPoints}
                </p>
              </div>
            </div>

  return (
    <FeatureErrorBoundary>
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
              Community{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Leaderboard
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Honoring our elite open-source creators driving the core features of Eventra with
              robust code and design improvements.
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
                <AnimatePresence mode="popLayout">
                  {podiumDisplay.map(({ item, position, orderClass, wClass, borderClass, ringClass, title, ptBadgeClass, size, pointsClass, isFirst, medalColor, borderColor }) => {
                    const isStreak = streaks[item.username]?.onFire;
                    return (
                      <motion.div
                        key={item.username}
                        layout
                        layoutId={`podium-card-${item.username}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          boxShadow: isStreak 
                            ? "0 20px 25px -5px rgba(239, 68, 68, 0.15), 0 0 25px 5px rgba(239, 68, 68, 0.2)" 
                            : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                        }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 180, damping: 20 }}
                        whileHover={{ y: -6, scale: 1.02 }}
                        className={`${wClass} ${orderClass} flex flex-col items-center bg-white/70 dark:bg-slate-900/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/40 border-b-8 ${borderClass} relative overflow-hidden`}
                      >
                        {isFirst && (
                          <span className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/10 dark:bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
                        )}
                        {isStreak && (
                          <span className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/15 dark:bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
                        )}

                        <div className="relative mb-4">
                          {/* Prestige Aura/Laurel Ring */}
                          <span className={`absolute -inset-1 rounded-full bg-gradient-to-r ${ringClass} blur-sm opacity-80 ${isStreak ? "animate-pulse" : ""}`} />
                          {isStreak && (
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                              className="absolute -inset-2 rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 blur opacity-60"
                            />
                          )}
                          <img
                            src={item.avatar}
                            alt={item.username}
                            className={`relative ${size} rounded-full border-4 ${borderColor} shadow-md object-cover`} loading="lazy"/>
                          {isFirst && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👑</div>}
                          <div className={`absolute -bottom-2 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black uppercase tracking-tight shadow ${medalColor}`}>
                            {position}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={item.profile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-base font-black hover:text-indigo-500 transition-colors truncate max-w-[150px] ${isFirst ? "bg-gradient-to-r from-slate-950 via-indigo-950 to-pink-950 dark:from-white dark:via-indigo-200 dark:to-pink-100 bg-clip-text text-transparent" : "text-slate-900 dark:text-white"}`}
                          >
                            {item.username}
                          </a>
                          {isStreak && (
                            <motion.span
                              animate={{ rotate: [-10, 10, -10] }}
                              transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                              className="text-sm"
                              title="On Fire!"
                            >
                              🔥
                            </motion.span>
                          )}
                        </div>

                        <div className={`mt-2.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${ptBadgeClass}`}>
                          {isStreak ? "🔥 Streak Master" : title}
                        </div>

                        <div className="mt-4 flex items-center justify-around w-full border-t border-slate-200/50 dark:border-slate-800/40 pt-4">
                          <div className="text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Points
                            </span>
                            <p className={`text-lg font-black mt-0.5 ${pointsClass}`}>
                              <AnimatedCounter value={item.points} />
                            </p>
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              PRs
                            </span>
                            <p className="text-lg font-black text-indigo-500 mt-0.5">
                              <AnimatedCounter value={item.prs} />
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* ── CATEGORY FILTER TABS ────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {CATEGORY_FILTERS.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setCurrentPage(1);
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className={`
                flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border backdrop-blur-xl
                ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30"
                    : "bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/40 hover:border-indigo-300 dark:hover:border-slate-700"
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

                saveRecentSearch(e.target.value);

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
                const selectedOption = sortOptions.find((opt) => opt.label === value);
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
                    {loading ? "..." : <AnimatedCounter value={card.value} />}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* UPDATED: Table container */}
          <section
            className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden"
            aria-labelledby="leaderboard-table-title"
          >
            <h2 id="leaderboard-table-title" className="sr-only">
              Contributor leaderboard table
            </h2>
            {/* LEADERBOARD ARENA GRID */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
              {loading ? (
                <div role="status" aria-live="polite" aria-label="Loading leaderboard contributors">
                  <span className="sr-only">Loading leaderboard contributors...</span>
                  <SkeletonLeaderboard rows={CONTRIBUTORS_PER_PAGE} />
                </div>
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
                              transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 22,
                                delay: index * 0.04,
                              }}
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
                                  <RankMovementIndicator liveDifference={streaks[c.username]?.rankDifference} />
                                </div>
                              </td>

                              {/* AVATAR + LINKS */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    {/* Small prestige indicator halo ring in the row */}
                                    {rank <= 3 && (
                                      <span
                                        className={`absolute -inset-0.5 rounded-full blur-xs opacity-75 animate-pulse bg-gradient-to-r ${
                                          rank === 1
                                            ? "from-yellow-400 to-amber-500"
                                            : rank === 2
                                              ? "from-slate-200 to-zinc-400"
                                              : "from-amber-600 to-orange-500"
                                        }`}
                                      />
                                    )}
                                    <img
                                      loading="lazy"
                                      decoding="async"
                                      width="40"
                                      height="40"
                                      className={`relative h-10 w-10 rounded-full border-2 bg-slate-100 shadow-sm object-cover ${
                                        rank === 1
                                          ? "border-yellow-400 shadow-yellow-500/10"
                                          : rank === 2
                                            ? "border-slate-300"
                                            : rank === 3
                                              ? "border-amber-600"
                                              : "border-indigo-100 dark:border-slate-800"
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
                                      <div className="text-xs text-slate-400 mt-0.5">{c.name}</div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* GAMIFICATION BADGES */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <motion.div
                                    whileHover={{ scale: 1.06 }}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r border shadow-sm transition-all select-none cursor-default ${badge.color}`}
                                  >
                                    <badge.icon className="w-3.5 h-3.5" />
                                    {badge.label}
                                  </motion.div>

                                  {/* Dynamic On Fire Streak badge */}
                                  {streaks[c.username]?.onFire && (
                                    <motion.div
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      animate={{ 
                                        scale: [1, 1.08, 1],
                                        opacity: 1
                                      }}
                                      transition={{
                                        scale: {
                                          repeat: Infinity,
                                          duration: 1.2,
                                          ease: "easeInOut"
                                        }
                                      }}
                                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 text-white border border-red-400/30 shadow-[0_0_12px_rgba(239,68,68,0.4)] cursor-default select-none"
                                    >
                                      <motion.span
                                        animate={{ rotate: [-10, 10, -10] }}
                                        transition={{ repeat: Infinity, duration: 0.65, ease: "easeInOut" }}
                                      >
                                        🔥
                                      </motion.span>
                                      ON FIRE
                                    </motion.div>
                                  )}
                                </div>
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
                          aria-label="Previous page"
                          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 bg-transparent transition-all"
                        >
                          <FaChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                          aria-label="Next page"
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
            </div>

            {/* Table footer: last updated + live connection badge */}
            <div className="bg-gray-50 dark:bg-black/70 px-6 py-2 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              {lastUpdated && (
                <span className="text-xs font-medium text-slate-400">{lastUpdated}</span>
              )}
              <LiveStatusBadge status={streamStatus} />
            </div>
          </section>
        </div>
        <GSSoCContribution />
      </div>
    </FeatureErrorBoundary>
  );
}
