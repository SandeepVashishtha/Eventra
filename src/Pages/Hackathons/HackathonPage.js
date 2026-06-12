import { Code2, RefreshCw, Compass, ChevronDown, X } from "lucide-react";
import TeamMatchmaking from "./components/TeamMatchmaking";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { fetchHackathons } from "../../services/hackathonService";
import HackathonHero from "./HackathonHero";
import HackathonCard from "./HackathonCard";
import HackathonCTA from "./HackathonCTA";
import Fuse from "fuse.js";
import { createPortal } from "react-dom";
import BackToTopButton from "../../components/common/BackToTopButton";
import VirtualizedHackathonGrid from "../../components/common/VirtualizedHackathonGrid";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { filterHackathons } from "./hackathonFilterUtils.mjs";
import { HackathonCardSkeleton } from "../../components/common/SkeletonLoaders";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import useDebounce from "../../hooks/useDebounce";
import ErrorBoundary from "../../components/common/ErrorBoundary";
import { safeJsonParse } from "../../utils/safeJsonParse";

// NEW: Tag component for selected tags in search bar
const Tag = ({ tag, onRemove }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm"
  >
    <span>{tag}</span>
    <button
      type="button"
      onClick={() => onRemove(tag)}
      className="hover:bg-primary/30 rounded-full p-0.5 transition-colors"
      aria-label={`Remove tag ${tag}`}
    >
      <X className="h-3 w-3" />
    </button>
  </motion.div>
);

