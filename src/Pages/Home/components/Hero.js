import { motion, useAnimation, AnimatePresence, MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { Search, X, Calendar, Trophy, Code, ExternalLink } from "lucide-react";

// Import mock data
import eventsData from "../../Events/eventsMockData.json";
import hackathonsData from "../../Hackathons/hackathonMockData.json";
import projectsData from "../../Projects/mockProjectsData.json";
import RespawningText from "../../../jhalak/RespawningText";

const Hero = () => {
  const navigate = useNavigate();
  const phrases = [
    "Amazing Tech Events",
    "Exciting Hackathons Today",
    "Innovative Dev Workshops",
    "Cutting-Edge Tech Meetups",
  ];

  const [index, setIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Change phrase every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const controls = useAnimation();

  useEffect(() => {
    controls.start("show");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [controls]);

  // Global search functionality
  const allData = [
    ...eventsData.map((item) => ({
      ...item,
      type: "event",
      searchType: "Events",
    })),
    ...hackathonsData.map((item) => ({
      ...item,
      type: "hackathon",
      searchType: "Hackathons",
    })),
    ...projectsData.map((item) => ({
      ...item,
      type: "project",
      searchType: "Projects",
    })),
  ];

  const fuse = new Fuse(allData, {
    keys: [
      "title",
      "description",
      "location",
      "tags",
      "techStack",
      "category",
      "author",
      "organizer",
      "type",
    ],
    threshold: 0.3,
    includeScore: true,
  });

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = fuse.search(query).slice(0, 8); // Limit to 8 results
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleResultClick = (result, type) => {
    setShowResults(false);
    setSearchQuery("");
    if (type === "event") {
      navigate("/events");
    } else if (type === "hackathon") {
      navigate("/hackathons");
    } else if (type === "project") {
      navigate("/projects");
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case "event":
        return <Calendar className="w-4 h-4" />;
      case "hackathon":
        return <Trophy className="w-4 h-4" />;
      case "project":
        return <Code className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } },
  };

  const fadeUp = {
    hidden: { y: 40, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const floatShape = (i) => ({
    y: [0, -20 - i * 5, 0],
    x: [0, 20 + i * 5, 0],
    rotate: [0, 15, -15, 0],
    transition: { duration: 4.4 + i * 0.7, repeat: Infinity, ease: "easeInOut" },
  });

  const shapes = [
    { size: 42, pos: { top: "10%", left: "5%" }, color: "#dbeafe" },
    { size: 54, pos: { top: "14%", left: "20%" }, color: "#fde68a" },
    { size: 30, pos: { top: "24%", left: "42%" }, color: "#dcfce7" },
    { size: 50, pos: { top: "30%", left: "70%" }, color: "#bae6fd" },
    { size: 40, pos: { top: "52%", left: "10%" }, color: "#fbcfe8" },
    { size: 26, pos: { top: "42%", left: "32%" }, color: "#c7d2fe" },
    { size: 68, pos: { top: "68%", left: "24%" }, color: "#fecdd3" },
    { size: 50, pos: { top: "72%", left: "64%" }, color: "#bbf7d0" },
    { size: 34, pos: { top: "48%", left: "80%" }, color: "#fde68a" },
  ];

  const stats = [
    {
      value: "1500+",
      label: "Developers Joined",
      color: "text-black",
    },
    {
      value: "75",
      label: "Events Organized",
      color: "text-black",
    },
    {
      value: "30+",
      label: "Partners & Sponsors",
      color: "text-black",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-l from-sky-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-16 sm:py-20 md:py-24">
      {/* Floating pastel shapes */}
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          animate={floatShape(i)}
          className="absolute rounded-full"
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            ...shape.pos,
            backgroundColor: shape.color,
            opacity: 0.2,
          }}
        />
      ))}

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center"
          variants={container}
          initial="hidden"
          animate={controls}
          // AOS Implementation (Fallback/Enhancement)
          data-aos="zoom-in"
          data-aos-once="true"
          data-aos-duration="1000"
        >
          <MotionConfig reducedMotion="never">
            {/* Headline */}
            <motion.h1
              className="mx-auto max-w-[92vw] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-5 sm:mb-6 leading-[0.95] sm:leading-tight text-black dark:text-white break-words px-2 sm:px-0"
              style={{ fontFamily: '"Anton", sans-serif' }}
            >
              <motion.span
                className="block text-black dark:text-white mb-2 md:mb-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <RespawningText texts={["Discover & Join", "Innovate & Create", "Learn & Grow"]} />
              </motion.span>

              <div className="relative mx-auto mt-2 sm:mt-3 h-14 sm:h-24 md:h-28 lg:h-32 overflow-hidden flex justify-center items-center max-w-full">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={index}
                    className="block mt-2 text-black dark:text-white mb-4 pb-2 whitespace-normal text-center px-1"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.8, ease: "easeOut" },
                    }}
                    exit={{
                      opacity: 0,
                      y: -40,
                      transition: { duration: 0.5, ease: "easeIn" },
                    }}
                  >
                    {phrases[index]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.h1>
          </MotionConfig>

          {/* Subtext */}
          <motion.p
            variants={fadeUp}
            className="text-sm sm:text-base md:text-lg text-black dark:text-gray-300 max-w-3xl mx-auto mt-2 mb-7 sm:mb-8 px-4 sm:px-0"
          >
            Connect with developers, learn new skills, and grow your network at
            the best tech events, hackathons, and workshops in your area.
          </motion.p>

          {/* Global Search Bar */}
          <motion.div
            variants={fadeUp}
            className="w-full max-w-2xl mx-auto mb-10 sm:mb-12 relative"
          >
            {/* Search Input with Embedded Icons */}
            <div className="relative flex items-center w-full">
              {/* Search Icon */}
              <Search className="absolute left-4 sm:left-5 h-4 w-4 sm:h-5 sm:w-5 z-10 text-gray-400 dark:text-gray-500" />

              {/* Input Field */}
              <input
                type="text"
                placeholder="Search events, hackathons, projects..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full py-3.5 sm:py-4 pl-12 sm:pl-14 pr-12 sm:pr-14 text-base sm:text-lg text-gray-900 dark:text-gray-100 
                 placeholder-gray-500 dark:placeholder-gray-400 
                 bg-white backdrop-blur-xl
                 border-2 border-gray-200 dark:border-gray-700 
                 rounded-full focus:outline-none 
                 focus:ring-4 focus:ring-indigo-500/30 dark:focus:ring-indigo-400/20 
                 focus:border-indigo-500 dark:focus:border-indigo-400 
                 transition-all duration-300 shadow-md hover:shadow-lg"
                onFocus={() => searchQuery && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />

              {/* Clear Button */}
              {searchQuery && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                   className="absolute inset-y-0 right-4 sm:right-5 flex items-center 
                     text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-3 
                   bg-white rounded-3xl 
                   shadow-2xl border border-gray-200 
                   max-h-96 overflow-y-auto z-50"
                >
                  <div className="p-4">
                    {searchResults.length > 0 ? (
                      <>
                        <div className="text-sm text-gray-500 mb-3 font-medium">
                          Search Results ({searchResults.length})
                        </div>
                        <div className="space-y-2">
                          {searchResults.map((result, index) => (
                            <motion.div
                              key={`${result.item.type}-${result.item.id}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() =>
                                handleResultClick(result.item, result.item.type)
                              }
                              className="flex items-center gap-3 p-3 rounded-2xl 
                               hover:bg-gray-50 
                               cursor-pointer transition-colors group"
                            >
                              <div
                                className="flex-shrink-0 p-2 bg-blue-100 rounded-xl text-blue-600 
                                    group-hover:bg-blue-200 transition-colors"
                              >
                                {getResultIcon(result.item.type)}
                              </div>
                              <div className="flex-1 min-w-0 relative">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                                    {result.item.title}
                                  </h4>
                                  <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                                         bg-gray-100 text-gray-600"
                                  >
                                    {result.item.searchType}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 absolute left-0">
                                  {result.item.description?.substring(0, 80)}...
                                </p>
                              </div>
                              <ExternalLink
                                className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors"
                              />
                            </motion.div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="text-center text-gray-500 py-10 text-base"
                      >
                        No results match “
                        <span className="font-medium text-gray-700">
                          {searchQuery}
                        </span>
                        ”
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Buttons */}
          <motion.div
            variants={container}
            className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-12 sm:mb-16"
          >
            {/* Primary Button - Explore Events */}
            <motion.div variants={fadeUp}>
              <Link
                to="/events"
                className="relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-blue-100 dark:bg-blue-900 text-black dark:text-white font-bold shadow-sm overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                <span className="relative z-10 flex items-center">
                  Explore Events
                  <svg
                    className="ml-3 w-5 h-5 text-black dark:text-white transition-transform duration-300 group-hover:translate-x-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </Link>
            </motion.div>

            {/* Secondary Button - Join Hackathons - FIXED */}
            <motion.div variants={fadeUp}>
              <Link
                to="/hackathons"
                className="relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full border border-yellow-200 dark:border-yellow-700 bg-yellow-100 dark:bg-yellow-900 text-black dark:text-white font-semibold shadow-sm hover:shadow-md hover:bg-yellow-200 dark:hover:bg-yellow-800 hover:scale-105 transition-all duration-300"
              >
                Join Hackathons
              </Link>
            </motion.div>

            {/* Optional Tertiary Button - Learn More */}
            <motion.div variants={fadeUp}>
              <Link
                to="/about"
                className="relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-pink-100 dark:bg-pink-900 text-black dark:text-white font-semibold shadow-sm transform transition-all duration-300 hover:scale-105 hover:bg-pink-200 dark:hover:bg-pink-800"
              >
                Learn More
                <svg
                  className="ml-3 w-5 h-5 text-black dark:text-white transition-transform duration-300 group-hover:translate-x-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </motion.div>
          </motion.div>

          {/* Animated Stats Cards */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 text-center shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <p className="text-3xl font-bold mb-2 text-black dark:text-white">
                  {stat.value}
                </p>
                <p className="text-black dark:text-gray-300 text-sm">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
