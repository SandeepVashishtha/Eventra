import { Code, Star, ChevronLeft, ChevronRight, Users, ArrowUp, ArrowDown, Minus, Search, Filter, Download, Sync, Trophy } from "lucide-react";
// src/features/leaderboard/LeaderBoard.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FeatureErrorBoundary from "../../components/common/FeatureErrorBoundary";
import { fetchWithTimeout } from "../../utils/fetchWithTimeout";
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
  applyAchievementBonus,
} from "../../utils/leaderboardUtils";
import { getAchievementBadge } from "../../utils/leaderboardUtils";
import { logger } from "../../utils/logger";
import { storageManager } from "../../utils/storage/storageManager";
import { STORAGE_KEYS } from "../../utils/storage/storageKeys";
import { validators } from "../../utils/storage/storageValidators";

// ─── Category filter definitions ───────────────────────────────────────────────
const CATEGORY_FILTERS = [
  { id: "overall", label: "Overall Leaders", icon: "🏆", description: "All-time top contributors" },
  { id: "monthly", label: "Monthly Stars", icon: "⭐", description: "This month's active contributors" },
  { id: "mentors", label: "Project Mentors", icon: "🎓", description: "Guiding the next generation" },
];

// ─── Constants ───────────────────────────────────────────────
const LEADERBOARD_CACHE_TTL = 60 * 60 * 1000; // 1 hour
const CONTRIBUTORS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 400;
const CONFETTI_CONFIG = {
  particleCount: 120,
  spread: 75,
  origin: { x: 0.5, y: 0.65 },
  startVelocity: 40,
  gravity: 0.85,
  scalar: 1.15,
  colors: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"],
};

const formatLastUpdated = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const prepareLeaderboardEntries = (entries = []) =>
  entries.map((entry) => applyAchievementBonus({ ...entry }));

// ─── Custom Hooks ───────────────────────────────────────────────
const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = storageManager.get(key, validators.isObject);
      return item ?? initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      storageManager.set(key, value);
      setStoredValue(value);
    } catch (error) {
      logger.error(`Error saving to localStorage (${key}):`, error);
    }
  }, [key]);

  return [storedValue, setValue];
};

// ─── Sub-Components ───────────────────────────────────────────────

const RankMovementIndicator = React.memo(({ liveDifference }) => {
  const diff = liveDifference ?? 0;

  if (diff > 0) {
    return (
      <motion.span
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-500"
        aria-label={`Rank improved by ${diff} position${diff > 1 ? "s" : ""}`}
      >
        <ArrowUp className="w-2.5 h-2.5 animate-bounce" />
        <span className="sr-only">Up</span>
        {diff}
      </motion.span>
    );
  }
  if (diff < 0) {
    const absDiff = Math.abs(diff);
    return (
      <motion.span
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        className="inline-flex items-center gap-0.5 text-[10px] font-black text-rose-500"
        aria-label={`Rank dropped by ${absDiff} position${absDiff > 1 ? "s" : ""}`}
      >
        <ArrowDown className="w-2.5 h-2.5" />
        <span className="sr-only">Down</span>
        {absDiff}
      </motion.span>
    );
  }
  return (
    <span className="inline-flex items-center text-[10px] font-bold text-slate-400" aria-label="No rank change">
      <Minus className="w-2 h-2" aria-hidden="true" />
    </span>
  );
});
RankMovementIndicator.displayName = "RankMovementIndicator";

