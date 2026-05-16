import React, { useEffect, useMemo, useRef, useState } from "react";
import EmptyHackathonState from "./EmptyHackathonState";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { createPortal } from "react-dom";
import {
  FiChevronDown,
  FiCode,
  FiCompass,
  FiRotateCw,
  FiSliders,
  FiX,
} from "react-icons/fi";
import mockHackathons from "./hackathonMockData.json";
import HackathonHero from "./HackathonHero";
import HackathonCard from "./HackathonCard";
import HackathonCTA from "./HackathonCTA";
import FeedbackButton from "../../components/FeedbackButton";
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

const TECH_TAG_LIMIT = 10;
const ONLINE_MODE_KEYWORDS = ["online", "virtual", "remote"];
const HYBRID_MODE_KEYWORDS = ["hybrid"];
const STATUS_COUNTS_TEMPLATE = {
  all: 0,
  live: 0,
  upcoming: 0,
  completed: 0,
};

const parsePrizeAmount = (prize = "") =>
  Number(prize.replace(/[^0-9]/g, "")) || 0;

const getDateValue = (value) => {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const normalizeText = (value = "") => value.toLowerCase().trim();

const includesAnyKeyword = (values, keywords) =>
  values.some((value) =>
    keywords.some((keyword) => normalizeText(value).includes(keyword)),
  );

const normalizeHackathon = (hackathon) => ({
  ...hackathon,
  techStack: (hackathon.techStack || []).map((tag) =>
    tag === "Any" ? "Blockchain" : tag,
  ),
});

const getUniqueFieldValues = (hackathons, field) =>
  [...new Set(hackathons.map((hackathon) => hackathon[field]).filter(Boolean))];

const getAvailableTags = (hackathons) => {
  const tags = new Set(["Blockchain", "Solidity", "Ethereum"]);

  hackathons.forEach((hackathon) => {
    (hackathon.techStack || []).forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort((left, right) => left.localeCompare(right));
};

const PRIZE_RANGES = {
  "Under $1,000": (amount) => amount < 1000,
  "$1,000 - $5,000": (amount) => amount >= 1000 && amount <= 5000,
  "$5,000+": (amount) => amount >= 5000,
};

const getHackathonMode = (hackathon) => {
  if (hackathon.mode) {
    return hackathon.mode;
  }

  const searchableValues = [hackathon.mode, hackathon.location].filter(Boolean);

  if (includesAnyKeyword(searchableValues, HYBRID_MODE_KEYWORDS)) {
    return "Hybrid";
  }

  if (includesAnyKeyword(searchableValues, ONLINE_MODE_KEYWORDS)) {
    return "Online";
  }

  return "Offline";
};

const getRegistrationStatus = (hackathon) => {
  if (hackathon.registrationStatus) {
    return hackathon.registrationStatus;
  }

  return hackathon.status === "completed" ? "Closed" : "Open";
};

const getTeamSizeCategory = (hackathon) => {
  if (hackathon.teamSize) {
    return hackathon.teamSize;
  }

  const teamRule =
    hackathon.rules?.find((rule) => /team|individual|solo/i.test(rule)) || "";

  if (/individual|solo/i.test(teamRule)) {
    return "Solo";
  }

  if (/5\+|5\s*members|3\s*-\s*5/i.test(teamRule)) {
    return "5+ Members";
  }

  if (/2\s*-\s*4/i.test(teamRule)) {
    return "2-4 Members";
  }

  return "";
};

const getPopularityScore = (hackathon) =>
  hackathon.popularityScore ??
  hackathon.participants + hackathon.teams * 2 + hackathon.submissions * 3;

const SORT_FUNCTIONS = {
  Deadline: (left, right) =>
    getDateValue(left.registrationDeadline || left.startDate) -
    getDateValue(right.registrationDeadline || right.startDate),
  Newest: (left, right) =>
    getDateValue(right.createdAt || right.startDate) -
    getDateValue(left.createdAt || left.startDate),
  Popularity: (left, right) =>
    getPopularityScore(right) - getPopularityScore(left),
  "Prize Amount": (left, right) =>
    parsePrizeAmount(right.prize) - parsePrizeAmount(left.prize),
};

const matchesPrizeFilter = (hackathon, prizeFilter) => {
  if (!prizeFilter) {
    return true;
  }

  const matchPrizeRange = PRIZE_RANGES[prizeFilter];
  return matchPrizeRange ? matchPrizeRange(parsePrizeAmount(hackathon.prize)) : true;
};

const matchesSelectedTags = (hackathon, selectedTags) => {
  if (selectedTags.length === 0) {
    return true;
  }

  const hackathonTags = hackathon.techStack || [];
  return selectedTags.some((tag) => hackathonTags.includes(tag));
};

const FILTER_MATCHERS = {
  difficulty: (hackathon, value) => !value || hackathon.difficulty === value,
  prize: (hackathon, value) => matchesPrizeFilter(hackathon, value),
  location: (hackathon, value) =>
    !value || normalizeText(hackathon.location).includes(normalizeText(value)),
  mode: (hackathon, value) => !value || getHackathonMode(hackathon) === value,
  registrationStatus: (hackathon, value) =>
    !value || getRegistrationStatus(hackathon) === value,
  teamSize: (hackathon, value) =>
    !value || getTeamSizeCategory(hackathon) === value,
};

const matchesFilters = (hackathon, filters, selectedTags) =>
  Object.entries(filters).every(([key, value]) =>
    FILTER_MATCHERS[key] ? FILTER_MATCHERS[key](hackathon, value) : true,
  ) && matchesSelectedTags(hackathon, selectedTags);

const sortHackathons = (hackathons, sortBy) => {
  const sortComparator = SORT_FUNCTIONS[sortBy];
  return sortComparator ? [...hackathons].sort(sortComparator) : hackathons;
};

const getStatusCounts = (hackathons) => {
  const counts = { ...STATUS_COUNTS_TEMPLATE, all: hackathons.length };

  hackathons.forEach((hackathon) => {
    if (counts[hackathon.status] !== undefined) {
      counts[hackathon.status] += 1;
    }
  });

  return counts;
};

const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const sectionItemVariants = {
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
    if (!buttonRef.current) {
      return;
    }

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

    setOpen((currentOpen) => !currentOpen);
  };

  useEffect(() => {
    if (!open) {
      return undefined;
    }

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
        <span
          className={
            value
              ? "text-slate-800 dark:text-slate-100"
              : "text-slate-500 dark:text-slate-400"
          }
        >
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
      setHackathons(mockHackathons.map(normalizeHackathon));
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hackathons.length > 0) {
      setAvailableTags(getAvailableTags(hackathons));
    }
  }, [hackathons]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrollVisible(window.scrollY > 50);
    };

    const handleChatbotState = () => {
      setIsChatbotOpen(document.querySelector("[data-chatbot-open]") !== null);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
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

  const scrollToCards = () => {
    cardsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
    () => getUniqueFieldValues(hackathons, "difficulty"),
    [hackathons],
  );

  const locations = useMemo(
    () => getUniqueFieldValues(hackathons, "location"),
    [hackathons],
  );

  const primaryDropdowns = useMemo(
    () => [
      {
        key: "difficulty",
        label: "Difficulty",
        value: filters.difficulty,
        options: difficulties,
        placeholder: "All Levels",
      },
      {
        key: "mode",
        label: "Format",
        value: filters.mode,
        options: MODE_OPTIONS,
        placeholder: "Any Format",
      },
      {
        key: "registrationStatus",
        label: "Registration",
        value: filters.registrationStatus,
        options: REGISTRATION_STATUS_OPTIONS,
        placeholder: "All Statuses",
      },
    ],
    [difficulties, filters.difficulty, filters.mode, filters.registrationStatus],
  );

  const advancedDropdowns = useMemo(
    () => [
      {
        key: "prize",
        label: "Prize Pool",
        value: filters.prize,
        options: PRIZE_OPTIONS,
        placeholder: "Any Prize",
      },
      {
        key: "teamSize",
        label: "Team Size",
        value: filters.teamSize,
        options: TEAM_SIZE_OPTIONS,
        placeholder: "Any Team Size",
      },
      {
        key: "location",
        label: "Location",
        value: filters.location,
        options: locations,
        placeholder: "All Locations",
      },
    ],
    [filters.location, filters.prize, filters.teamSize, locations],
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
    ...Object.entries(filters)
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => ({
        key,
        label: value,
        onRemove: () => updateFilter(key, ""),
      })),
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
    : availableTags.slice(0, TECH_TAG_LIMIT);

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
        className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-5 lg:px-8"
      >
        <motion.section
          initial="hidden"
          animate="show"
          variants={pageVariants}
          className="mb-10"
        >
          <motion.div variants={sectionItemVariants} className="mb-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50 sm:text-3xl">
              All Hackathons
            </h2>
          </motion.div>

          <motion.div
            variants={sectionItemVariants}
            className="rounded-[20px] border border-slate-200/70 bg-white/80 p-2.5 shadow-[0_4px_18px_rgba(15,23,42,0.04)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[170px_170px_190px_180px_150px_auto] xl:items-end">
              {primaryDropdowns.map((dropdown) => (
                <CustomDropdown
                  key={dropdown.key}
                  label={dropdown.label}
                  value={dropdown.value}
                  options={dropdown.options}
                  onChange={(value) => updateFilter(dropdown.key, value)}
                  placeholder={dropdown.placeholder}
                />
              ))}

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
                    setShowMoreFilters((currentValue) => {
                      const nextValue = !currentValue;
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
                      {advancedDropdowns.map((dropdown) => (
                        <CustomDropdown
                          key={dropdown.key}
                          label={dropdown.label}
                          value={dropdown.value}
                          options={dropdown.options}
                          onChange={(value) => updateFilter(dropdown.key, value)}
                          placeholder={dropdown.placeholder}
                        />
                      ))}
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
                        {availableTags.length > TECH_TAG_LIMIT && (
                          <button
                            type="button"
                            onClick={() => setShowAllTechTags((current) => !current)}
                            className="mt-2 inline-flex rounded-full border border-slate-200/90 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                          >
                            {showAllTechTags
                              ? "Show fewer tags"
                              : `+ ${availableTags.length - TECH_TAG_LIMIT} more tags`}
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
              variants={sectionItemVariants}
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
            variants={sectionItemVariants}
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
                variants={pageVariants}
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
                <EmptyHackathonState
                  hasActiveFilters={hasActiveFilters}
                    resetFilters={resetFilters}
                   scrollToCards={scrollToCards}
                />
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
