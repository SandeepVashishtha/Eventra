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

export default function EventHero({
  searchQuery,
  handleSearch,
  filteredEvents,
  scrollToCard,
}) {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const searchContainerRef = useRef(null);
  const dropdownRef = useRef(null);
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" });

  useEffect(() => {
    setSearchHistory(getStoredSearchHistory());
  }, []);

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
  };

  useEffect(() => {
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
    <section className="relative min-h-screen w-full overflow-hidden" role="search" aria-label="Search events">
      {/* Background + Overlay */}
      <div
        className="absolute inset-0 bg-[url('/assets/eventbg.png')] bg-cover bg-center bg-no-repeat"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-indigo-50/40 to-white dark:from-slate-950/90 dark:via-slate-900/70 dark:to-slate-950/95" />

      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16 sm:py-20 md:py-24">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white drop-shadow-sm"
          style={{ fontFamily: '"Big Shoulders Display", sans-serif' }}
        >
          Discover{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Events
          </span>
        </h1>
        <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-center">
          Discover exciting events, compete with talented participants, learn
          new skills, and{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            win rewards
          </span>
          .
        </p>

        {/* FIX 1: Added `relative z-20` so this container creates a stacking context
            above the CTA buttons (z-10), letting the absolute dropdown float over them */}
        <div className="relative z-20 w-full max-w-3xl mx-auto mt-8 sm:mt-12 px-4 sm:px-0">
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
                  className={`
                    absolute left-0 right-0 top-full z-30 mt-3 overflow-hidden rounded-3xl
                    border border-slate-200 dark:border-slate-700/60
                    bg-white dark:bg-slate-900
                    text-left shadow-2xl ring-1 ring-black/5 dark:ring-white/10
                  `}
                  // FIX 2: Replaced `${darkTheme.card} backdrop-blur-xl` with explicit
                  // `bg-white dark:bg-slate-900` — darkTheme.card often has bg opacity/transparency
                  // which caused the dropdown to visually bleed into the buttons beneath it.
                  // Solid background ensures the dropdown floats cleanly over all content below.
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
                    <div className="border-b border-slate-100 dark:border-slate-800 p-4">
                      <p className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${darkTheme.textSecondary}`}>
                        <Sparkles className="h-3.5 w-3.5" />
                        Searching...
                      </p>
                      <div className="flex flex-col gap-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3 px-2 py-1.5">
                            <SkeletonBlock className="h-4 w-4 rounded" />
                            <SkeletonBlock className={`h-4 rounded ${i % 2 === 0 ? "w-3/4" : "w-1/2"}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchHistory.length > 0 && (
                    <div className="border-b border-slate-100 dark:border-slate-800 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${darkTheme.textSecondary}`}>
                          <Clock className="h-3.5 w-3.5" />
                          Recent searches
                        </p>
                        <button
                          type="button"
                          onClick={clearSearchHistory}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-950/40 focus:outline-none focus:ring-2 focus:ring-red-500/30"
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
                            className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-all ${darkTheme.card} ${darkTheme.textSecondary} hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <p className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${darkTheme.textSecondary}`}>
                      <TrendingUp className="h-3.5 w-3.5" />
                      Trending
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_SEARCHES.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => selectSearchQuery(tag)}
                          className="rounded-xl bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-300 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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

          <div className="mt-4 flex items-center justify-between flex-wrap gap-2 sm:gap-3 px-1">
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {["AI", "Blockchain", "Web", "DevOps", "React", "UX", "Development"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => selectSearchQuery(tag)}
                  className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-xl cursor-pointer transition-all ${darkTheme.card} ${darkTheme.textSecondary} hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${darkTheme.textSecondary}`}>
              {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
            </span>
          </div>
        </div>

        {/* FIX 3: Added `relative z-10` so CTA buttons sit in a lower stacking layer
            than the search container (z-20), ensuring the dropdown renders on top of them */}
        <div className="relative z-10 mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl px-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToCard}
            className={`relative w-full sm:w-auto min-w-[220px] px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-sm sm:text-base font-semibold overflow-hidden group transition-all duration-300 flex items-center justify-center ${darkTheme.buttonPrimary}`}
          >
            <Sparkles className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Explore Events
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/create-event")}
            className={`relative w-full sm:w-auto min-w-[220px] px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-sm sm:text-base font-medium transition-all duration-300 flex items-center justify-center ${darkTheme.buttonSecondary}`}
          >
            <Users className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Host an Event
          </motion.button>
        </div>

        {searchQuery.trim() === "" && (
          <div ref={statsRef} className="relative max-w-6xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16 md:mt-20 mb-8 sm:mb-12 md:mb-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
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
                whileHover={{ y: -6 }}
                className={`${darkTheme.card} rounded-3xl shadow-xl p-4 sm:p-6 flex flex-col items-center text-center transition-all duration-300`}
              >
                <div className="mb-3 sm:mb-4 flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700/50">
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${darkTheme.textSecondary}`} />
                </div>
                <p className={`text-xl sm:text-2xl md:text-3xl font-bold tracking-tight ${darkTheme.textPrimary}`}>
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
                <p className={`mt-1 text-xs sm:text-sm font-medium ${darkTheme.textSecondary}`}>
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