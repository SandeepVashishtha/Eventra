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
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { filterHackathons } from "./hackathonFilterUtils.mjs";
import { HackathonCardSkeleton } from "../../components/common/SkeletonLoaders";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import useDebounce from "../../hooks/useDebounce";
import ErrorBoundary from "../../components/common/ErrorBoundary";

// NEW: Tag component for selected tags in search bar
const Tag = ({ tag, onRemove }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    className="flex items-center gap-1.5 bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/30 backdrop-blur-sm"
  >
    <span>{tag}</span>
    <button
      type="button"
      onClick={() => onRemove(tag)}
      className="hover:bg-primary/30 rounded-full p-0.5 transition-colors"
      aria-label={`Remove tag ${tag}`}
    >
      <X className="w-3 h-3" />
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        ref={buttonRef}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 border border-border rounded-xl bg-white dark:bg-white/5 cursor-pointer hover:ring-2 hover:ring-primary/30 dark:hover:ring-primary/50 hover:border-primary/55 dark:hover:border-primary/30 transition-all text-text-light"
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? dropdownId : undefined}
      >
        <span
          className={`flex-1 text-left text-sm leading-tight whitespace-nowrap overflow-hidden text-ellipsis ${!value ? "text-slate-400 dark:text-slate-500" : "text-text"}`}
        >
          {displayText}
        </span>
        <ChevronDown className={`text-slate-400 dark:text-slate-500 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        createPortal(
          <ul
            ref={dropdownRef}
            id={dropdownId}
            role="listbox"
            aria-label={label}
            className="
              bg-card-bg
              border border-border
              rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)]
              overflow-hidden
              min-w-[180px]
              max-h-60
              overflow-y-auto
            "
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
              className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-primary/10 text-text-light text-sm transition-colors"
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
                  className={`px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-primary/10 text-text-light text-sm transition-colors ${
                    optValue === value ? "font-semibold bg-primary/10 text-primary" : ""
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
      savedFilters = JSON.parse(
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
  }, [activeTab, debouncedSearchQuery, filters, selectedTags, sortBy, filtersHydrated, setSearchParams]);

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
      sorted.sort((a, b) => new Date(b.startDate || b.date || b.createdAt || 0) - new Date(a.startDate || a.date || a.createdAt || 0));
    } else if (sortBy === "oldest") {
      sorted.sort((a, b) => new Date(a.startDate || a.date || a.createdAt || 0) - new Date(b.startDate || b.date || b.createdAt || 0));
    } else if (sortBy === "prize_desc") {
      sorted.sort((a, b) => {
        const prizeA = typeof a.prizePool === 'number' ? a.prizePool : (a.prize || 0);
        const prizeB = typeof b.prizePool === 'number' ? b.prizePool : (b.prize || 0);
        return prizeB - prizeA;
      });
    }
    return sorted;
  }, [filteredHackathons, sortBy]);

  const featuredHackathons = useMemo(() => [...hackathons].filter((h) => h.featured).slice(0, 3), [hackathons]);
  const difficulties = useMemo(() => [...new Set(hackathons.map((h) => h.difficulty).filter(Boolean))], [hackathons]);
  const locations = useMemo(() => [...new Set(hackathons.map((h) => h.location).filter(Boolean))], [hackathons]);

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
    <div className="overflow-x-hidden bg-bg text-text py-6 transition-colors duration-300">
      {/* Floating Action Button */}
      <motion.div
        className={`fixed z-50 ${positionClass}`}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to="/host-hackathon"
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-secondary text-white rounded-xl shadow-glow-md hover:shadow-glow-lg border border-primary/30 transition-all"
          title="Host a Hackathon"
          aria-label="Host a Hackathon"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
        <div className="py-10 border-b border-border" data-aos="fade-up" data-aos-duration="1000">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                  Handpicked for you
                </p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Featured{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Hackathons
                  </span>
                </h2>
              </div>
              <Link
                to="/hackathons?filter=featured"
                className="text-primary hover:opacity-80 text-sm font-medium transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section header + Filters toggle */}
        <div className="mb-8" data-aos="fade-up" data-aos-delay="200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                Browse all
              </p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                All{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  showFilters
                    ? "bg-primary text-white border-primary shadow-glow-sm"
                    : "bg-white dark:bg-white/5 text-text-light border-border hover:bg-slate-50 dark:hover:bg-white/10 hover:border-primary/50 shadow-sm dark:shadow-none"
                }`}
                aria-expanded={showFilters}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {showFilters ? "Hide Filters" : "Filters"}
              </button>

              {(filters.difficulty || filters.prize || filters.location || selectedTags.length > 0 || sortBy !== "default") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-primary hover:opacity-90 font-semibold border border-primary/20 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all"
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
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">
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
                className="relative overflow-hidden mb-6 rounded-2xl border border-border bg-card-bg/90 backdrop-blur-xl shadow-lg dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-6 md:p-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <div className="mt-8 pt-6 border-t border-border">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-text-light mb-4">
                      Filter by Technology
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagSelect(tag)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 border ${
                            selectedTags.includes(tag)
                              ? "bg-primary text-white border-primary shadow-glow-sm"
                              : "bg-white dark:bg-white/5 text-text-light border-border hover:bg-slate-50 dark:hover:bg-white/10 hover:border-primary/50 hover:text-primary shadow-sm dark:shadow-none"
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
          className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
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
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 border ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-primary via-primary to-secondary text-white border-primary/50 shadow-glow-sm scale-105"
                    : "bg-white dark:bg-white/5 text-text-light border-border hover:bg-slate-50 dark:hover:bg-white/10 hover:border-primary/30 hover:text-primary shadow-sm dark:shadow-none"
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
              <div className="col-span-full text-center py-16">
                <p className="text-red-500 text-lg font-semibold mb-2">Failed to load hackathons</p>
                <p className="text-gray-400 text-sm mb-4">{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    loadHackathons();
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  Retry
                </button>
              </div>
            ) : isLoading ? (
              <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <HackathonCardSkeleton key={`skeleton-${i}`} />
                ))}
              </div>
            ) : sortedHackathons.length > 0 ? (
              <motion.div
                ref={cardsSectionRef} // FIX: Moved ref to the actual grid
                key={activeTab + sortBy} // Re-animate on sort change
                className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
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
                className="relative overflow-hidden rounded-3xl p-10 text-center shadow-md dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)] border border-border bg-card-bg"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 -z-10 bg-primary/10 dark:bg-primary/5 blur-3xl"
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
                      { left: "10%", top: "20%" }, { left: "70%", top: "15%" },
                      { left: "30%", top: "70%" }, { left: "80%", top: "60%" },
                      { left: "50%", top: "40%" }, { left: "20%", top: "50%" },
                    ];
                    const size = 30 + Math.random() * 40;
                    return (
                      <motion.div
                        key={i}
                        className="absolute rounded-full bg-primary/20 dark:bg-primary/20"
                        style={{ width: size, height: size, left: positions[i].left, top: positions[i].top, opacity: 0.3 }}
                        animate={{ y: [0, -30, 0], x: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: prefersReducedMotion ? 0 : 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                      />
                    );
                  })}
                </div>

                <div className="mx-auto max-w-md relative z-10">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: prefersReducedMotion ? 0 : 3, repeat: Infinity, ease: "easeInOut" }}
                    className="flex justify-center items-center w-20 h-20 rounded-full bg-bg dark:bg-bg shadow-sm mx-auto border border-border"
                  >
                    <Code2 className="h-10 w-10 text-primary" />
                  </motion.div>

                  <h3 className="mt-6 text-2xl font-bold text-slate-900 dark:text-gray-100">
                    No Hackathons Found
                  </h3>

                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {debouncedSearchQuery || filters.difficulty || filters.prize || filters.location || selectedTags.length > 0
                      ? "No hackathons match your current filters. Try adjusting your search or filters."
                      : "Check back later for exciting new hackathons!"}
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetFilters}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg text-white bg-primary hover:opacity-90 shadow-lg transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset Filters
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={scrollToCards}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg text-black dark:text-white border border-black/15 dark:border-gray-600 bg-bg hover:bg-card-bg shadow-md transition-all"
                    >
                      Explore Hackathons
                      <Compass className="w-4 h-4" />
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