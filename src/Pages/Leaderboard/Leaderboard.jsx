import { useMemo, useRef, useState, useEffect, useCallback } from "react";

import ErrorBoundary from "../../components/common/ErrorBoundary";
import { fetchWithTimeout } from "../../utils/fetchWithTimeout";
import confetti from "canvas-confetti";
import GSSoCContribution from "./GSSoCContribution";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useLeaderboardStream } from "../../context/RealTimeContext";
import {
  filterContributors,
  sortContributors,
  paginateContributors,
  totalLeaderboardPages,
  buildRanksMap,
  computeLeaderboardStats,
  applyAchievementBonus,
} from "../../utils/leaderboardUtils";

import { useTranslation } from "react-i18next";
import { logger } from "../../utils/logger";
import { storageManager } from "../../utils/storage/storageManager";
import { STORAGE_KEYS } from "../../utils/storage/storageKeys";
import { validators } from "../../utils/storage/storageValidators";

import LeaderboardHero from "./components/LeaderboardHero";
import LeaderboardPodium from "./components/LeaderboardPodium";
import LeaderboardCategoryFilters from "./components/LeaderboardCategoryFilters";
import LeaderboardControls from "./components/LeaderboardControls";
import LeaderboardStatsCards from "./components/LeaderboardStatsCards";
import LeaderboardTable from "./components/LeaderboardTable";

const LEADERBOARD_CACHE_TTL = 60 * 60 * 1000;
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

const formatLastUpdated = (timestamp, t) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffMinutes < 1) return t("leaderboard.timeJustNow");
  if (diffMinutes < 60) return t("leaderboard.timeMinutesAgo", { minutes: diffMinutes });
  if (diffMinutes < 1440) return t("leaderboard.timeHoursAgo", { hours: Math.floor(diffMinutes / 60) });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const prepareLeaderboardEntries = (entries = []) =>
  entries.map((entry) => applyAchievementBonus({ ...entry }));

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

