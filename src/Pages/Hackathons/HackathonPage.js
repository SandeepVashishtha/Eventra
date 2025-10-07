import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import mockHackathons from "./hackathonMockData.json";
import HackathonHero from "./HackathonHero";
import HackathonCard from "./HackathonCard";
import FeedbackButton from "../../components/FeedbackButton";
import { FiCode, FiRotateCw, FiCompass } from "react-icons/fi";
import HackathonCTA from "./HackathonCTA";
import Fuse from "fuse.js";

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

const HackathonHub = () => {
  const [hackathons, setHackathons] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: "",
    prize: "",
    location: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const cardsSectionRef = useRef(null);

  // Simulate API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setHackathons(mockHackathons);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const scrollToCards = () => {
    cardsSectionRef.current?.scrollIntoView({ behavior: "smooth" }); // scroll function
  };

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

  const fuse = new Fuse(hackathons, {
    keys: ["title", "description", "location", "techStack"],
    threshold: 0.4, // adjust sensitivity (0 = exact, 1 = loose)
  });

  const searchedHackathons = searchQuery
    ? fuse.search(searchQuery).map((result) => result.item)
    : hackathons;

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
      return true;
    });

  const featuredHackathons = [...hackathons]
    .filter((h) => h.featured)
    .slice(0, 3);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      difficulty: "",
      prize: "",
      location: "",
    });
    setSearchQuery("");
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
    // UPDATED: Main page background
    <div className="bg-gradient-to-l from-indigo-200 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 py-6 ">
      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
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
      {/* Hero Section */}
      <HackathonHero
        hackathons={hackathons}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        scrollToCards={scrollToCards} // pass scroll function
      />

      <motion.div
        ref={cardsSectionRef} // attach ref
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
        // AOS Implementation
        <div 
          className="bg-white dark:bg-black py-8 border-b border-gray-200 dark:border-gray-800"
          data-aos="fade-up"
          data-aos-duration="1000"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              {/* UPDATED: Text colors */}
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
                  // AOS Implementation on individual cards
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
            {/* UPDATED: Text colors */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0">
              All Hackathons
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                // UPDATED: Button styles
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
              {(filters.difficulty || filters.prize || filters.location) && (
                <button
                  onClick={resetFilters}
                  // UPDATED: Link color
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                // UPDATED: Panel background and border
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 mb-6 overflow-hidden shadow-[0_4px_12px_rgba(59,130,246,0.1)]"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    {/* UPDATED: Label and Select styles */}
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={filters.difficulty}
                      onChange={(e) =>
                        setFilters({ ...filters, difficulty: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 px-4 pr-10 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:outline-none transition-all duration-200"
                    >
                      <option value="">All Levels</option>
                      {difficulties.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prize Pool
                    </label>
                    <select
                      value={filters.prize}
                      onChange={(e) =>
                        setFilters({ ...filters, prize: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 pr-10 text-base font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                    >
                      <option value="">Any Prize</option>
                      <option value="$">Under $1,000</option>
                      <option value="1,000">$1,000 - $5,000</option>
                      <option value="5,000">$5,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <select
                      value={filters.location}
                      onChange={(e) =>
                        setFilters({ ...filters, location: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 pr-10 text-base font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                    >
                      <option value="">All Locations</option>
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
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
                // UPDATED: Inactive tab styles
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
                  // AOS Implementation on individual cards
                  data-aos="flip-up"
                  data-aos-delay={index * 100}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              // Main container for "No Hackathons Found" card
              // UPDATED: "No Hackathons Found" card styles
              className="relative overflow-hidden rounded-3xl p-10 text-center shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-white via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-indigo-900/20 dark:to-purple-900/20"
              initial={{ opacity: 0, y: 30, scale: 0.95 }} // Initial animation state
              animate={{ opacity: 1, y: 0, scale: 1 }} // Animate to visible
              transition={{ duration: 0.6, ease: "easeOut" }} // Animation timing
            >
              {/* ------------------------------ */}
              {/* Smooth glowing background behind the card */}
              {/* ------------------------------ */}
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

              {/* ------------------------------ */}
              {/* Floating animated bubbles */}
              {/* ------------------------------ */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                {[...Array(6)].map((_, i) => {
                  // Predefined positions for bubbles to spread evenly
                  const positions = [
                    { left: "10%", top: "20%" },
                    { left: "70%", top: "15%" },
                    { left: "30%", top: "70%" },
                    { left: "80%", top: "60%" },
                    { left: "50%", top: "40%" },
                    { left: "20%", top: "50%" },
                  ];
                  // Randomize size between 30-70px for visual variation
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
                        opacity: 0.3, // Slight transparency
                      }}
                      animate={{
                        y: [0, -30, 0], // Vertical floating animation
                        x: [0, 10, -10, 0], // Horizontal swaying
                        scale: [1, 1.2, 1], // Pulsing effect
                      }}
                      transition={{
                        duration: 6 + i, // Different speed for each bubble
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.5, // Staggered start for variety
                      }}
                    />
                  );
                })}
              </div>

              {/* ------------------------------ */}
              {/* Card content container */}
              {/* ------------------------------ */}
              <div className="mx-auto max-w-md relative z-10">
                {/* ------------------------------ */}
                {/* Floating code icon at the top */}
                {/* ------------------------------ */}
                <motion.div
                  animate={{ y: [0, -8, 0] }} // Gentle up/down motion
                  transition={{
                    duration: 3, // Animation duration
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex justify-center items-center w-20 h-20 rounded-full bg-white dark:bg-gray-700 shadow-lg mx-auto border border-indigo-100 dark:border-gray-600"
                >
                  <FiCode className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                </motion.div>

                {/* ------------------------------ */}
                {/* Main title of the card */}
                {/* ------------------------------ */}
                <h3 className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  No Hackathons Found
                </h3>

                {/* ------------------------------ */}
                {/* Subtitle with dynamic message based on filters */}
                {/* ------------------------------ */}
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {searchQuery ||
                  filters.difficulty ||
                  filters.prize ||
                  filters.location
                    ? "No hackathons match your current filters. Try adjusting your search or filters."
                    : "Check back later for exciting new hackathons!"}
                </p>

                {/* ------------------------------ */}
                {/* Buttons container */}
                {/* ------------------------------ */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  {/* ------------------------------ */}
                  {/* Reset Filters Button */}
                  {/* ------------------------------ */}
                  <motion.button
                    whileHover={{ scale: 1.05 }} // Grow slightly on hover
                    whileTap={{ scale: 0.95 }} // Shrink slightly on tap
                    onClick={resetFilters} // Function to reset search/filter
                    className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all"
                  >
                    <FiRotateCw className="w-4 h-4" />
                    Reset Filters
                  </motion.button>

                  {/* ------------------------------ */}
                  {/* Explore Hackathons Button */}
                  {/* ------------------------------ */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {}} // Placeholder function for navigation
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