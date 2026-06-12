import { AnimatePresence, motion, useInView } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import { Award, Calendar, Clock, Code2, Sparkles, TrendingUp, Trash2, Users } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ModernSearchInput from "../../components/common/ModernSearchInput";
import CountUpLib from "react-countup";
import { darkTheme } from "../../components/styles/theme";
import { safeParseJson } from "../../utils/jsonUtils";
import { SkeletonBlock } from "../../components/common/SkeletonLoaders";
const CountUp = CountUpLib.default || CountUpLib;

// 🔥 THE FIX: Single, clean declarations placed in the correct order 🔥
const SEARCH_HISTORY_KEY = "eventra.events.searchHistory";

const getStoredSearchHistory = () => {
  const stored = safeParseJson(localStorage.getItem(SEARCH_HISTORY_KEY), []);
  return Array.isArray(stored) ? stored.slice(0, 5) : [];
};

const TRENDING_SEARCHES = [
  "Workshop",
  "Hackathon",
  "Open Source",
  "Conference",
  "AI",
  "Web Development",
];

export default function EventHero({ searchQuery, handleSearch, filteredEvents, scrollToCard }) {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const searchContainerRef = useRef(null);
  const dropdownRef = useRef(null);
  const statsRef = useRef(null);

  // Trigger stats animation only when visible
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" });

  useEffect(() => {
    setSearchHistory(getStoredSearchHistory());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const persistSearchHistory = useCallback((nextHistory) => {
    setSearchHistory(nextHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(nextHistory));
  }, []);

  const saveSearchQuery = useCallback(
    (query) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      const nextHistory = [
        trimmed,
        ...searchHistory.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, 5);
      persistSearchHistory(nextHistory);
    },
    [searchHistory, persistSearchHistory]
  );

  const selectSearchQuery = (query) => {
    handleSearch(query);
    saveSearchQuery(query);
    // Note: Assuming saveRecentSearch is handled upstream or passed correctly in full context
  };

  useEffect(() => {
    // Preload hero background image for better LCP
    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "image";
    preloadLink.href = "/assets/eventbg.png";

    document.head.appendChild(preloadLink);

    return () => {
      document.head.removeChild(preloadLink);
    };
  }, []);
  const clearSearchHistory = useCallback(() => {
    persistSearchHistory([]);
  }, [persistSearchHistory]);

  const handleSearchBlur = useCallback(() => {
    saveSearchQuery(searchQuery);
    window.setTimeout(() => setIsSearchFocused(false), 150);
  }, [searchQuery, saveSearchQuery]);

  const handleSearchKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        saveSearchQuery(searchQuery);
        scrollToCard?.();
        setIsSearchFocused(false);
      }
    },
    [searchQuery, saveSearchQuery, scrollToCard]
  );

  const showDropdown = isSearchFocused && !prefersReducedMotion;

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden"
      role="search"
      aria-label="Search events"
    >
      {/* Background + Overlay */}
      <div
        className="absolute inset-0 bg-[url('/assets/eventbg.png')] bg-cover bg-center bg-no-repeat"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-indigo-50/40 to-white dark:from-slate-950/90 dark:via-slate-900/70 dark:to-slate-950/95" />

      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16 sm:py-20 md:py-24">
        <h1
          className="text-3xl leading-tight font-extrabold text-slate-900 drop-shadow-sm sm:text-4xl md:text-5xl lg:text-6xl dark:text-white"
          style={{ fontFamily: '"Big Shoulders Display", sans-serif' }}
        >
          Discover{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Events
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-slate-600 sm:text-base md:text-lg dark:text-slate-300">
          Discover exciting events, compete with talented participants, learn new skills, and{" "}
          <span className="font-semibold text-slate-900 dark:text-white">win rewards</span>.
        </p>

        <div className="relative z-50 mx-auto mt-8 w-full max-w-3xl px-4 sm:mt-12 sm:px-0">
          <ModernSearchInput
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={handleSearchBlur}
            onKeyDown={handleSearchKeyDown}
            autoFocus
            placeholder="Search events by name, location, or tags..."
            aria-expanded={isSearchFocused}
            aria-haspopup="listbox"
          >
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  ref={dropdownRef}
                  role="listbox"
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: "easeOut" }}
                  className={`absolute top-full right-0 left-0 z-30 mt-3 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700/60 ${darkTheme.card} text-left shadow-2xl ring-1 ring-black/5 backdrop-blur-xl dark:ring-white/10`}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
                    <div className="border-b border-slate-100 p-4 dark:border-slate-800">
                      <p
                        className={`mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase ${darkTheme.textSecondary}`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Searching...
                      </p>
                      <div className="flex flex-col gap-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3 px-2 py-1.5">
                            <SkeletonBlock className="h-4 w-4 rounded" />
                            <SkeletonBlock
                              className={`h-4 rounded ${i % 2 === 0 ? "w-3/4" : "w-1/2"}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchHistory.length > 0 && (
                    <div className="border-b border-slate-100 p-4 dark:border-slate-800">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p
                          className={`flex items-center gap-2 text-xs font-semibold tracking-wide uppercase ${darkTheme.textSecondary}`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          Recent searches
                        </p>
                        <button
                          type="button"
                          onClick={clearSearchHistory}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 focus:ring-2 focus:ring-red-500/30 focus:outline-none dark:text-red-400 dark:hover:bg-red-950/40"
                          aria-label="Clear search history"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Clear History
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => selectSearchQuery(item)}
                            className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-all ${darkTheme.card} ${darkTheme.textSecondary} hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:ring-2 focus:ring-blue-500/30 focus:outline-none dark:hover:bg-blue-950/40 dark:hover:text-blue-300`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <p
                      className={`mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase ${darkTheme.textSecondary}`}
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      Trending
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_SEARCHES.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => selectSearchQuery(tag)}
                          className="rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-100 focus:ring-2 focus:ring-blue-500/30 focus:outline-none dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ModernSearchInput>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 sm:gap-3">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {["AI", "Blockchain", "Web", "DevOps", "React", "UX", "Development"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => selectSearchQuery(tag)}
                  className={`cursor-pointer rounded-xl px-2 py-1 text-xs font-medium transition-all sm:px-3 ${darkTheme.card} ${darkTheme.textSecondary} hover:scale-105 focus:ring-2 focus:ring-blue-500/30 focus:outline-none`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <span
              className={`text-xs font-semibold whitespace-nowrap sm:text-sm ${darkTheme.textSecondary}`}
            >
              {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
            </span>
          </div>
        </div>

        <div className="mt-8 flex w-full max-w-xl flex-col items-center justify-center gap-4 px-4 sm:mt-12 sm:flex-row">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToCard}
            className={`group relative flex w-full min-w-[220px] items-center justify-center overflow-hidden rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 sm:w-auto sm:px-7 sm:py-3.5 sm:text-base ${darkTheme.buttonPrimary}`}
          >
            <Sparkles className="mr-2 inline-block h-4 w-4 sm:h-5 sm:w-5" />
            Explore Events
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/create-event")}
            className={`relative flex w-full min-w-[220px] items-center justify-center rounded-2xl px-6 py-3 text-sm font-medium transition-all duration-300 sm:w-auto sm:px-7 sm:py-3.5 sm:text-base ${darkTheme.buttonSecondary}`}
          >
            <Users className="mr-2 inline-block h-4 w-4 sm:h-5 sm:w-5" />
            Host an Event
          </motion.button>
        </div>

        {searchQuery.trim() === "" && (
          <div
            ref={statsRef}
            className="relative mx-auto mt-12 mb-8 grid max-w-6xl grid-cols-2 gap-4 px-4 sm:mt-16 sm:mb-12 sm:gap-6 sm:px-6 md:mt-20 md:mb-16 md:gap-8 lg:grid-cols-4"
          >
            {[
              { label: "Events Hosted", value: 120, suffix: "+", icon: Calendar },
              { label: "Active Participants", value: 50, suffix: "k+", icon: Users },
              { label: "Projects Created", value: 8, suffix: "k+", icon: Code2 },
              { label: "Total Prizes", value: 1, prefix: "$", suffix: "M+", icon: Award },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                className={`${darkTheme.card} flex flex-col items-center rounded-3xl p-4 text-center shadow-xl transition-all duration-200 sm:p-6`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 sm:mb-4 sm:h-12 sm:w-12 dark:border-slate-700/50 dark:bg-slate-800">
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${darkTheme.textSecondary}`} />
                </div>
                <p
                  className={`text-xl font-bold tracking-tight sm:text-2xl md:text-3xl ${darkTheme.textPrimary}`}
                >
                  <CountUp
                    key={isStatsInView ? "start" : "reset"}
                    start={0}
                    end={stat.value}
                    duration={2.5}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    enableScrollSpy
                    scrollSpyDelay={200}
                  />
                </p>
                <p className={`mt-1 text-xs font-medium sm:text-sm ${darkTheme.textSecondary}`}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
