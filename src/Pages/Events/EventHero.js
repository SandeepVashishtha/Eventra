import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Calendar,
  Clock,
  Code2,
  Sparkles,
  TrendingUp,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModernSearchInput from "../../components/common/ModernSearchInput";
import CountUp from "react-countup";

const SEARCH_HISTORY_KEY = "eventra.events.searchHistory";
const TRENDING_SEARCHES = [
  "Workshop",
  "Hackathon",
  "Open Source",
  "Conference",
  "AI",
  "Web Development",
];

const getStoredSearchHistory = () => {
  try {
    const storedHistory = JSON.parse(
      localStorage.getItem(SEARCH_HISTORY_KEY) || "[]",
    );
    return Array.isArray(storedHistory) ? storedHistory.slice(0, 5) : [];
  } catch {
    return [];
  }
};

export default function EventHero({
  searchQuery,
  handleSearch,
  filteredEvents,
  scrollToCard,
}) {
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    setSearchHistory(getStoredSearchHistory());
  }, []);

  const persistSearchHistory = (nextHistory) => {
    setSearchHistory(nextHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(nextHistory));
  };

  const saveSearchQuery = (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const nextHistory = [
      trimmedQuery,
      ...searchHistory.filter(
        (item) => item.toLowerCase() !== trimmedQuery.toLowerCase(),
      ),
    ].slice(0, 5);

    persistSearchHistory(nextHistory);
  };

  const selectSearchQuery = (query) => {
    handleSearch(query);
    saveSearchQuery(query);
  };

  const clearSearchHistory = () => {
    persistSearchHistory([]);
  };

  const handleSearchBlur = () => {
    saveSearchQuery(searchQuery);
    window.setTimeout(() => setIsSearchFocused(false), 120);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      saveSearchQuery(searchQuery);
      scrollToCard();
    }
  };

  const showSearchDropdown = isSearchFocused;

  return (
    <div className="relative bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white dark:bg-slate-950 text-slate-900 dark:text-gray-100 py-16 sm:py-20 md:py-24 border-b border-gray-200 dark:border-slate-900" style={{
    backgroundImage: "url('/assets/eventbg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    width:"100vw"
  }}>
      <div className="relative px-4 flex flex-col items-center justify-center text-center z-10">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight px-4 sm:px-0 text-gray-900 dark:text-white"
          style={{ fontFamily: '"Big Shoulders Display", sans-seri' }}
        >
          Discover{" "}
          <span className="text-blue-600 dark:text-blue-500">Events</span>
        </h1>

        <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-500 dark:text-white max-w-2xl mx-auto px-4 sm:px-0">
          Discover exciting events, compete with talented participants, learn
          new skills, and{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            win rewards
          </span>
          .
        </p>

        <div className="w-full max-w-3xl mx-auto mt-8 sm:mt-12 px-4 sm:px-0">
          <ModernSearchInput
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={handleSearchBlur}
            onKeyDown={handleSearchKeyDown}
            autoFocus
            placeholder="Search events by name, location, or tags..."
          >
            <AnimatePresence>
              {showSearchDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  onMouseDown={(event) => event.preventDefault()}
                  className="absolute left-0 right-0 top-full z-30 mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white/95 text-left shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95"
                >
                  {searchHistory.length > 0 && (
                    <div className="border-b border-gray-100 p-4 dark:border-slate-800">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          <Clock className="h-3.5 w-3.5" />
                          Recent searches
                        </p>
                        <button
                          type="button"
                          onClick={clearSearchHistory}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
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
                            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-200"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Trending
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_SEARCHES.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => selectSearchQuery(tag)}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-200 dark:hover:bg-blue-900/60"
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

          <div className="mt-4 flex items-center justify-between flex-wrap gap-2 sm:gap-3 px-2">
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {[
                "AI",
                "Blockchain",
                "Web",
                "DevOps",
                "React",
                "UX",
                "Development",
              ].map((tag) => (
                <span
                  key={tag}
                  onClick={() => selectSearchQuery(tag)}
                  className="px-2 sm:px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold whitespace-nowrap">
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "event" : "events"} found
            </span>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 flex justify-center gap-3 sm:gap-5 flex-wrap px-4 sm:px-0">
          <button
            className="relative px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-lg text-sm sm:text-base font-semibold text-white shadow-sm overflow-hidden group bg-blue-600 hover:bg-blue-700 transition-all duration-200"
            onClick={scrollToCard}
          >
            <span className="relative flex items-center">
              <Sparkles className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Explore Events
            </span>
          </button>

          <button
            onClick={() => navigate("/create-event")}
            className="relative px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-lg text-sm sm:text-base font-medium text-slate-700 dark:text-gray-300 shadow-sm border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <span className="relative flex items-center">
              <Users className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Host an Event
            </span>
          </button>
        </div>
      </div>

      {searchQuery.trim() === "" && (
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16 md:mt-20 mb-8 sm:mb-12 md:mb-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {[
            {
              label: "Events Hosted",
              value: 120,
              suffix: "+",
              icon: Calendar,
            },
            {
              label: "Active Participants",
              value: 50,
              suffix: "k+",
              icon: Users,
            },
            {
              label: "Projects Created",
              value: 8,
              suffix: "k+",
              icon: Code2,
            },
            {
              label: "Total Prizes",
              value: 1,
              prefix: "$",
              suffix: "M+",
              icon: Award,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-4 sm:p-6 flex flex-col items-center text-center transition-all duration-200"
            >
              <div className="mb-3 sm:mb-4 flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-400" />
              </div>

              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                <CountUp
                  start={0}
                  end={stat.value}
                  duration={2.5}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  enableScrollSpy
                  scrollSpyOnce
                />
              </p>
              <p className="mt-1 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}