const AnimatedCounter = React.memo(
  ({ value, duration = 1200 }) => {
    const [count, setCount] = useState(0);
    const rafRef = useRef();
    const end = useMemo(() => {
      const end = typeof value === "string" ? parseInt(value, 10) : value;
      return isNaN(end) ? 0 : end;
    }, [value]);

    useEffect(() => {
      if (end === 0) {
        setCount(0);
        return;
      }

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const startTime = performance.now();

      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        setCount(Math.round(eased * end));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, [end, duration]);

    return <span aria-live="polite">{count.toLocaleString()}</span>;
  }
);
AnimatedCounter.displayName = "AnimatedCounter";

const LiveStatusBadge = ({ status }) => {
  const statusConfig = {
    [SSE_STATUS.CONNECTED]: {
      label: "Live",
      color: "text-emerald-600 dark:text-emerald-400",
      dotColor: "bg-emerald-500",
      pingColor: "bg-emerald-400",
    },
    [SSE_STATUS.RECONNECTING]: {
      label: "Reconnecting…",
      color: "text-amber-500 dark:text-amber-400",
      dotColor: "bg-amber-400",
      pingColor: "bg-amber-300",
    },
    [SSE_STATUS.DISCONNECTED]: {
      label: "Offline",
      color: "text-gray-400 dark:text-gray-500",
      dotColor: "bg-gray-300 dark:bg-gray-600",
      pingColor: "bg-gray-200 dark:bg-gray-700",
    },
  };

  const config = statusConfig[status] || statusConfig[SSE_STATUS.DISCONNECTED];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.color}`}>
      <span className="relative flex h-2 w-2">
        {status === SSE_STATUS.CONNECTED && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pingColor} opacity-75`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dotColor}`} />
      </span>
      {config.label}
      <span className="sr-only">Connection status: {config.label}</span>
    </span>
  );
};

const PodiumCard = React.memo(({ contributor, position, orderClass, styling, isFirst = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`flex flex-col items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border-b-8 ${styling.borderClass} border border-slate-200/50 dark:border-slate-800/40 shadow-xl ${orderClass}`}
      role="listitem"
      aria-label={`${position} place: ${contributor.username}`}
    >
      <div className="relative mb-4">
        <span className={`absolute -inset-1 rounded-full bg-gradient-to-r ${styling.ringClass} blur-sm opacity-80`} aria-hidden="true" />
        <img
          src={contributor.avatar}
          alt={`${contributor.username}'s avatar`}
          className={`relative ${styling.size} rounded-full border-4 ${styling.borderClass.split(" ").pop()} shadow-md object-cover`}
          loading="lazy"
          width={styling.size.includes("22") ? 88 : 72}
          height={styling.size.includes("22") ? 88 : 72}
        />
        <div className={`absolute -bottom-2 -right-1 flex h-6 w-6 items-center justify-center rounded-full ${styling.medalClass} text-[10px] font-black uppercase tracking-tight shadow`}>
          {position}
        </div>
        {isFirst && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl animate-bounce" aria-hidden="true">
            👑
          </div>
        )}
      </div>

      <a
        href={contributor.profile}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-base font-black ${isFirst ? "bg-gradient-to-r from-slate-950 via-indigo-950 to-pink-950 dark:from-white dark:via-indigo-200 dark:to-pink-100 bg-clip-text text-transparent" : "text-slate-900 dark:text-white"} hover:text-indigo-500 transition-colors truncate max-w-[200px] text-center`}
        aria-label={`View ${contributor.username}'s GitHub profile`}
      >
        {contributor.username}
      </a>

      <div className={`mt-2.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${styling.badgeClass}`}>
        {styling.title}
      </div>

      <div className="mt-4 flex items-center justify-around w-full border-t border-slate-200/50 dark:border-slate-800/40 pt-4">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Points</span>
          <p className={`text-lg font-black mt-0.5 ${styling.pointsClass}`}>
            <AnimatedCounter value={contributor.points} />
          </p>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PRs</span>
          <p className="text-lg font-black text-indigo-500 mt-0.5">
            <AnimatedCounter value={contributor.prs} />
          </p>
        </div>
      </div>
    </motion.div>
  );
});
PodiumCard.displayName = "PodiumCard";