// 🔥 FIX & ENHANCEMENT: Professional CustomDropdown with Smart Positioning & A11y
const CustomDropdown = ({ label, value, options, onChange, placeholder = "Select" }) => {
  const [open, setOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0, width: 0, showAbove: false });

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  // Safe ID generation compatible with all React versions
  const dropdownId = useRef(`dropdown-${Math.random().toString(36).substr(2, 9)}`).current;

  // Support both string arrays and object arrays { value, label }
  const getOptionValue = (opt) => (typeof opt === "object" && opt !== null ? opt.value : opt);
  const getOptionLabel = (opt) => (typeof opt === "object" && opt !== null ? opt.label : opt);

  const toggleOpen = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Smart positioning: Open above if not enough space below
      const showAbove = spaceBelow < 250 && spaceAbove > spaceBelow;

      setMenuCoords({
        top: showAbove ? rect.top - 8 : rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 180),
        showAbove,
      });
    }
    setOpen((prev) => !prev);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on scroll or resize to prevent misalignment
  useEffect(() => {
    if (!open) return;
    const handleClose = () => setOpen(false);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => {
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [open]);

  // Keyboard accessibility (Escape to close)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const selectedOption = options.find((o) => getOptionValue(o) === value);
  const displayText = selectedOption ? getOptionLabel(selectedOption) : placeholder;

  return (
    <div className="relative">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <button
        type="button"
        ref={buttonRef}
        className="border-border hover:ring-primary/30 dark:hover:ring-primary/50 hover:border-primary/55 dark:hover:border-primary/30 text-text-light flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 transition-all hover:ring-2 dark:bg-white/5"
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? dropdownId : undefined}
      >
        <span
          className={`flex-1 overflow-hidden text-left text-sm leading-tight text-ellipsis whitespace-nowrap ${!value ? "text-slate-400 dark:text-slate-500" : "text-text"}`}
        >
          {displayText}
        </span>
        <ChevronDown
          className={`flex-shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-500 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        createPortal(
          <ul
            ref={dropdownRef}
            id={dropdownId}
            role="listbox"
            aria-label={label}
            className="bg-card-bg border-border max-h-60 min-w-[180px] overflow-hidden overflow-y-auto rounded-xl border shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            style={{
              position: "fixed",
              top: menuCoords.showAbove ? "auto" : `${menuCoords.top}px`,
              bottom: menuCoords.showAbove ? `${window.innerHeight - menuCoords.top}px` : "auto",
              left: `${menuCoords.left}px`,
              width: `${menuCoords.width}px`,
              zIndex: 10000,
            }}
          >
            <li
              role="option"
              aria-selected={!value}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="dark:hover:bg-primary/10 text-text-light cursor-pointer px-4 py-3 text-sm transition-colors hover:bg-slate-50"
            >
              {placeholder}
            </li>

            {options.map((opt) => {
              const optValue = getOptionValue(opt);
              const optLabel = getOptionLabel(opt);
              return (
                <li
                  key={optValue}
                  role="option"
                  aria-selected={optValue === value}
                  className={`dark:hover:bg-primary/10 text-text-light cursor-pointer px-4 py-3 text-sm transition-colors hover:bg-slate-50 ${
                    optValue === value ? "bg-primary/10 text-primary font-semibold" : ""
                  }`}
                  onClick={() => {
                    onChange(optValue);
                    setOpen(false);
                  }}
                >
                  {optLabel}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </div>
  );
};

const HACKATHON_FILTER_STORAGE_KEY = "eventra:hackathon-filters:v1";

const HackathonHub = () => {
  const prefersReducedMotion = useReducedMotion();
  const [hackathons, setHackathons] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrollVisible, setIsScrollVisible] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: "",
    prize: "",
    location: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // NEW: Sort state
  const [sortBy, setSortBy] = useState("default");

  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const hasHydratedFilters = useRef(false);

  // FIX: Prevent state updates on unmounted component
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useDocumentTitle("Eventra | Hackathons");

  // Initialize state from URL params, falling back to persisted filters
  useEffect(() => {
    if (hasHydratedFilters.current) return;

    let savedFilters = {};
    try {
      savedFilters = safeJsonParse(
        window.sessionStorage.getItem(HACKATHON_FILTER_STORAGE_KEY) || "{}"
      );
    } catch {
      savedFilters = {};
    }

    const tab = searchParams.get("tab") || savedFilters.activeTab || "all";
    const search = searchParams.get("search") || savedFilters.searchQuery || "";
    const difficulty = searchParams.get("difficulty") || savedFilters.filters?.difficulty || "";
    const prize = searchParams.get("prize") || savedFilters.filters?.prize || "";
    const locationVal = searchParams.get("location") || savedFilters.filters?.location || "";
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam ? tagsParam.split(",") : savedFilters.selectedTags || [];
    const sort = searchParams.get("sort") || savedFilters.sortBy || "default";

    setActiveTab(tab);
    setSearchQuery(search);
    setFilters({ difficulty, prize, location: locationVal });
    setSelectedTags(tags);
    setSortBy(sort);

    hasHydratedFilters.current = true;
    setFiltersHydrated(true);
  }, [searchParams]);

  // Sync state back to sessionStorage and URL query params
  useEffect(() => {
    if (!filtersHydrated) return;

    const params = {};
    if (activeTab !== "all") params.tab = activeTab;
    if (debouncedSearchQuery) params.search = debouncedSearchQuery;
    if (filters.difficulty) params.difficulty = filters.difficulty;
    if (filters.prize) params.prize = filters.prize;
    if (filters.location) params.location = filters.location;
    if (selectedTags.length > 0) params.tags = selectedTags.join(",");
    if (sortBy && sortBy !== "default") params.sort = sortBy;

    setSearchParams(params, { replace: true });

    try {
      window.sessionStorage.setItem(
        HACKATHON_FILTER_STORAGE_KEY,
        JSON.stringify({
          activeTab,
          searchQuery: debouncedSearchQuery,
          filters,
          selectedTags,
          sortBy,
        })
      );
    } catch {
      // Ignored
    }
  }, [
    activeTab,
    debouncedSearchQuery,
    filters,
    selectedTags,
    sortBy,
    filtersHydrated,
    setSearchParams,
  ]);

  const cardsSectionRef = useRef(null);
  const searchInputRef = useRef(null);

  const scrollToCards = () => {
    cardsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const loadHackathons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHackathons();
      if (isMountedRef.current) {
        setHackathons(data);
        const tags = [...new Set(data.flatMap((hackathon) => hackathon.techStack || []))];
        setAvailableTags(tags);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || "Failed to load hackathons");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Fetch hackathons and wire page listeners
  useEffect(() => {
    loadHackathons();

    const handleScroll = () => {
      setIsScrollVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    const handleChatbotState = () => {
      setIsChatbotOpen(document.querySelector("[data-chatbot-open]") !== null);
    };

    handleChatbotState();
    const observer = new MutationObserver(handleChatbotState);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [loadHackathons]);

  const positionClass = `
    ${isScrollVisible ? "bottom-[calc(2.5rem+var(--safe-area-bottom))] sm:bottom-40" : "bottom-[calc(1rem+var(--safe-area-bottom))] sm:bottom-24"}
    ${isChatbotOpen ? "left-[calc(1rem+var(--safe-area-left))] sm:left-6" : "right-[calc(1rem+var(--safe-area-right))] sm:right-6"}
  `;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const handleTagSelect = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Backspace" && searchQuery === "" && selectedTags.length > 0) {
      const lastTag = selectedTags[selectedTags.length - 1];
      handleTagRemove(lastTag);
    }
  };

  const fuse = useMemo(
    () =>
      new Fuse(hackathons, {
        keys: ["title", "description", "location", "techStack"],
        threshold: 0.4,
      }),
    [hackathons]
  );

  // 🚀 PERFORMANCE: Memoized computations
  const searchedHackathons = useMemo(() => {
    if (!debouncedSearchQuery) return hackathons;
    return fuse.search(debouncedSearchQuery.trim()).map((result) => result.item);
  }, [debouncedSearchQuery, hackathons, fuse]);

  const filteredHackathons = useMemo(() => {
    return filterHackathons(searchedHackathons, {
      activeTab,
      filters,
      selectedTags,
    });
  }, [searchedHackathons, activeTab, filters, selectedTags]);

  // NEW: Sorting logic
  const sortedHackathons = useMemo(() => {
    const sorted = [...filteredHackathons];
    if (sortBy === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.startDate || b.date || b.createdAt || 0) -
          new Date(a.startDate || a.date || a.createdAt || 0)
      );
    } else if (sortBy === "oldest") {
      sorted.sort(
        (a, b) =>
          new Date(a.startDate || a.date || a.createdAt || 0) -
          new Date(b.startDate || b.date || b.createdAt || 0)
      );
    } else if (sortBy === "prize_desc") {
      sorted.sort((a, b) => {
        const prizeA = typeof a.prizePool === "number" ? a.prizePool : a.prize || 0;
        const prizeB = typeof b.prizePool === "number" ? b.prizePool : b.prize || 0;
        return prizeB - prizeA;
      });
    }
    return sorted;
  }, [filteredHackathons, sortBy]);

  const featuredHackathons = useMemo(
    () => [...hackathons].filter((h) => h.featured).slice(0, 3),
    [hackathons]
  );
  const difficulties = useMemo(
    () => [...new Set(hackathons.map((h) => h.difficulty).filter(Boolean))],
    [hackathons]
  );
  const locations = useMemo(
    () => [...new Set(hackathons.map((h) => h.location).filter(Boolean))],
    [hackathons]
  );

  const resetFilters = () => {
    setFilters({ difficulty: "", prize: "", location: "" });
    setSearchQuery("");
    setSelectedTags([]);
    setSortBy("default");
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-bg text-text overflow-x-hidden py-6 transition-colors duration-300">
      {/* Floating Action Button */}
      <motion.div
        className={`fixed z-50 ${positionClass}`}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to="/host-hackathon"
          className="from-primary to-secondary shadow-glow-md hover:shadow-glow-lg border-primary/30 flex h-14 w-14 items-center justify-center rounded-xl border bg-gradient-to-br text-white transition-all"
          title="Host a Hackathon"
          aria-label="Host a Hackathon"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </Link>
      </motion.div>

      <HackathonHero
        hackathons={hackathons}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        scrollToCards={scrollToCards}
        filteredCount={sortedHackathons.length}
        selectedTags={selectedTags}
        onTagRemove={handleTagRemove}
        onSearchKeyDown={handleSearchKeyDown}
        searchInputRef={searchInputRef}
        availableTags={availableTags}
        onTagSelect={handleTagSelect}
      />

      {/* TEAM MATCHMAKING SECTION */}
      <TeamMatchmaking />

      {/* Featured Hackathons */}
      {!isLoading && featuredHackathons.length > 0 && (
        <div className="border-border border-b py-10" data-aos="fade-up" data-aos-duration="1000">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-primary mb-1 text-xs font-semibold tracking-widest uppercase">
                  Handpicked for you
                </p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Featured{" "}
                  <span className="from-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">
                    Hackathons
                  </span>
                </h2>
              </div>
              <Link
                to="/hackathons?filter=featured"
                className="text-primary text-sm font-medium transition-colors hover:opacity-80"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredHackathons.map((hackathon, index) => (
                <HackathonCard
                  key={hackathon.id || index}
                  hackathon={hackathon}
                  isFeatured={hackathon.featured}
                  data-aos="zoom-in"
                  data-aos-delay={index * 150}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hackathons Section */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Section header + Filters toggle */}
        <div className="mb-8" data-aos="fade-up" data-aos-delay="200">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-primary mb-1 text-xs font-semibold tracking-widest uppercase">
                Browse all
              </p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                All{" "}
                <span className="from-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">
                  Hackathons
                </span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* NEW: Sort Dropdown */}
              <div className="w-36">
                <CustomDropdown
                  label="Sort By"
                  value={sortBy}
                  options={[
                    { value: "default", label: "Default" },
                    { value: "newest", label: "Newest First" },
                    { value: "oldest", label: "Oldest First" },
                    { value: "prize_desc", label: "Highest Prize" },
                  ]}
                  onChange={setSortBy}
                  placeholder="Sort"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                  showFilters
                    ? "bg-primary border-primary shadow-glow-sm text-white"
                    : "text-text-light border-border hover:border-primary/50 bg-white shadow-sm hover:bg-slate-50 dark:bg-white/5 dark:shadow-none dark:hover:bg-white/10"
                }`}
                aria-expanded={showFilters}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                {showFilters ? "Hide Filters" : "Filters"}
              </button>

              {(filters.difficulty ||
                filters.prize ||
                filters.location ||
                selectedTags.length > 0 ||
                sortBy !== "default") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-primary border-primary/20 bg-primary/10 hover:bg-primary/20 rounded-xl border px-3 py-2 text-xs font-semibold transition-all hover:opacity-90"
                  aria-label="Clear hackathon filters"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Selected tags display */}
          {selectedTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex flex-wrap items-center gap-2"
            >
              <span className="mr-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Active tags:
              </span>
              <AnimatePresence>
                {selectedTags.map((tag) => (
                  <Tag key={tag} tag={tag} onRemove={handleTagRemove} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" }}
                className="border-border bg-card-bg/90 relative mb-6 overflow-hidden rounded-2xl border p-6 shadow-lg backdrop-blur-xl md:p-8 dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <CustomDropdown
                    label="Difficulty"
                    value={filters.difficulty}
                    options={difficulties}
                    onChange={(val) => setFilters({ ...filters, difficulty: val })}
                    placeholder="All Levels"
                  />
                  <CustomDropdown
                    label="Prize Pool"
                    value={filters.prize}
                    options={["Under $1,000", "$1,000 - $5,000", "$5,000+"]}
                    onChange={(val) => setFilters({ ...filters, prize: val })}
                    placeholder="Any Prize"
                  />
                  <CustomDropdown
                    label="Location"
                    value={filters.location}
                    options={locations}
                    onChange={(val) => setFilters({ ...filters, location: val })}
                    placeholder="All Locations"
                  />
                </div>

                {availableTags.length > 0 && (
                  <div className="border-border mt-8 border-t pt-6">
                    <label className="text-text-light mb-4 block text-xs font-semibold tracking-widest uppercase">
                      Filter by Technology
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagSelect(tag)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                            selectedTags.includes(tag)
                              ? "bg-primary border-primary shadow-glow-sm text-white"
                              : "text-text-light border-border hover:border-primary/50 hover:text-primary bg-white shadow-sm hover:bg-slate-50 dark:bg-white/5 dark:shadow-none dark:hover:bg-white/10"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs */}
        <motion.div
          className="mb-8 flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0"
          variants={item}
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "All Hackathons" },
              { key: "live", label: "🔴 Live Now" },
              { key: "upcoming", label: "Upcoming" },
              { key: "completed", label: "Completed" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.key
                    ? "from-primary via-primary to-secondary border-primary/50 shadow-glow-sm scale-105 bg-gradient-to-r text-white"
                    : "text-text-light border-border hover:border-primary/30 hover:text-primary bg-white shadow-sm hover:bg-slate-50 dark:bg-white/5 dark:shadow-none dark:hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Hackathons Grid */}
        <ErrorBoundary level="section" label="Hackathons">
          <AnimatePresence mode="wait">
            {error ? (
              <div className="col-span-full py-16 text-center">
                <p className="mb-2 text-lg font-semibold text-red-500">Failed to load hackathons</p>
                <p className="mb-4 text-sm text-gray-400">{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    loadHackathons();
                  }}
                  className="bg-primary hover:bg-primary-dark rounded-lg px-4 py-2 text-white transition"
                >
                  Retry
                </button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <HackathonCardSkeleton key={`skeleton-${i}`} />
                ))}
              </div>
            ) : sortedHackathons.length > 0 ? (
              <motion.div
                ref={cardsSectionRef} // FIX: Moved ref to the actual grid
                key={activeTab + sortBy} // Re-animate on sort change
                className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
              >
                {sortedHackathons.map((hackathon, index) => (
                  <HackathonCard
                    key={hackathon.id}
                    hackathon={hackathon}
                    data-aos="flip-up"
                    data-aos-delay={index * 100}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="border-border bg-card-bg relative overflow-hidden rounded-3xl border p-10 text-center shadow-md dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)]"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: "easeOut" }}
              >
                <motion.div
                  className="bg-primary/10 dark:bg-primary/5 absolute inset-0 -z-10 blur-3xl"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <div className="absolute inset-0 z-0 overflow-hidden">
                  {[...Array(6)].map((_, i) => {
                    const positions = [
                      { left: "10%", top: "20%" },
                      { left: "70%", top: "15%" },
                      { left: "30%", top: "70%" },
                      { left: "80%", top: "60%" },
                      { left: "50%", top: "40%" },
                      { left: "20%", top: "50%" },
                    ];
                    const size = 30 + Math.random() * 40;
                    return (
                      <motion.div
                        key={i}
                        className="bg-primary/20 dark:bg-primary/20 absolute rounded-full"
                        style={{
                          width: size,
                          height: size,
                          left: positions[i].left,
                          top: positions[i].top,
                          opacity: 0.3,
                        }}
                        animate={{ y: [0, -30, 0], x: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                        transition={{
                          duration: prefersReducedMotion ? 0 : 6 + i,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.5,
                        }}
                      />
                    );
                  })}
                </div>

                <div className="relative z-10 mx-auto max-w-md">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="bg-bg dark:bg-bg border-border mx-auto flex h-20 w-20 items-center justify-center rounded-full border shadow-sm"
                  >
                    <Code2 className="text-primary h-10 w-10" />
                  </motion.div>

                  <h3 className="mt-6 text-2xl font-bold text-slate-900 dark:text-gray-100">
                    No Hackathons Found
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {debouncedSearchQuery ||
                    filters.difficulty ||
                    filters.prize ||
                    filters.location ||
                    selectedTags.length > 0
                      ? "No hackathons match your current filters. Try adjusting your search or filters."
                      : "Check back later for exciting new hackathons!"}
                  </p>

                  <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetFilters}
                      className="bg-primary flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:opacity-90"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset Filters
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={scrollToCards}
                      className="bg-bg hover:bg-card-bg flex items-center justify-center gap-2 rounded-lg border border-black/15 px-6 py-2.5 text-sm font-medium text-black shadow-md transition-all dark:border-gray-600 dark:text-white"
                    >
                      Explore Hackathons
                      <Compass className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ErrorBoundary>
      </div>

      <HackathonCTA />
      <BackToTopButton positionClass={positionClass} />
    </div>
  );
};

export default HackathonHub;
