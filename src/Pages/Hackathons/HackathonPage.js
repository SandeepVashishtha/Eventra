import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import mockHackathons from "./hackathonMockData.json";
import HackathonHero from "./HackathonHero";
import HackathonCard from "./HackathonCard";
import FeedbackButton from "../../components/FeedbackButton";
// ModernSearchInput import removed (unused in this page)
import EmptyState from "../../components/common/EmptyState";
import { HackathonCardSkeleton } from "../../components/common/SkeletonLoaders";
import { FiCode, FiRotateCw, FiCompass, FiChevronDown } from "react-icons/fi";
import HackathonCTA from "./HackathonCTA";
import Fuse from "fuse.js";
import { createPortal } from "react-dom";
import { darkTheme } from "../../components/styles/theme";

const containerVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const HackathonHub = () => {
  const [hackathons, setHackathons] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isScrollVisible, setIsScrollVisible] = useState(false);

  const [filters, setFilters] = useState({
    difficulty: "",
    prize: "",
    location: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  const cardsSectionRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHackathons(mockHackathons);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hackathons.length > 0) {
      const allTags = new Set();

      hackathons.forEach((hackathon) => {
        if (hackathon.techStack && Array.isArray(hackathon.techStack)) {
          hackathon.techStack.forEach((tag) => {
            if (tag === "Any") {
              allTags.add("Blockchain");
            } else {
              allTags.add(tag);
            }
          });
        }
      });

      allTags.add("Blockchain");
      allTags.add("Solidity");
      allTags.add("Ethereum");

      setAvailableTags(Array.from(allTags));
    }
  }, [hackathons]);

  const scrollToCards = () => {
    cardsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const positionClass = `
    ${isScrollVisible ? "bottom-40" : "bottom-24"} 
    ${isChatbotOpen ? "left-6" : "right-6"}
  `;

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
    if (
      e.key === "Backspace" &&
      searchQuery === "" &&
      selectedTags.length > 0
    ) {
      const lastTag = selectedTags[selectedTags.length - 1];
      handleTagRemove(lastTag);
    }
  };

  const fuse = new Fuse(hackathons, {
  keys: [
    "title",
    "description",
    "location",
    "organizer",
    "difficulty",
    "techStack",
  ],
  threshold: 0.3,
});

  /*const searchedHackathons = searchQuery
    ? fuse.search(searchQuery).map((result) => result.item)
    : hackathons;*/
    const searchedHackathons =
  searchQuery.trim() !== ""
    ? fuse
        .search(searchQuery)
        .map((result) => result.item)
        .filter((hackathon) => {
          // strict tech stack match
          if (hackathon.techStack) {
            return hackathon.techStack.some((tech) =>
              tech.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }

          return (
            hackathon.title
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            hackathon.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            hackathon.location
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            hackathon.organizer
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
          );
        })
    : hackathons;

  const filteredHackathons = searchedHackathons
    .filter((hackathon) => {
      if (activeTab === "all") return true;
      return hackathon.status === activeTab;
    })
    .filter((hackathon) => {
      if (filters.difficulty && filters.difficulty !== hackathon.difficulty) {
        return false;
      }

      if (
        filters.prize &&
        !hackathon.prize.toLowerCase().includes(filters.prize.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.location &&
        !hackathon.location
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      ) {
        return false;
      }

      if (selectedTags.length > 0) {
        const hackathonTags = hackathon.techStack || [];

        return selectedTags.some((tag) => hackathonTags.includes(tag));
      }

      return true;
    });


  const sortHackathons = (list) => {
    const sorted = [...list];
    if (sortBy === "deadline") {
      sorted.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    } else if (sortBy === "popularity") {
      sorted.sort((a, b) => (b.participants || 0) - (a.participants || 0));
    } else if (sortBy === "newest") {
      sorted.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    } else if (sortBy === "prize") {
      const parseP = (p) => parseInt((p || "0").replace(/[^0-9]/g, ""), 10);
      sorted.sort((a, b) => parseP(b.prize) - parseP(a.prize));
    }
    return sorted;
  };

  const sortedFilteredHackathons = sortHackathons(filteredHackathons);

  const featuredHackathons = [...hackathons]
    .filter((h) => h.featured)
    .slice(0, 3);

  const resetFilters = () => {
    setFilters({
      difficulty: "",
      prize: "",
      location: "",
    });

    setSearchQuery("");
    setSelectedTags([]);
  };

  const difficulties = [...new Set(hackathons.map((h) => h.difficulty))];

  const locations = [...new Set(hackathons.map((h) => h.location))];

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const CustomDropdown = ({
    label,
    value,
    options,
    onChange,
    placeholder = "Select",
  }) => {
    const [open, setOpen] = useState(false);

    const [menuCoords, setMenuCoords] = useState({
      top: 0,
      left: 0,
      width: 0,
    });

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

      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="relative">
        <label
          className={`block text-sm font-medium mb-2 ${darkTheme.textSecondary}`}
        >
          {label}
        </label>

        <button
          type="button"
          ref={buttonRef}
          onClick={toggleOpen}
          className={`
            ${darkTheme.card}
            flex items-center justify-between
            px-4 py-3
            rounded-2xl
            shadow-sm
            w-full
            transition-all
          `}
        >
          <span className={value ? darkTheme.textPrimary : darkTheme.muted}>
            {value || placeholder}
          </span>

          <FiChevronDown className={darkTheme.muted} />
        </button>

        {open &&
          createPortal(
            <ul
              ref={dropdownRef}
              className={`
                z-[10000]
                rounded-2xl
                overflow-hidden
                shadow-2xl
                ${darkTheme.card}
              `}
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
                className={`
                  px-4 py-3
                  cursor-pointer
                  ${darkTheme.textSecondary}
                  ${darkTheme.hover}
                `}
              >
                {placeholder}
              </li>

              {options.map((opt) => (
                <li
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`
                    px-4 py-3
                    cursor-pointer
                    transition-colors
                    ${darkTheme.textSecondary}
                    ${darkTheme.hover}
                    ${opt === value ? `${darkTheme.active} font-semibold` : ""}
                  `}
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

  return (
    <div className={`${darkTheme.section} overflow-x-hidden py-6`}>
      <motion.div
        className={`fixed z-50 ${positionClass}`}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to="/host-hackathon"
          className={`
            flex items-center justify-center
            w-14 h-14
            rounded-full
            ${darkTheme.buttonPrimary}
            shadow-xl
            transition-colors
          `}
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

      <HackathonHero
        hackathons={hackathons}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        scrollToCards={scrollToCards}
        filteredCount={filteredHackathons.length}
        selectedTags={selectedTags}
        onTagRemove={handleTagRemove}
        onSearchKeyDown={handleSearchKeyDown}
        searchInputRef={searchInputRef}
        availableTags={availableTags}
        onTagSelect={handleTagSelect}
      />

      {!isLoading && featuredHackathons.length > 0 && (
        <div className={`py-10 ${darkTheme.border}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-3xl font-bold ${darkTheme.textPrimary}`}>
                Featured Hackathons
              </h2>

              <Link
                to="/hackathons?filter=featured"
                className={`
                  ${darkTheme.accentText}
                  hover:underline
                  font-medium
                `}
              >
                View all featured
              </Link>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {featuredHackathons.map((hackathon, index) => (
                <HackathonCard
                  key={index}
                  hackathon={hackathon}
                  isFeatured={hackathon.featured}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className={`text-3xl font-bold ${darkTheme.textPrimary}`}>
              All Hackathons
            </h2>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  ${darkTheme.card}
                  ${darkTheme.textSecondary}
                  px-4 py-2
                  rounded-xl
                  text-sm font-medium
                  flex items-center gap-2
                `}
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>

              {(filters.difficulty ||
                filters.prize ||
                filters.location ||
                selectedTags.length > 0) && (
                <button
                  onClick={resetFilters}
                  className={`
                    text-sm font-medium
                    ${darkTheme.accentText}
                  `}
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className={`
                  ${darkTheme.card}
                  p-6 md:p-8
                  rounded-3xl
                  mb-6
                  shadow-xl
                `}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <CustomDropdown
                    label="Difficulty"
                    value={filters.difficulty}
                    options={difficulties}
                    onChange={(val) =>
                      setFilters({
                        ...filters,
                        difficulty: val,
                      })
                    }
                    placeholder="All Levels"
                  />

                  <CustomDropdown
                    label="Prize Pool"
                    value={filters.prize}
                    options={["Under $1,000", "$1,000 - $5,000", "$5,000+"]}
                    onChange={(val) =>
                      setFilters({
                        ...filters,
                        prize: val,
                      })
                    }
                    placeholder="Any Prize"
                  />

                  <CustomDropdown
                    label="Location"
                    value={filters.location}
                    options={locations}
                    onChange={(val) =>
                      setFilters({
                        ...filters,
                        location: val,
                      })
                    }
                    placeholder="All Locations"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              {[
                { key: "all", label: "All Hackathons" },
                { key: "live", label: "Live Now" },
                { key: "upcoming", label: "Upcoming" },
                { key: "completed", label: "Completed" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    px-5 py-2.5
                    rounded-full
                    text-sm font-medium
                    transition-all duration-300
                    ${
                      activeTab === tab.key
                        ? darkTheme.buttonPrimary
                        : `${darkTheme.card} ${darkTheme.textSecondary}`
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <option value="newest">Newest</option>
                <option value="deadline">Deadline</option>
                <option value="popularity">Popularity</option>
                <option value="prize">Prize Amount</option>
              </select>
            </div>
          </div>
        </div>
        
      {/* Hackathons Grid */}
<AnimatePresence mode="wait">
  {isLoading ? (
    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
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
      {sortedFilteredHackathons.map(
        (hackathon, index) => (
          <HackathonCard
            key={hackathon.id}
            hackathon={hackathon}
            data-aos="flip-up"
            data-aos-delay={index * 100}
          />
        )
      )}
    </motion.div>
  ) : (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.4,
      }}
    >
      <EmptyState
        title="No Hackathons Found"
        message={
          searchQuery ||
          filters.difficulty ||
          filters.prize ||
          filters.location ||
          selectedTags.length > 0
            ? "🚀 No hackathons match your current filters. Try adjusting your search criteria or reset the filters."
            : "🎉 No hackathons are available right now. Be the first to host an exciting hackathon!"
        }
        ctaLabel={
          searchQuery ||
          filters.difficulty ||
          filters.prize ||
          filters.location ||
          selectedTags.length > 0
            ? "Explore Hackathons"
            : "Host Hackathon"
        }
        ctaLink={
          searchQuery ||
          filters.difficulty ||
          filters.prize ||
          filters.location ||
          selectedTags.length > 0
            ? "/hackathons"
            : "/host-hackathon"
        }
      />

      {/* Reset Filters Button */}
      {(searchQuery ||
        filters.difficulty ||
        filters.prize ||
        filters.location ||
        selectedTags.length > 0) && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-medium shadow-md transition-all duration-300"
          >
            <FiRotateCw className="w-4 h-4" />
            Reset Filters
          </button>
        </div>
      )}
    </motion.div>
  )}
</AnimatePresence>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <HackathonCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredHackathons.length > 0 ? (
            <motion.div
              className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredHackathons.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className={`
                ${darkTheme.card}
                rounded-3xl
                p-12
                text-center
                shadow-xl
              `}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mx-auto max-w-md">
                <div
                  className={`
                    flex justify-center items-center
                    w-20 h-20
                    rounded-full
                    ${darkTheme.cardSecondary}
                    mx-auto
                  `}
                >
                  <FiCode className="h-10 w-10 text-blue-500" />
                </div>

                <h3
                  className={`mt-6 text-2xl font-bold ${darkTheme.textPrimary}`}
                >
                  No Hackathons Found
                </h3>

                <p
                  className={`mt-3 text-sm leading-relaxed ${darkTheme.textSecondary}`}
                >
                  No hackathons match your current filters.
                </p>

                <div className="mt-8 flex gap-4 justify-center">
                  <button
                    onClick={resetFilters}
                    className={`
                      ${darkTheme.buttonPrimary}
                      px-6 py-3
                      rounded-xl
                      flex items-center gap-2
                    `}
                  >
                    <FiRotateCw />
                    Reset Filters
                  </button>

                  <button
                    className={`
                      ${darkTheme.buttonSecondary}
                      px-6 py-3
                      rounded-xl
                      flex items-center gap-2
                    `}
                  >
                    Explore
                    <FiCompass />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <HackathonCTA />
      <FeedbackButton />
    </div>
  );
};

export default HackathonHub;