// ─── Main Component ───────────────────────────────────────────────
export default function LeaderBoard() {
  const { t } = useTranslation();
  useDocumentTitle(t("leaderboard.pageTitle"));

  const CATEGORY_FILTERS = useMemo(() => [
    { id: "overall", label: t("leaderboard.filters.overall"), icon: "🏆", description: t("leaderboard.filters.overallDesc") },
    { id: "monthly", label: t("leaderboard.filters.monthly"), icon: "⭐", description: t("leaderboard.filters.monthlyDesc") },
    { id: "mentors", label: t("leaderboard.filters.mentors"), icon: "🎓", description: t("leaderboard.filters.mentorsDesc") },
  ], [t]);

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

  const lastAppliedSyncRef = useRef(null);
  const searchInputRef = useRef(null);
  const prevContributorsRef = useRef([]);

  const {
    contributors: streamContributors,
    lastSynced,
    status: streamStatus,
  } = useLeaderboardStream();

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

  const top3 = useMemo(() => sortedContributors.slice(0, 3), [sortedContributors]);

  const sortOptions = useMemo(
    () => [
      { label: t("leaderboard.sortOptions.points"), value: "points" },
      { label: t("leaderboard.sortOptions.prs"), value: "prs" },
      { label: t("leaderboard.sortOptions.username"), value: "username" },
    ],
    [t]
  );

  // ─── Effects ───────────────────────────────────────────────

  // Initial confetti celebration
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti(CONFETTI_CONFIG);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (streamContributors.length === 0 || lastSynced === lastAppliedSyncRef.current) return;

    lastAppliedSyncRef.current = lastSynced;
    const preparedContributors = prepareLeaderboardEntries(streamContributors);

    setContributors(preparedContributors);
    setLastUpdated(t("leaderboard.statusLive", { time: formatLastUpdated(lastSynced, t) }));

    try {
      storageManager.set(STORAGE_KEYS.LEADERBOARD_CACHE, {
        data: preparedContributors,
        timestamp: lastSynced,
      });
    } catch (err) {
      logger.warn("Failed to update leaderboard cache:", err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamContributors, lastSynced]);

  useEffect(() => {
    if (contributors.length === 0) {
      prevContributorsRef.current = [];
      setStreaks({});
      return;
    }

    setStreaks((prevStreaks) => {
      const updatedStreaks = { ...prevStreaks };
      const prevRanks = new Map(prevContributorsRef.current.map((c, idx) => [c.username, idx + 1]));

      contributors.forEach((c, newIdx) => {
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

    prevContributorsRef.current = contributors;
  }, [contributors]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cached = storageManager.get(
          STORAGE_KEYS.LEADERBOARD_CACHE,
          validators.isObject
        );

        if (cached?.data && cached?.timestamp) {
          const age = Date.now() - cached.timestamp;
          if (age < LEADERBOARD_CACHE_TTL) {
            if (isMounted) {
              setContributors(cached.data);
              setLastUpdated(t("leaderboard.statusCached", { time: formatLastUpdated(cached.timestamp, t) }));
              setLoading(false);
              return;
            }
          }
        }

        const { data } = await fetchWithTimeout("/api/leaderboard", {}, 15000);

        if (!Array.isArray(data)) {
          throw new Error("Invalid leaderboard data format");
        }

        const preparedData = prepareLeaderboardEntries(data);

        if (isMounted) {
          const sorted = [...preparedData].sort((a, b) => b.points - a.points);
          setContributors(sorted);
          setLastUpdated(t("leaderboard.statusUpdated", { time: formatLastUpdated(Date.now(), t) }));

          storageManager.set(STORAGE_KEYS.LEADERBOARD_CACHE, {
            data: sorted,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        logger.error("Failed to load leaderboard:", err);
        if (isMounted) {
          setError(t("leaderboard.errorLoadFailed"));
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for background updates from the service worker
  useEffect(() => {
    const handleServiceWorkerMessage = (event) => {
      if (event.data && event.data.type === "LEADERBOARD_UPDATED") {
        const newData = event.data.data;
        if (Array.isArray(newData)) {
          logger.log("[Leaderboard] Received updated rankings from service worker.");
          const preparedData = prepareLeaderboardEntries(newData);
          const sorted = [...preparedData].sort((a, b) => b.points - a.points);
          setContributors(sorted);
          setLastUpdated(t("leaderboard.statusUpdated", { time: formatLastUpdated(Date.now(), t) }));

          try {
            storageManager.set(STORAGE_KEYS.LEADERBOARD_CACHE, {
              data: sorted,
              timestamp: Date.now(),
            });
          } catch (err) {
            logger.warn("Failed to update leaderboard cache on SW message:", err);
          }
        }
      }
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    }

    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
      }
    };
  }, [t]);

  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearch(query);
    setCurrentPage(1);

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
        setLastUpdated(t("leaderboard.statusRefreshed", { time: formatLastUpdated(Date.now(), t) }));

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = `eventra-leaderboard-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
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

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, activeCategory]);

  const handleCategoryChange = useCallback((id) => {
    setActiveCategory(id);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
  }, []);

  // ─── Podium Configuration ───────────────────────────────────────────────
  const podiumConfig = useMemo(() => [
    {
      position: t("leaderboard.podiumPositions.2nd"),
      contributor: top3[1],
      orderClass: "order-2 md:order-1",
      styling: {
        borderClass: "border-slate-300 dark:border-slate-700",
        ringClass: "from-slate-200 to-zinc-400",
        title: t("leaderboard.podiumTitles.2nd"),
        badgeClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
        size: "h-18 w-18",
        pointsClass: "text-slate-800 dark:text-slate-100",
        medalClass: "bg-slate-300 text-slate-800",
      },
    },
    {
      position: t("leaderboard.podiumPositions.1st"),
      contributor: top3[0],
      orderClass: "order-1 md:order-2",
      styling: {
        borderClass: "border-yellow-400 dark:border-yellow-500",
        ringClass: "from-yellow-300 via-amber-400 to-yellow-500",
        title: t("leaderboard.podiumTitles.1st"),
        badgeClass: "bg-yellow-400 text-yellow-950 shadow-[0_2px_10px_rgba(234,179,8,0.3)]",
        size: "h-22 w-22",
        pointsClass: "text-amber-500",
        medalClass: "bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950",
      },
      isFirst: true,
    },
    {
      position: t("leaderboard.podiumPositions.3rd"),
      contributor: top3[2],
      orderClass: "order-3 md:order-3",
      styling: {
        borderClass: "border-amber-600 dark:border-orange-700",
        ringClass: "from-amber-600 to-orange-500",
        title: t("leaderboard.podiumTitles.3rd"),
        badgeClass: "bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-300 border border-orange-200/40",
        size: "h-18 w-18",
        pointsClass: "text-slate-800 dark:text-slate-100",
        medalClass: "bg-amber-600 text-white",
      },
    },
  ].filter((p) => p.contributor), [top3, t]);

  return (
    <ErrorBoundary level="feature">
      <div
        className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(224,233,242,0.52),_transparent_42%),linear-gradient(180deg,#f8fbfe_0%,#eef4fa_100%)] pt-20 md:pt-24 py-12 sm:py-16 transition-colors duration-300"
        role="main"
        aria-labelledby="leaderboard-heading"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeaderboardHero stats={stats} loading={loading} currentContributors={currentContributors} />

          <LeaderboardPodium top3={top3} podiumConfig={podiumConfig} />

          <LeaderboardCategoryFilters
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />

          <LeaderboardControls
            search={search}
            onSearchChange={handleSearchChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            onRefresh={handleRefresh}
            onExport={handleExport}
            isRefreshing={isRefreshing}
            searchInputRef={searchInputRef}
          />

          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-sm text-slate-600 backdrop-blur-xl">
            <span>
              {t("leaderboard.showingContributors", { count: currentContributors.length, total: sortedContributors.length })}
            </span>
            <span>
              {t("leaderboard.pageOf", { current: currentPage, total: totalPages })}
            </span>
          </div>

          <LeaderboardStatsCards stats={stats} loading={loading} />

          <LeaderboardTable
            loading={loading}
            error={error}
            currentContributors={currentContributors}
            sortedContributors={sortedContributors}
            ranksMap={ranksMap}
            streaks={streaks}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            setSearch={setSearch}
            setActiveCategory={setActiveCategory}
            setSortBy={setSortBy}
            streamStatus={streamStatus}
            lastUpdated={lastUpdated}
            onRefresh={handleRefresh}
          />

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">/</kbd> to search &bull;{" "}
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">&larr;</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono">&rarr;</kbd> to navigate pages
            </p>
          </div>
        </div>

        <GSSoCContribution />
      </div>
    </ErrorBoundary>
  );
}
