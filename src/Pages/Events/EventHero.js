import { AnimatePresence, motion, useInView } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import { Award, Calendar, Clock, Code2, Sparkles, TrendingUp, Trash2, Users } from "lucide-react";
import { useEffect, useRef, useState, useCallback, memo } from "react";
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

const StatCounter = ({ stat, shouldAnimate }) => {
  const prefix = stat.prefix || "";
  const suffix = stat.suffix || "";

  if (!shouldAnimate) {
    return (
      <>
        {prefix}0{suffix}
      </>
    );
  }

  return (
    <CountUp
      start={0}
      end={stat.value}
      duration={2.5}
      prefix={prefix}
      suffix={suffix}
      startOnMount
    />
  );
};

function EventHero({
  searchQuery,
  handleSearch,
  filteredEvents,
  scrollToCard,
}) {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [hasMounted, setHasMounted] = useState(false);
  const searchContainerRef = useRef(null);
  const dropdownRef = useRef(null);
  const statsRef = useRef(null);

  // Trigger stats animation only when visible
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" });

  useEffect(() => {
    setHasMounted(true);
  }, []);

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
    <div className="w-full bg-white dark:bg-slate-950">
      <section
        className="relative min-h-[60vh] md:min-h-[70vh] w-full overflow-hidden flex flex-col items-center justify-center"
        role="search"
        aria-label="Search events"
        style={{zIndex: 1}} 
      >
        <div
        className="absolute inset-0 bg-[url('/assets/eventbg.png')] bg-cover bg-center bg-no-repeat"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-indigo-50/40 to-white dark:from-slate-950/90 dark:via-slate-900/70 dark:to-slate-950/95" />
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12 sm:py-16 md:py-20 max-w-4xl mx-auto w-full">
        <h1 
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white drop-shadow-sm text-center"
          style={{fontFamily: '"Big Shoulders Display", sans-serif'}}
        >
          Discover{" "}
          <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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

        {/* Main Action Input Container */}
        <div ref={searchContainerRef} className="w-full max-w-3xl mx-auto mt-8 px-4 sm:px-0 relative z-50">
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
                      relative w-full z-50 mt-3 overflow-y-auto max-h-96 rounded-3xl
                      border border-slate-200 dark:border-slate-700/60 ${darkTheme.card}
                      text-left shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10
                    `}
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
          </div>
          {/* CTA Group Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl px-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={scrollToCard}
              className={`relative w-full sm:w-auto min-w-[200px] px-6 py-3 rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 flex items-center justify-center ${darkTheme.buttonPrimary}`}
            >
              <Sparkles className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Explore Events
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/create-event")}
              className={`relative w-full sm:w-auto min-w-[200px] px-6 py-3 rounded-2xl text-sm sm:text-base font-medium transition-all duration-300 flex items-center justify-center ${darkTheme.buttonSecondary}`}
            >
              <Users className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Host an Event
            </motion.button>
          </div>
        </div>
      </section>
      <section className="border-y border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950 py-5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1`}>
              Popular:
            </span>
            {["AI", "Blockchain", "Web", "DevOps", "React", "UX", "Development"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => selectSearchQuery(tag)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl cursor-pointer transition-all ${darkTheme.card} ${darkTheme.textSecondary} border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400`}
              >
                {tag}
              </button>
            ))}
          </div>
          <span className={`text-xs sm:text-sm font-bold whitespace-nowrap px-3 py-1.5 rounded-xl bg-blue-50/60 dark:bg-slate-900 ${darkTheme.textSecondary}`}>
            {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
          </span>
        </div>
      </section>

      {searchQuery.trim() === "" && (
        <section ref={statsRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
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
                  transition: { duration: 0.2 }
                }}
                className={`${darkTheme.card} rounded-3xl shadow-lg p-4 sm:p-6 flex flex-col items-center text-center border border-slate-100 dark:border-slate-900 transition-all duration-200`}
              >
                <div className="mb-3 sm:mb-4 flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700/50">
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${darkTheme.textSecondary}`} />
                </div>
                <p className={`text-xl sm:text-2xl md:text-3xl font-bold tracking-tight ${darkTheme.textPrimary}`}>
                  <StatCounter stat={stat} shouldAnimate={hasMounted && isStatsInView} />
                </p>
                <p className={`mt-1 text-xs sm:text-sm font-medium ${darkTheme.textSecondary}`}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default memo(EventHero);
