import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import mockHackathons from "./hackathonMockData.json";
import HackathonHero from "./HackathonHero";
import HackathonCard from "./HackathonCard";
import FeedbackButton from "../../components/FeedbackButton";
import { FiCode, FiRotateCw, FiCompass, FiChevronDown, FiX } from "react-icons/fi";
import HackathonCTA from "./HackathonCTA";
import Fuse from "fuse.js";
import { createPortal } from "react-dom";

// UPDATED: Skeleton Loader for dark mode
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md animate-pulse">
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="h-4 w-full bg-gray-100 dark:bg-gray-600 rounded mb-2"></div>
      <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-600 rounded mb-4"></div>
      <div className="space-y-3 mb-4">
        <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-600 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-600 rounded"></div>
      </div>
      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  </div>
);

// NEW: Tag component for selected tags in search bar
const Tag = ({ tag, onRemove }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium"
  >
    <span>{tag}</span>
    <button
      onClick={() => onRemove(tag)}
      className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5 transition-colors"
    >
      <FiX className="w-3 h-3" />
    </button>
  </motion.div>
);

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
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  
  // NEW: State for selected tags
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  const cardsSectionRef = useRef(null);
  const searchInputRef = useRef(null);

  // Simulate API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setHackathons(mockHackathons);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
// UPDATED: Extract available tags from hackathons - ADDED BLOCKCHAIN TAGS
useEffect(() => {
  if (hackathons.length > 0) {
    const allTags = new Set();
    hackathons.forEach(hackathon => {
      if (hackathon.techStack && Array.isArray(hackathon.techStack)) {
        hackathon.techStack.forEach(tag => {
          // Replace "Any" with "Blockchain"
          if (tag === "Any") {
            allTags.add("Blockchain");
          } else {
            allTags.add(tag);
          }
        });
      }
    });
    // ADD ONLY THESE 3 BLOCKCHAIN TAGS
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
      setIsChatbotOpen(document.querySelector('[data-chatbot-open]') !== null);
    };
    
    handleChatbotState();
    const observer = new MutationObserver(handleChatbotState);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
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
        duration: 0.6,
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
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // NEW: Handle backspace in search input
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Backspace' && searchQuery === '' && selectedTags.length > 0) {
      // Remove the last tag when backspace is pressed on empty input
      const lastTag = selectedTags[selectedTags.length - 1];
      handleTagRemove(lastTag);
    }
  };

  const fuse = new Fuse(hackathons, {
    keys: ["title", "description", "location", "techStack"],
    threshold: 0.4,
  });

  const searchedHackathons = searchQuery
    ? fuse.search(searchQuery).map((result) => result.item)
    : hackathons;

  // UPDATED: Filter hackathons based on selected tags
  const filteredHackathons = searchedHackathons
    .filter((hackathon) => {
      if (activeTab === "all") return true;
      return hackathon.status === activeTab;
    })
    .filter((hackathon) => {
      if (filters.difficulty && hackathon.difficulty !== filters.difficulty)
        return false;
      if (
        filters.prize &&
        !hackathon.prize.toLowerCase().includes(filters.prize.toLowerCase())
      )
        return false;
      if (
        filters.location &&
        !hackathon.location
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      )
        return false;
      
      // NEW: Filter by selected tags
      if (selectedTags.length > 0) {
        const hackathonTags = hackathon.techStack || [];
        return selectedTags.some(tag => hackathonTags.includes(tag));
      }
      
      return true;
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

      <div
        ref={buttonRef}
        className="flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
        onClick={toggleOpen}
      >
        <span
          className={`text-gray-700 dark:text-gray-200 ${!value ? "text-gray-400" : ""}`}
        >
          {displayText}
        </span>

        <FiChevronDown className="text-gray-400 dark:text-gray-500" />
      </div>

      {open &&
        createPortal(
          <ul
            ref={dropdownRef}
            className="z-[10000] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg"
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
              className="px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {placeholder}
            </li>

            {options.map((opt) => (
              <li
                key={opt}
                className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 ${
                  opt === value
                    ? "font-semibold bg-indigo-100 dark:bg-indigo-900"
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

  return (
    <div className="overflow-x-hidden bg-gradient-to-l from-indigo-200 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 py-6">
      {/* Floating Action Button */}
      <motion.div
        className={`fixed z-50  ${positionClass}`}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to="/host-hackathon"
          className="flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors border-2 border-white"
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

      {/* Featured Hackathons */}
      {!isLoading && featuredHackathons.length > 0 && (
        <div
          className="bg-white dark:bg-black py-8 border-b border-gray-200 dark:border-gray-800"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Featured Hackathons
              </h2>
              <Link
                to="/hackathons?filter=featured"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
              >
                View all featured
              </Link>
            </div>
            <div className="grid gap-4 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search and Filters */}
        <div className="mb-8" data-aos="fade-up" data-aos-delay="200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 mt-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0">
              All Hackathons
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              {(filters.difficulty || filters.prize || filters.location || selectedTags.length > 0) && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* UPDATED: Tags display */}
          {selectedTags.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex flex-wrap gap-2"
            >
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Selected tags:</span>
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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 mb-6 overflow-hidden shadow-[0_4px_12px_rgba(59,130,246,0.1)]"
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

                {/* NEW: Available tags for selection - NOW INCLUDES BLOCKCHAIN */}
                {availableTags.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Filter by Technology
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagSelect(tag)}
                          className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                            selectedTags.includes(tag)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
              { key: "live", label: "Live Now" },
              { key: "upcoming", label: "Upcoming" },
              { key: "completed", label: "Completed" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 transform ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-indigo-700 via-indigo-500 to-blue-600 text-white shadow-lg scale-105"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Hackathons Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={`skeleton-${i}`} />
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
              className="relative overflow-hidden rounded-3xl p-10 text-center shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-white via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-indigo-900/20 dark:to-purple-900/20"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 -z-10 bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-900/50 dark:via-purple-900/50 dark:to-pink-900/50 blur-3xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 8,
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
                      className="absolute rounded-full bg-blue-400/60 dark:bg-blue-500/40"
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
                        duration: 6 + i,
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
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex justify-center items-center w-20 h-20 rounded-full bg-white dark:bg-gray-700 shadow-lg mx-auto border border-indigo-100 dark:border-gray-600"
                >
                  <FiCode className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                </motion.div>

                <h3 className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  No Hackathons Found
                </h3>

                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {searchQuery || filters.difficulty || filters.prize || filters.location || selectedTags.length > 0
                    ? "No hackathons match your current filters. Try adjusting your search or filters."
                    : "Check back later for exciting new hackathons!"}
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetFilters}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all"
                  >
                    <FiRotateCw className="w-4 h-4" />
                    Reset Filters
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {}}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-600 shadow-md transition-all"
                  >
                    Explore Hackathons
                    <FiCompass className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <HackathonCTA></HackathonCTA>

      {/* Feedback Button */}
      <FeedbackButton />
    </div>
  );
};

export default HackathonHub;