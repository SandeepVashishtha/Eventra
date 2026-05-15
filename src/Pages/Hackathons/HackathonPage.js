import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import mockHackathons from "./hackathonMockData.json";
import HackathonHero from "./HackathonHero";
import HackathonCard from "./HackathonCard";
import FeedbackButton from "../../components/FeedbackButton";
import {
  FiCode,
  FiRotateCw,
  FiCompass,
  FiChevronDown,
  FiX,
  FiSliders,
} from "react-icons/fi";
import HackathonCTA from "./HackathonCTA";
import Fuse from "fuse.js";
import { createPortal } from "react-dom";
import { HackathonCardSkeleton } from "../../components/common/SkeletonLoaders";

const INITIAL_FILTERS = {
  difficulty: "",
  prize: "",
  location: "",
  mode: "",
  registrationStatus: "",
  teamSize: "",
};

const SORT_OPTIONS = ["Deadline", "Newest", "Popularity", "Prize Amount"];
const PRIZE_OPTIONS = ["Under $1,000", "$1,000 - $5,000", "$5,000+"];
const MODE_OPTIONS = ["Online", "Offline", "Hybrid"];
const REGISTRATION_STATUS_OPTIONS = ["Open", "Closing Soon", "Closed"];
const TEAM_SIZE_OPTIONS = ["Solo", "2-4 Members", "5+ Members"];
const TAB_CONFIG = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
];

const parsePrizeAmount = (prize = "") =>
  Number(prize.replace(/[^0-9]/g, "")) || 0;

const getDateValue = (value) => {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const matchesPrizeFilter = (hackathon, prizeFilter) => {
  if (!prizeFilter) return true;

  const prizeAmount = parsePrizeAmount(hackathon.prize);

  if (prizeFilter === "Under $1,000") {
    return prizeAmount < 1000;
  }

  if (prizeFilter === "$1,000 - $5,000") {
    return prizeAmount >= 1000 && prizeAmount <= 5000;
  }

  if (prizeFilter === "$5,000+") {
    return prizeAmount >= 5000;
  }

  return true;
};

const getHackathonMode = (hackathon) => {
  if (hackathon.mode) return hackathon.mode;

  const normalizedLocation = hackathon.location?.toLowerCase() || "";
  if (
    normalizedLocation.includes("online") ||
    normalizedLocation.includes("virtual")
  ) {
    return "Online";
  }

  return "Offline";
};

const getRegistrationStatus = (hackathon) => {
  if (hackathon.registrationStatus) return hackathon.registrationStatus;
  if (hackathon.status === "completed") return "Closed";
  return "Open";
};

const getTeamSizeCategory = (hackathon) => {
  if (hackathon.teamSize) return hackathon.teamSize;

  const teamRule =
    hackathon.rules?.find((rule) => /team|individual|solo/i.test(rule)) || "";

  if (/individual|solo/i.test(teamRule)) return "Solo";
  if (/5\+|5\s*members|3\s*-\s*5/i.test(teamRule)) return "5+ Members";
  if (/2\s*-\s*4/i.test(teamRule)) return "2-4 Members";

  return "";
};

const getPopularityScore = (hackathon) =>
  hackathon.popularityScore ??
  hackathon.participants + hackathon.teams * 2 + hackathon.submissions * 3;

const sortHackathons = (hackathons, sortBy) => {
  if (!sortBy) return hackathons;

  return [...hackathons].sort((left, right) => {
    if (sortBy === "Deadline") {
      return (
        getDateValue(left.registrationDeadline || left.startDate) -
        getDateValue(right.registrationDeadline || right.startDate)
      );
    }

    if (sortBy === "Newest") {
      return (
        getDateValue(right.createdAt || right.startDate) -
        getDateValue(left.createdAt || left.startDate)
      );
    }

    if (sortBy === "Popularity") {
      return getPopularityScore(right) - getPopularityScore(left);
    }

    if (sortBy === "Prize Amount") {
      return parsePrizeAmount(right.prize) - parsePrizeAmount(left.prize);
    }

    return 0;
  });
};

const matchesSelectedTags = (hackathon, selectedTags) => {
  if (selectedTags.length === 0) return true;
  const hackathonTags = hackathon.techStack || [];
  return selectedTags.some((tag) => hackathonTags.includes(tag));
};

const matchesFilters = (hackathon, filters, selectedTags) => {
  if (filters.difficulty && hackathon.difficulty !== filters.difficulty) {
    return false;
  }

  if (!matchesPrizeFilter(hackathon, filters.prize)) {
    return false;
  }

  if (
    filters.location &&
    !(hackathon.location || "")
      .toLowerCase()
      .includes(filters.location.toLowerCase())
  ) {
    return false;
  }

  if (filters.mode && getHackathonMode(hackathon) !== filters.mode) {
    return false;
  }

  if (
    filters.registrationStatus &&
    getRegistrationStatus(hackathon) !== filters.registrationStatus
  ) {
    return false;
  }

  if (filters.teamSize && getTeamSizeCategory(hackathon) !== filters.teamSize) {
    return false;
  }

  return matchesSelectedTags(hackathon, selectedTags);
};

const getStatusCounts = (hackathons) => {
  const counts = {
    all: hackathons.length,
    live: 0,
    upcoming: 0,
    completed: 0,
  };

  hackathons.forEach((hackathon) => {
    if (counts[hackathon.status] !== undefined) {
      counts[hackathon.status] += 1;
    }
  });

  return counts;
};

const ActiveFilterChip = ({ label, onRemove }) => (
  <motion.div
    initial={{ scale: 0.92, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.92, opacity: 0 }}
    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
  >
    <span>{label}</span>
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${label}`}
      className="rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-200 dark:focus:ring-slate-600"
    >
      <FiX className="h-3 w-3" />
    </button>
  </motion.div>
);

const TechTagButton = ({ tag, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(tag)}
    aria-pressed={isSelected}
    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors ${
      isSelected
        ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
        : "border-slate-200/90 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700"
    }`}
  >
    {tag}
  </button>
);

