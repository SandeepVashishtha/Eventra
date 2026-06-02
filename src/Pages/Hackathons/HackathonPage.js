import { Code2, RefreshCw, Compass, ChevronDown, X } from "lucide-react";
import TeamMatchmaking from "./components/TeamMatchmaking";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
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
import SectionErrorBoundary from "../../components/common/SectionErrorBoundary";

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
      onClick={() => onRemove(tag)}
      className="hover:bg-primary/30 rounded-full p-0.5 transition-colors"
    >
      <X className="w-3 h-3" />
    </button>
  </motion.div>
);

// 🔥 FIX: Extracted CustomDropdown OUTSIDE of HackathonHub. 
// This prevents React from unmounting and destroying the dropdown's local state 
// on every parent re-render (e.g., when scrolling or typing).
const CustomDropdown = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
}) => {
  const [open, setOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0, width: 0 });

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const toggleOpen = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setOpen((prev) => !prev);
  };

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

  const displayText = value || placeholder;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      <button
        type="button"
        ref={buttonRef}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 border border-border rounded-xl bg-white dark:bg-white/5 cursor-pointer hover:ring-2 hover:ring-primary/30 dark:hover:ring-primary/50 hover:border-primary/55 dark:hover:border-primary/30 transition-all text-text-light"
        onClick={toggleOpen}
      >
        <span
          className={`flex-1 text-left text-sm leading-tight whitespace-nowrap overflow-hidden text-ellipsis ${!value ? "text-slate-400 dark:text-slate-500" : "text-text"}`}
        >
          {displayText}
        </span>

        <ChevronDown className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
      </button>

      {open &&
        createPortal(
          <ul
            ref={dropdownRef}
            className="
              z-[10000]
              bg-card-bg
              border border-border
              rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)]
              overflow-hidden
              min-w-[180px]
            "
            style={{
              position: "absolute",
              top: menuCoords.top,
              left: menuCoords.left,
              width: menuCoords.width,
            }}
          >
            <li
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-primary/10 text-text-light text-sm transition-colors"
            >
              {placeholder}
            </li>

            {options.map((opt) => (
              <li
                key={opt}
                className={`px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-primary/10 text-text-light text-sm transition-colors ${opt === value
                  ? "font-semibold bg-primary/10 text-primary"
                  : ""
                  }`}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
};

const HackathonHub = () => {
  const prefersReducedMotion = useReducedMotion();
  const [hackathons, setHackathons] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrollVisible, setIsScrollVisible] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: "",
    prize: "",
    location: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useDocumentTitle("Eventra | Hackathons");

  // NEW: State for selected tags
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  const cardsSectionRef = useRef(null);
  const searchInputRef = useRef(null);

  const scrollToCards = () => {
    cardsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Fetch hackathons and wire page listeners
  useEffect(() => {
    let isMounted = true;
    
    const loadHackathons = async () => {
      setIsLoading(true);
      const data = await fetchHackathons();
      if (isMounted) {
        setHackathons(data);
        const tags = [
          ...new Set(
            data.flatMap((hackathon) => hackathon.techStack || []),
          ),
        ];
        setAvailableTags(tags);
        setIsLoading(false);
      }
    };
    
    loadHackathons();

    const handleScroll = () => {
      setIsScrollVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    const handleChatbotState = () => {
      setIsChatbotOpen(document.querySelector('[data-chatbot-open]') !== null);
    };

    handleChatbotState();
    const observer = new MutationObserver(handleChatbotState);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      isMounted = false;
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

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

  // NEW: Handle tag selection
  const handleTagSelect = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // NEW: Handle tag removal
  const handleTagRemove = (tagToRemove) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  // NEW: Handle backspace in search input
  const handleSearchKeyDown = (e) => {
    if (e.key === "Backspace" && searchQuery === "" && selectedTags.length > 0) {
      // Remove the last tag when backspace is pressed on empty input
      const lastTag = selectedTags[selectedTags.length - 1];
      handleTagRemove(lastTag);
    }
  };

  const fuse = useMemo(() => new Fuse(hackathons, {
    keys: ["title", "description", "location", "techStack"],
    threshold: 0.4,
  }), [hackathons]);

  const searchedHackathons = debouncedSearchQuery
    ? fuse.search(debouncedSearchQuery.trim()).map((result) => result.item)
    : hackathons;

  const filteredHackathons = filterHackathons(searchedHackathons, {
    activeTab,
    filters,
    selectedTags,
  });

  const featuredHackathons = [...hackathons]
    .filter((h) => h.featured)
    .slice(0, 3);

  // UPDATED: Reset filters and tags
  const resetFilters = () => {
    setFilters({
      difficulty: "",
      prize: "",
      location: "",
    });
    setSearchQuery("");
    setSelectedTags([]);
  };

  // Get unique values for filters
  const difficulties = [...new Set(hackathons.map((h) => h.difficulty))];
  const locations = [...new Set(hackathons.map((h) => h.location))];

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);
  
  return (
    <div className="overflow-x-hidden bg-bg text-text py-6 transition-colors duration-300">
      {/* Floating Action Button */}
      <motion.div
        className={`fixed z-50  ${positionClass}`}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to="/host-hackathon"
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-secondary text-white rounded-xl shadow-glow-md hover:shadow-glow-lg border border-primary/30 transition-all"
          title="Host a Hackathon"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </Link>
      </motion.div>

      {/* FIXED: Hero Section with filteredCount prop */}
      <HackathonHero
        hackathons={hackathons}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        scrollToCards={scrollToCards}
        // ADD THIS LINE - THE FIX:
        filteredCount={filteredHackathons.length}
        // NEW: Pass tag-related props
        selectedTags={selectedTags}
        onTagRemove={handleTagRemove}
        onSearchKeyDown={handleSearchKeyDown}
        searchInputRef={searchInputRef}
        availableTags={availableTags}
        onTagSelect={handleTagSelect}
      />

      <motion.div
        ref={cardsSectionRef}
        key={activeTab}
        className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.3 },
          },
        }}
        initial="hidden"
        animate="show"
        exit={{ opacity: 0 }}
      >
        {hackathons.map((hackathon) => (
          <div key={hackathon.id}>
            {/* HackathonCard component unchanged */}
          </div>
        ))}
      </motion.div>

{/* TEAM MATCHMAKING SECTION */}
<TeamMatchmaking />

      {/* Featured Hackathons */}
      {!isLoading && featuredHackathons.length > 0 && (
        <div
          className="py-10 border-b border-border"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Handpicked for you</p>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Featured{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Hackathons</span>
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
                  key={index}
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
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Browse all</p>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                All{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Hackathons</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  showFilters
                    ? "bg-primary text-white border-primary shadow-glow-sm"
                    : "bg-white dark:bg-white/5 text-text-light border-border hover:bg-slate-50 dark:hover:bg-white/10 hover:border-primary/50 shadow-sm dark:shadow-none"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                {showFilters ? "Hide Filters" : "Filters"}
              </button>
              {(filters.difficulty || filters.prize || filters.location ||
                selectedTags.length > 0) && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-primary hover:opacity-90 font-semibold border border-primary/20 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all"
                    aria-label="Clear hackathon filters"
                  >
                    Clear filters
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
                className="
                relative overflow-hidden mb-6
                rounded-2xl
                border border-border
                bg-card-bg/90
                backdrop-blur-xl
                shadow-lg dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]
                p-6 md:p-8
                "
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <CustomDropdown
                    label="Difficulty"
                    value={filters.difficulty}
                    options={difficulties}
                    onChange={(val) =>
                      setFilters({ ...filters, difficulty: val })
                    }
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
                    onChange={(val) =>
                      setFilters({ ...filters, location: val })
                    }
                    placeholder="All Locations"
                  />
                </div>

                {/* Available tags for selection */}
                {availableTags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-text-light mb-4">
                      Filter by Technology
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagSelect(tag)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 border ${
                            selectedTags.includes(tag)
                              ? 'bg-primary text-white border-primary shadow-glow-sm'
                              : 'bg-white dark:bg-white/5 text-text-light border-border hover:bg-slate-50 dark:hover:bg-white/10 hover:border-primary/50 hover:text-primary shadow-sm dark:shadow-none'
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
        <SectionErrorBoundary label="Hackathons">
        <AnimatePresence mode="wait">
         {isLoading ? (
  <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(6)].map((_, i) => (
      <HackathonCardSkeleton key={`skeleton-${i}`} />
    ))}
  </div>
) : filteredHackathons.length > 0 ? (
            <motion.div
              key={activeTab}
              className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
            >
              {filteredHackathons.map((hackathon, index) => (
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
                      className="absolute rounded-full bg-primary/20 dark:bg-primary/20"
                      style={{
                        width: size,
                        height: size,
                        left: positions[i].left,
                        top: positions[i].top,
                        opacity: 0.3,
                      }}
                      animate={{
                        y: [0, -30, 0],
                        x: [0, 10, -10, 0],
                        scale: [1, 1.2, 1],
                      }}
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

              <div className="mx-auto max-w-md relative z-10">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex justify-center items-center w-20 h-20 rounded-full bg-bg dark:bg-bg shadow-sm mx-auto border border-border"
                >
                  <Code2 className="h-10 w-10 text-primary" />
                </motion.div>

                <h3 className="mt-6 text-2xl font-bold text-slate-900 dark:text-gray-100">
                  No Hackathons Found
                </h3>

                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                 {debouncedSearchQuery ||
  filters.difficulty ||
  filters.prize ||
  filters.location ||
  selectedTags.length > 0
    ? "No hackathons match your current filters. Try adjusting your search or filters."
    : "Check back later for exciting new hackathons!"}
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetFilters}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg text-white bg-primary hover:opacity-90 shadow-lg transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Filters
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {}}
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
        </SectionErrorBoundary>
      </div>
      <HackathonCTA></HackathonCTA>
      <BackToTopButton positionClass={positionClass} />
    </div>
  );
};

export default HackathonHub;
