import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ErrorBoundary from "../../components/common/ErrorBoundary";
import { fetchWithTimeout } from "../../utils/fetchWithTimeout";
import confetti from "canvas-confetti";
import GSSoCContribution from "./GSSoCContribution";
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

export default function LeaderBoard() {
  useDocumentTitle("Eventra | Leaderboard");

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
    setLastUpdated(`Live: ${formatLastUpdated(lastSynced)}`);

    try {
      storageManager.set(STORAGE_KEYS.LEADERBOARD_CACHE, {
        data: preparedContributors,
        timestamp: lastSynced,
      });
    } catch (err) {
      logger.warn("Failed to update leaderboard cache:", err);
    }
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
              setLastUpdated(`Cached: ${formatLastUpdated(cached.timestamp)}`);
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
          setLastUpdated(`Updated: ${formatLastUpdated(Date.now())}`);

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

  return (
    <ErrorBoundary level="feature">
      <div
        className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(224,233,242,0.52),_transparent_42%),linear-gradient(180deg,#f8fbfe_0%,#eef4fa_100%)] pt-20 md:pt-24 py-12 sm:py-16 transition-colors duration-300"
        role="main"
        aria-labelledby="leaderboard-heading"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeaderboardHero stats={stats} loading={loading} currentContributors={currentContributors} />

          <LeaderboardPodium top3={top3} />

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
              Showing <strong className="font-semibold text-slate-900">{currentContributors.length}</strong> of <strong className="font-semibold text-slate-900">{sortedContributors.length}</strong> contributors
            </span>
            <span>
              Page <strong className="font-semibold text-slate-900">{currentPage}</strong> of <strong className="font-semibold text-slate-900">{totalPages}</strong>
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