const CustomDropdown = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Select",
  containerClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const setDropdownPosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setMenuCoords({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  };

  const toggleOpen = () => {
    if (!open) {
      setDropdownPosition();
    }
    setOpen((previous) => !previous);
  };

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const closeOnViewportChange = () => {
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [open]);

  return (
    <div className={`relative ${containerClassName}`}>
      <label className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <button
        type="button"
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200/90 bg-white/95 px-3 py-1.5 text-left text-sm text-slate-800 shadow-sm transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:focus:ring-slate-600"
        onClick={toggleOpen}
      >
        <span className={value ? "text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}>
          {value || placeholder}
        </span>
        <FiChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        createPortal(
          <ul
            ref={dropdownRef}
            role="listbox"
            className="z-[10000] max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
            style={{
              position: "absolute",
              top: menuCoords.top,
              left: menuCoords.left,
              width: menuCoords.width,
            }}
          >
            <li
              role="option"
              aria-selected={!value}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="cursor-pointer rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {placeholder}
            </li>
            {options.map((option) => (
              <li
                key={option}
                role="option"
                aria-selected={option === value}
                className={`cursor-pointer rounded-xl px-3 py-2 text-sm transition-colors ${
                  option === value
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                {option}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
};

const HackathonHub = () => {
  const [hackathons, setHackathons] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isScrollVisible, setIsScrollVisible] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showAllTechTags, setShowAllTechTags] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  const cardsSectionRef = useRef(null);
  const heroSearchInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHackathons(
        mockHackathons.map((hackathon) => ({
          ...hackathon,
          techStack: (hackathon.techStack || []).map((tag) =>
            tag === "Any" ? "Blockchain" : tag,
          ),
        })),
      );
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hackathons.length === 0) return;

    const allTags = new Set();

    hackathons.forEach((hackathon) => {
      if (Array.isArray(hackathon.techStack)) {
        hackathon.techStack.forEach((tag) => {
          allTags.add(tag);
        });
      }
    });

    allTags.add("Blockchain");
    allTags.add("Solidity");
    allTags.add("Ethereum");

    setAvailableTags(Array.from(allTags).sort((left, right) => left.localeCompare(right)));
  }, [hackathons]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrollVisible(window.scrollY > 50);
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
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const positionClass = `
    ${isScrollVisible ? "bottom-40" : "bottom-24"}
    ${isChatbotOpen ? "left-6" : "right-6"}
  `;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const sectionItem = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const scrollToCards = () => {
    cardsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTagSelect = (tag) => {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag) ? currentTags : [...currentTags, tag],
    );
    heroSearchInputRef.current?.focus();
  };

  const handleTagRemove = (tagToRemove) => {
    setSelectedTags((currentTags) =>
      currentTags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleSearchKeyDown = (event) => {
    if (
      event.key === "Backspace" &&
      searchQuery === "" &&
      selectedTags.length > 0
    ) {
      handleTagRemove(selectedTags[selectedTags.length - 1]);
    }
  };

  const updateFilter = (key, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSortBy("");
    setSearchQuery("");
    setSelectedTags([]);
    setShowMoreFilters(false);
    setShowAllTechTags(false);
  };

  const fuse = useMemo(
    () =>
      new Fuse(hackathons, {
        keys: ["title", "description", "location", "techStack"],
        threshold: 0.35,
      }),
    [hackathons],
  );

  const searchedHackathons = useMemo(
    () =>
      searchQuery
        ? fuse.search(searchQuery).map((result) => result.item)
        : hackathons,
    [fuse, hackathons, searchQuery],
  );

  const matchingHackathons = useMemo(
    () =>
      searchedHackathons.filter((hackathon) =>
        matchesFilters(hackathon, filters, selectedTags),
      ),
    [filters, searchedHackathons, selectedTags],
  );

  const filteredHackathons = useMemo(() => {
    const tabFilteredHackathons =
      activeTab === "all"
        ? matchingHackathons
        : matchingHackathons.filter((hackathon) => hackathon.status === activeTab);

    return sortHackathons(tabFilteredHackathons, sortBy);
  }, [activeTab, matchingHackathons, sortBy]);

  const statusCounts = useMemo(
    () => getStatusCounts(matchingHackathons),
    [matchingHackathons],
  );

  const featuredHackathons = useMemo(
    () => hackathons.filter((hackathon) => hackathon.featured).slice(0, 3),
    [hackathons],
  );

  const difficulties = useMemo(
    () => [...new Set(hackathons.map((hackathon) => hackathon.difficulty).filter(Boolean))],
    [hackathons],
  );

  const locations = useMemo(
    () => [...new Set(hackathons.map((hackathon) => hackathon.location).filter(Boolean))],
    [hackathons],
  );

  const activeFilterChips = [
    ...(searchQuery
      ? [
          {
            key: "search",
            label: `Search: ${searchQuery}`,
            onRemove: () => setSearchQuery(""),
          },
        ]
      : []),
    ...(filters.difficulty
      ? [
          {
            key: "difficulty",
            label: filters.difficulty,
            onRemove: () => updateFilter("difficulty", ""),
          },
        ]
      : []),
    ...(filters.mode
      ? [
          {
            key: "mode",
            label: filters.mode,
            onRemove: () => updateFilter("mode", ""),
          },
        ]
      : []),
    ...(filters.registrationStatus
      ? [
          {
            key: "registrationStatus",
            label: filters.registrationStatus,
            onRemove: () => updateFilter("registrationStatus", ""),
          },
        ]
      : []),
    ...(filters.prize
      ? [
          {
            key: "prize",
            label: filters.prize,
            onRemove: () => updateFilter("prize", ""),
          },
        ]
      : []),
    ...(filters.teamSize
      ? [
          {
            key: "teamSize",
            label: filters.teamSize,
            onRemove: () => updateFilter("teamSize", ""),
          },
        ]
      : []),
    ...(filters.location
      ? [
          {
            key: "location",
            label: filters.location,
            onRemove: () => updateFilter("location", ""),
          },
        ]
      : []),
    ...selectedTags.map((tag) => ({
      key: `tag-${tag}`,
      label: tag,
      onRemove: () => handleTagRemove(tag),
    })),
  ];

  const hasActiveFilters = activeFilterChips.length > 0;
  const hasActiveSorting = Boolean(sortBy);
  const hasAnyActiveControls = hasActiveFilters || hasActiveSorting;
  const visibleTechTags = showAllTechTags
    ? availableTags
    : availableTags.slice(0, 10);

  return (
    <div className="overflow-x-hidden bg-gradient-to-l from-sky-50 via-white to-white py-6 text-gray-900 dark:from-gray-900 dark:to-black dark:text-gray-100">
      <motion.div
        className={`fixed z-50 ${positionClass}`}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to="/host-hackathon"
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-black text-white shadow-lg transition-colors hover:bg-zinc-800"
          title="Host a Hackathon"
        >
          <svg
            className="h-6 w-6"
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

      <HackathonHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        scrollToCards={scrollToCards}
        selectedTags={selectedTags}
        onTagRemove={handleTagRemove}
        onSearchKeyDown={handleSearchKeyDown}
        searchInputRef={heroSearchInputRef}
      />

      <div
        ref={cardsSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5"
      >
        <motion.section
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="mb-10"
        >
          <motion.div
            variants={sectionItem}
            className="mb-3"
          >
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50 sm:text-3xl">
                All Hackathons
              </h2>
            </div>
          </motion.div>

          <motion.div
            variants={sectionItem}
            className="rounded-[20px] border border-slate-200/70 bg-white/80 p-2.5 shadow-[0_4px_18px_rgba(15,23,42,0.04)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[170px_170px_190px_180px_150px_auto] xl:items-end">
              <CustomDropdown
                label="Difficulty"
                value={filters.difficulty}
                options={difficulties}
                onChange={(value) => updateFilter("difficulty", value)}
                placeholder="All Levels"
              />

              <CustomDropdown
                label="Format"
                value={filters.mode}
                options={MODE_OPTIONS}
                onChange={(value) => updateFilter("mode", value)}
                placeholder="Any Format"
              />

              <CustomDropdown
                label="Registration"
                value={filters.registrationStatus}
                options={REGISTRATION_STATUS_OPTIONS}
                onChange={(value) => updateFilter("registrationStatus", value)}
                placeholder="All Statuses"
              />

              <CustomDropdown
                label="Sort By"
                value={sortBy}
                options={SORT_OPTIONS}
                onChange={setSortBy}
                placeholder="Default Order"
              />

              <div>
                <label className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300">
                  Advanced
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreFilters((current) => {
                      const nextValue = !current;
                      if (!nextValue) {
                        setShowAllTechTags(false);
                      }
                      return nextValue;
                    });
                  }}
                  aria-expanded={showMoreFilters}
                  aria-controls="more-filters-panel"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/95 px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:focus:ring-slate-600"
                >
                  <FiSliders className="h-3.5 w-3.5" />
                  More Filters
                  <FiChevronDown
                    className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
                      showMoreFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {hasAnyActiveControls && (
                <div className="flex items-end xl:justify-end">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex h-[38px] items-center rounded-xl border border-transparent px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <AnimatePresence initial={false}>
              {showMoreFilters && (
                <motion.div
                  id="more-filters-panel"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-2.5 border-t border-slate-200/80 pt-2.5 dark:border-slate-800">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                      <CustomDropdown
                        label="Prize Pool"
                        value={filters.prize}
                        options={PRIZE_OPTIONS}
                        onChange={(value) => updateFilter("prize", value)}
                        placeholder="Any Prize"
                      />

                      <CustomDropdown
                        label="Team Size"
                        value={filters.teamSize}
                        options={TEAM_SIZE_OPTIONS}
                        onChange={(value) => updateFilter("teamSize", value)}
                        placeholder="Any Team Size"
                      />

                      <CustomDropdown
                        label="Location"
                        value={filters.location}
                        options={locations}
                        onChange={(value) => updateFilter("location", value)}
                        placeholder="All Locations"
                      />
                    </div>

                    {availableTags.length > 0 && (
                      <div className="mt-2.5">
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300">
                            Technology Tags
                          </label>
                          <span className="text-[10px] text-slate-600 dark:text-slate-400">
                            {selectedTags.length} selected
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {visibleTechTags.map((tag) => (
                            <TechTagButton
                              key={tag}
                              tag={tag}
                              isSelected={selectedTags.includes(tag)}
                              onSelect={handleTagSelect}
                            />
                          ))}
                        </div>
                        {availableTags.length > 10 && (
                          <button
                            type="button"
                            onClick={() => setShowAllTechTags((current) => !current)}
                            className="mt-2 inline-flex rounded-full border border-slate-200/90 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                          >
                            {showAllTechTags ? "Show fewer tags" : `+ ${availableTags.length - 10} more tags`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {hasActiveFilters && (
            <motion.div
              variants={sectionItem}
              className="mt-2.5 flex flex-wrap items-center gap-2"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
                Active Filters
              </span>
              <AnimatePresence>
                {activeFilterChips.map((chip) => (
                  <ActiveFilterChip
                    key={chip.key}
                    label={chip.label}
                    onRemove={chip.onRemove}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          <motion.div
            variants={sectionItem}
            className="mt-3 flex flex-wrap gap-1.5 border-b border-slate-200/80 pb-2.5 dark:border-slate-800"
          >
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-slate-900 text-white shadow-[0_2px_8px_rgba(15,23,42,0.12)] dark:bg-white dark:text-slate-900"
                    : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    activeTab === tab.key
                      ? "bg-white/15 text-white dark:bg-slate-200 dark:text-slate-900"
                      : "bg-white/90 text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  {statusCounts[tab.key]}
                </span>
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <HackathonCardSkeleton key={`skeleton-${index}`} />
                ))}
              </div>
            ) : filteredHackathons.length > 0 ? (
              <motion.div
                key={activeTab}
                className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
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
                    data-aos-delay={index * 80}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="relative mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)]"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 -z-10 bg-black/10 blur-3xl dark:bg-black/30"
                  animate={{
                    opacity: [0.3, 0.55, 0.3],
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <div className="mx-auto max-w-md">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
                  >
                    <FiCode className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                  </motion.div>

                  <h3 className="mt-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    No Hackathons Found
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {hasActiveFilters
                      ? "No hackathons match your current filters. Try adjusting your search or selections."
                      : "Check back later for exciting new hackathons."}
                  </p>

                  <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={resetFilters}
                      className="flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-zinc-800"
                    >
                      <FiRotateCw className="h-4 w-4" />
                      Reset Filters
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={scrollToCards}
                      className="flex items-center justify-center gap-2 rounded-lg border border-black/15 bg-white px-6 py-2.5 text-sm font-medium text-black shadow-md transition-all hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                    >
                      Explore Hackathons
                      <FiCompass className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {!isLoading && featuredHackathons.length > 0 && (
          <section
            className="rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-900/70 sm:p-8"
            data-aos="fade-up"
            data-aos-duration="900"
          >
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Curated picks
                </p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Featured Hackathons
                </h3>
              </div>
              <Link
                to="/hackathons?filter=featured"
                className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                View all featured
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredHackathons.map((hackathon, index) => (
                <HackathonCard
                  key={hackathon.id}
                  hackathon={hackathon}
                  isFeatured={hackathon.featured}
                  data-aos="zoom-in"
                  data-aos-delay={index * 120}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <HackathonCTA />
      <FeedbackButton />
    </div>
  );
};

export default HackathonHub;