// ─── Main Component ───────────────────────────────────────────────
export default function LeaderBoard() {
  useDocumentTitle("Eventra | Leaderboard");

  // State
  const [contributors, setContributors] = useState([]);
  const [streaks, setStreaks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [search, setSearch] = useState("");
  const [, setRecentSearches] = useLocalStorage(
    STORAGE_KEYS.RECENT_SEARCHES,
    { queries: [], lastUpdated: Date.now() }
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("points");
  const [activeCategory, setActiveCategory] = useState("overall");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs
  const lastAppliedSyncRef = useRef(null);
  const searchInputRef = useRef(null);

  // Context
  const {
    contributors: streamContributors,
    lastSynced,
    status: streamStatus,
  } = useLeaderboardStream();

  // Derived values
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const filteredContributors = useMemo(
    () => filterContributors(contributors, debouncedSearch, activeCategory),
    [contributors, debouncedSearch, activeCategory]
  );

  const sortedContributors = useMemo(
    () => sortContributors(filteredContributors, sortBy),
    [filteredContributors, sortBy]
  );

  const currentContributors = useMemo(
    () => paginateContributors(sortedContributors, currentPage, CONTRIBUTORS_PER_PAGE),
    [sortedContributors, currentPage]
  );

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

  const top3 = useMemo(() => filteredContributors.slice(0, 3), [filteredContributors]);

  const sortOptions = useMemo(
    () => [
      { label: "Points (High → Low)", value: "points" },
      { label: "PRs (High → Low)", value: "prs" },
      { label: "Username (A → Z)", value: "username" },
    ],
    []
  );

  // ─── Effects ───────────────────────────────────────────────

  // 🎉 Initial confetti celebration
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti(CONFETTI_CONFIG);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Real-time stream updates
  useEffect(() => {
    if (streamContributors.length === 0 || lastSynced === lastAppliedSyncRef.current) return;

    lastAppliedSyncRef.current = lastSynced;

    const preparedContributors = prepareLeaderboardEntries(streamContributors);

    setContributors((prev) => {
      setStreaks((prevStreaks) => {
        const updatedStreaks = { ...prevStreaks };
        const prevRanks = new Map(prev.map((c, idx) => [c.username, idx + 1]));

        preparedContributors.forEach((c, newIdx) => {
          const username = c.username;
          const newRank = newIdx + 1;
          const prevRank = prevRanks.get(username);
          const currentStreak = prevStreaks[username] || { consecutiveUp: 0, onFire: false, rankDifference: 0 };

          if (prevRank !== undefined) {
            const rankDifference = prevRank - newRank;
            let consecutiveUp = rankDifference > 0 ? currentStreak.consecutiveUp + 1 : rankDifference < 0 ? 0 : currentStreak.consecutiveUp;
            const onFire = rankDifference >= 3 || consecutiveUp >= 3;

            updatedStreaks[username] = { consecutiveUp, onFire, rankDifference };
          } else {
            updatedStreaks[username] = { consecutiveUp: 0, onFire: false, rankDifference: 0 };
          }
        });

        return updatedStreaks;
      });
      return preparedContributors;
    });

    setLastUpdated(`Live: ${formatLastUpdated(lastSynced)}`);

    // Update cache
    try {
      storageManager.set(STORAGE_KEYS.LEADERBOARD_CACHE, {
        data: preparedContributors,
        timestamp: lastSynced,
      });
    } catch (err) {
      logger.warn("Failed to update leaderboard cache:", err);
    }
  }, [streamContributors, lastSynced]);

  // Load initial data
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try cache first
        const cached = storageManager.get(
          STORAGE_KEYS.LEADERBOARD_CACHE,
          validators.isObject
        );

        if (cached?.data && cached?.timestamp) {
          const age = Date.now() - cached.timestamp;
          if (age < LEADERBOARD_CACHE_TTL) {
            if (isMounted) {
              setContributors(cached.data);
              setLastUpdated(`Cached: ${formatLastUpdated(cached.timestamp)}`);
              setLoading(false);
              return;
            }
          }
        }

        // Fetch fresh data
        const { data } = await fetchWithTimeout("/api/leaderboard", {}, 15000);

        if (!Array.isArray(data)) {
          throw new Error("Invalid leaderboard data format");
        }

        const preparedData = prepareLeaderboardEntries(data);

        if (isMounted) {
          const sorted = [...preparedData].sort((a, b) => b.points - a.points);
          setContributors(sorted);
          setLastUpdated(`Updated: ${formatLastUpdated(Date.now())}`);

          // Cache the fresh data
          storageManager.set(STORAGE_KEYS.LEADERBOARD_CACHE, {
            data: sorted,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        logger.error("Failed to load leaderboard:", err);
        if (isMounted) {
          setError("Unable to load leaderboard. Please try again.");
          setContributors([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Handlers ───────────────────────────────────────────────

  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearch(query);
    setCurrentPage(1);

    // Save to recent searches
    if (query.trim().length >= 2) {
      setRecentSearches((prev) => {
        const queries = [query, ...prev.queries.filter((q) => q !== query)].slice(0, 5);
        return { queries, lastUpdated: Date.now() };
      });
    }
  }, [setRecentSearches]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const { data } = await fetchWithTimeout("/api/leaderboard", {}, 10000);
      if (Array.isArray(data)) {
        const preparedData = prepareLeaderboardEntries(data);
        const sorted = [...preparedData].sort((a, b) => b.points - a.points);
        setContributors(sorted);
        setLastUpdated(`Refreshed: ${formatLastUpdated(Date.now())}`);

        storageManager.set(STORAGE_KEYS.LEADERBOARD_CACHE, {
          data: sorted,
          timestamp: Date.now(),
        });

        confetti({ ...CONFETTI_CONFIG, particleCount: 50, spread: 50 });
      }
    } catch (err) {
      logger.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const handleExport = useCallback(() => {
    const exportData = sortedContributors.map((c) => ({
      rank: ranksMap[c.username],
      username: c.username,
      name: c.name || "",
      points: c.points,
      prs: c.prs,
      profile: c.profile,
    }));

    const csv = [
      ["Rank", "Username", "Name", "Points", "PRs", "Profile"],
      ...exportData.map((row) => [
        row.rank,
        row.username,
        row.name,
        row.points,
        row.prs,
        row.profile,
      ]),
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `eventra-leaderboard-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [sortedContributors, ranksMap]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    if (e.key === "ArrowLeft" && currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
    if (e.key === "ArrowRight" && currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  }, [currentPage, totalPages]);

  // Attach keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ─── Podium Configuration ───────────────────────────────────────────────
  const podiumConfig = useMemo(() => [
    {
      position: "2nd",
      contributor: top3[1],
      orderClass: "order-2 md:order-1",
      styling: {
        borderClass: "border-slate-300 dark:border-slate-700",
        ringClass: "from-slate-200 to-zinc-400",
        title: "Platinum Contributor",
        badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
        size: "h-18 w-18",
        pointsClass: "text-slate-800 dark:text-slate-100",
        medalClass: "bg-slate-300 text-slate-800",
      },
    },
    {
      position: "1st",
      contributor: top3[0],
      orderClass: "order-1 md:order-2",
      styling: {
        borderClass: "border-yellow-400 dark:border-yellow-500",
        ringClass: "from-yellow-300 via-amber-400 to-yellow-500",
        title: "Grandmaster / Diamond Tier",
        badgeClass: "bg-yellow-400 text-yellow-950 shadow-[0_2px_10px_rgba(234,179,8,0.3)]",
        size: "h-22 w-22",
        pointsClass: "text-amber-500",
        medalClass: "bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950",
      },
      isFirst: true,
    },
    {
      position: "3rd",
      contributor: top3[2],
      orderClass: "order-3 md:order-3",
      styling: {
        borderClass: "border-amber-600 dark:border-orange-700",
        ringClass: "from-amber-600 to-orange-500",
        title: "Platinum Contributor",
        badgeClass: "bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-300 border border-orange-200/40",
        size: "h-18 w-18",
        pointsClass: "text-slate-800 dark:text-slate-100",
        medalClass: "bg-amber-600 text-white",
      },
    },
  ].filter((p) => p.contributor), [top3]);

  // ─── Render ───────────────────────────────────────────────
  return (
    <FeatureErrorBoundary>
      <div
        className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(224,233,242,0.52),_transparent_42%),linear-gradient(180deg,#f8fbfe_0%,#eef4fa_100%)] pt-20 md:pt-24 py-12 sm:py-16 transition-colors duration-300"
        role="main"
        aria-labelledby="leaderboard-heading"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* HERO SECTION */}
          <header className="mb-10 rounded-[32px] border border-slate-200/70 bg-white/85 px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-600"
            >
              <Trophy className="w-3 h-3" aria-hidden="true" />
              GSSoC&apos;26 Contribution Arena
            </motion.div>

            <h1 id="leaderboard-heading" className="mt-5 text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950">
              Community{" "}
              <span className="bg-gradient-to-r from-slate-700 via-slate-500 to-slate-300 bg-clip-text text-transparent">
                Leaderboard
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
              A concise view of active contributors, ranked by impact, with live updates and a clear breakdown of points, PRs, and achievement tiers.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{stats.totalContributors} contributors</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{stats.flooredTotalPRs} merged PRs</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{currentContributors.length} shown on this page</span>
            </div>
          </header>

          {/* OLYMPIC PODIUM - Top 3 */}
          {!loading && top3.length > 0 && (
            <section className="mb-14" aria-labelledby="podium-heading">
              <h2 id="podium-heading" className="sr-only">Top 3 Contributors</h2>
              <div className="flex flex-col md:flex-row items-end justify-center gap-6 max-w-4xl mx-auto" role="list">
                {podiumConfig.map((podium) => (
                  <PodiumCard
                    key={podium.position}
                    contributor={podium.contributor}
                    position={podium.position}
                    orderClass={podium.orderClass}
                    styling={podium.styling}
                    isFirst={podium.isFirst}
                  />
                ))}
              </div>
            </section>
          )}

          {/* CATEGORY FILTERS */}
          <nav className="mb-8 flex flex-wrap items-center justify-center gap-3" aria-label="Leaderboard categories">
            {CATEGORY_FILTERS.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setCurrentPage(1);
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                aria-pressed={activeCategory === cat.id}
                className={`
                  flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all backdrop-blur-xl
                  ${
                    activeCategory === cat.id
                      ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-300/40"
                      : "bg-white/75 text-slate-600 border-slate-200/60 hover:border-slate-300 hover:bg-white"
                  }
                `}
                title={cat.description}
              >
                <span aria-hidden="true">{cat.icon}</span>
                {cat.label}
              </motion.button>
            ))}
          </nav>

          {/* SEARCH & CONTROLS */}
          <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-slate-200/70 bg-white/80 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search contributors... (Press / to focus)"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-950 transition-all placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E0E9F2]"
                aria-label="Search contributors by username"
              />
            </div>

            <div className="flex items-center gap-3">
              <StyledDropdown
                label="Sort By"
                value={sortOptions.find((opt) => opt.value === sortBy)?.label || "Sort by"}
                options={sortOptions.map((opt) => opt.label)}
                onChange={(value) => {
                  const selected = sortOptions.find((opt) => opt.label === value);
                  if (selected) setSortBy(selected.value);
                }}
                icon={<Filter className="w-3 h-3" aria-hidden="true" />}
              />

              <motion.button
                onClick={handleRefresh}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isRefreshing}
                className="rounded-2xl border border-slate-200 bg-white/70 p-2.5 text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-950 disabled:opacity-50"
                aria-label="Refresh leaderboard data"
                title="Refresh data"
              >
                <Sync className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              </motion.button>

              <motion.button
                onClick={handleExport}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-2xl border border-slate-200 bg-white/70 p-2.5 text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-950"
                aria-label="Export leaderboard as CSV"
                title="Export as CSV"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
              </motion.button>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-sm text-slate-600 backdrop-blur-xl">
            <span>
              Showing <strong className="font-semibold text-slate-900">{currentContributors.length}</strong> of <strong className="font-semibold text-slate-900">{sortedContributors.length}</strong> contributors
            </span>
            <span>
              Page <strong className="font-semibold text-slate-900">{currentPage}</strong> of <strong className="font-semibold text-slate-900">{totalPages}</strong>
            </span>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: "Active Contributors",
                value: stats.totalContributors,
                gradient: "from-blue-500/10 to-indigo-500/10",
                border: "border-blue-100 dark:border-blue-900/30",
                textColor: "text-blue-600 dark:text-blue-400",
                icon: FaUsers,
              },
              {
                title: "Merged Pull Requests",
                value: stats.flooredTotalPRs,
                gradient: "from-emerald-500/10 to-teal-500/10",
                border: "border-emerald-100 dark:border-emerald-900/30",
                textColor: "text-emerald-600 dark:text-emerald-400",
                icon: FaCode,
              },
              {
                title: "Total Arena Points",
                value: stats.flooredTotalPoints,
                gradient: "from-amber-500/10 to-orange-500/10",
                border: "border-amber-100 dark:border-amber-900/30",
                textColor: "text-amber-600 dark:text-amber-400",
                icon: FaStar,
              },
            ].map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`group flex items-center gap-4 rounded-3xl border bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5 ${card.border}`}
              >
                <div className="rounded-2xl border border-slate-200 bg-[#E0E9F2]/35 p-3.5 text-slate-700 shadow-sm">
                  <card.icon className="text-2xl" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {card.title}
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-slate-950">
                    {loading ? (
                      <span className="inline-block w-12 h-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    ) : (
                      <AnimatedCounter value={card.value} />
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* LEADERBOARD TABLE */}
          <section
            className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl"
            aria-labelledby="leaderboard-table-title"
          >
            <h2 id="leaderboard-table-title" className="sr-only">Contributor Rankings</h2>

            {error ? (
              <div className="p-8 text-center">
                <p className="text-rose-500 font-medium">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : loading ? (
              <div role="status" aria-live="polite">
                <span className="sr-only">Loading leaderboard...</span>
                <SkeletonLeaderboard rows={CONTRIBUTORS_PER_PAGE} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/90">
                    <tr>
                      {["Rank", "Contributor", "Achievement", "Points", "PRs"].map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <AnimatePresence mode="popLayout">
                      {currentContributors.length > 0 ? (
                        currentContributors.map((c, index) => {
                          const rank = ranksMap[c.username];
                          const badge = getAchievementBadge(rank, c.prs, c.points);
                          const streak = streaks[c.username];

                          return (
                            <motion.tr
                              key={c.username}
                              layout
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -16 }}
                              transition={{ type: "spring", stiffness: 260, damping: 22, delay: index * 0.03 }}
                              whileHover={{ backgroundColor: "rgba(99,102,241,0.06)" }}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors focus-within:ring-2 focus-within:ring-indigo-500"
                              tabIndex={0}
                            >
                              {/* Rank */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                                      rank === 1
                                        ? "bg-yellow-400 text-yellow-950 shadow-md"
                                        : rank === 2
                                        ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                        : rank === 3
                                        ? "bg-amber-600 text-white shadow-md"
                                        : "bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                                    }`}
                                    aria-label={`Rank ${rank}`}
                                  >
                                    {rank}
                                  </span>
                                  <RankMovementIndicator liveDifference={streak?.rankDifference} />
                                </div>
                              </td>

                              {/* Contributor */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    {rank <= 3 && (
                                      <span
                                        className={`absolute -inset-0.5 rounded-full blur-xs opacity-75 animate-pulse bg-gradient-to-r ${
                                          rank === 1
                                            ? "from-yellow-400 to-amber-500"
                                            : rank === 2
                                            ? "from-slate-200 to-zinc-400"
                                            : "from-amber-600 to-orange-500"
                                        }`}
                                        aria-hidden="true"
                                      />
                                    )}
                                    <img
                                      loading="lazy"
                                      decoding="async"
                                      className={`relative h-10 w-10 rounded-full border-2 bg-slate-100 shadow-sm object-cover ${
                                        rank === 1
                                          ? "border-yellow-400"
                                          : rank === 2
                                          ? "border-slate-300"
                                          : rank === 3
                                          ? "border-amber-600"
                                          : "border-indigo-100 dark:border-slate-800"
                                      }`}
                                      src={c.avatar}
                                      alt={`${c.username}'s avatar`}
                                      width={40}
                                      height={40}
                                    />
                                  </div>
                                  <div>
                                    <a
                                      href={c.profile}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                                    >
                                      {c.username}
                                    </a>
                                    {c.name && c.name !== c.username && (
                                      <div className="text-xs text-slate-400 mt-0.5">{c.name}</div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Achievement Badge */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap items-center gap-2">
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r border shadow-sm transition-all select-none cursor-default ${badge.color}`}
                                    title={badge.description}
                                  >
                                    <badge.icon className="w-3.5 h-3.5" aria-hidden="true" />
                                    {badge.label}
                                  </motion.div>

                                  {streak?.onFire && (
                                    <motion.div
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      animate={{ scale: [1, 1.08, 1], opacity: 1 }}
                                      transition={{ scale: { repeat: Infinity, duration: 1.2, ease: "easeInOut" } }}
                                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 text-white border border-red-400/30 shadow-[0_0_12px_rgba(239,68,68,0.4)] cursor-default select-none"
                                      title="On Fire: Rapid rank improvements!"
                                    >
                                      <motion.span
                                        animate={{ rotate: [-10, 10, -10] }}
                                        transition={{ repeat: Infinity, duration: 0.65 }}
                                        aria-hidden="true"
                                      >
                                        🔥
                                      </motion.span>
                                      ON FIRE
                                    </motion.div>
                                  )}
                                </div>
                              </td>

                              {/* Points */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                                  <Star className="text-yellow-400 text-xs animate-spin-slow" aria-hidden="true" />
                                  <span className="font-extrabold">
                                    <AnimatedCounter value={c.points} />
                                  </span>
                                </div>
                              </td>

                              {/* PRs */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                                  <Code className="text-indigo-500 text-xs" aria-hidden="true" />
                                  <span className="font-extrabold">
                                    <AnimatedCounter value={c.prs} />
                                  </span>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                            <div className="flex flex-col items-center gap-3">
                              <Search className="w-8 h-8 text-slate-300 dark:text-slate-700" aria-hidden="true" />
                              <p className="font-medium">No contributors found</p>
                              <p className="text-sm">Try adjusting your search or filters</p>
                              <button
                                onClick={() => {
                                  setSearch("");
                                  setActiveCategory("overall");
                                  setSortBy("points");
                                }}
                                className="mt-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                              >
                                Clear filters
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center py-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="text-xs font-medium text-slate-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2" role="navigation" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#E0E9F2] disabled:opacity-50"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-3 h-3" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#E0E9F2] disabled:opacity-50"
                        aria-label="Next page"
                      >
                        <ChevronRight className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-3">
              {lastUpdated && (
                <time className="text-xs font-medium text-slate-500" dateTime={lastUpdated}>
                  {lastUpdated}
                </time>
              )}
              <LiveStatusBadge status={streamStatus} />
            </div>
          </section>

          {/* Keyboard shortcuts hint */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">/</kbd> to search •{" "}
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">←</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">→</kbd> to navigate pages
            </p>
          </div>
        </div>

        <GSSoCContribution />
      </div>
    </FeatureErrorBoundary>
  );
}
