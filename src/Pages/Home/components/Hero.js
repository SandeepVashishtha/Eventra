import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggleButton from "../../../components/common/ThemeToggleButton";
import Fuse from "fuse.js";
import { Search, X, Calendar, Trophy, Code, ExternalLink } from "lucide-react";

// Import mock data
import eventsData from "../../Events/eventsMockData.json";
import hackathonsData from "../../Hackathons/hackathonMockData.json";
import projectsData from "../../Projects/mockProjectsData.json";

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
    ...eventsData.map(item => ({ ...item, type: 'event', searchType: 'Events' })),
    ...hackathonsData.map(item => ({ ...item, type: 'hackathon', searchType: 'Hackathons' })),
    ...projectsData.map(item => ({ ...item, type: 'project', searchType: 'Projects' }))
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
      "type"
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
    if (type === 'event') {
      navigate('/events');
    } else if (type === 'hackathon') {
      navigate('/hackathons');
    } else if (type === 'project') {
      navigate('/projects');
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'hackathon': return <Trophy className="w-4 h-4" />;
      case 'project': return <Code className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
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
    transition: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
  });

  const shapes = [
    {
      size: 60,
      pos: { top: "5%", left: "10%" },
      color: "from-indigo-400 to-blue-400",
    },
    {
      size: 80,
      pos: { top: "15%", right: "15%" },
      color: "from-purple-400 to-pink-400",
    },
    {
      size: 100,
      pos: { bottom: "5%", left: "20%" },
      color: "from-blue-300 to-indigo-300",
    },
    {
      size: 70,
      pos: { bottom: "10%", right: "10%" },
      color: "from-pink-300 to-purple-300",
    },
    {
      size: 50,
      pos: { top: "50%", left: "2%" },
      color: "from-indigo-300 to-blue-200",
    },
  ];

  const stats = [
    { value: "1500+", label: "Developers Joined", color: "text-indigo-500 dark:text-indigo-400" },
    { value: "75", label: "Events Organized", color: "text-pink-500 dark:text-pink-400" },
    { value: "30+", label: "Partners & Sponsors", color: "text-purple-500 dark:text-purple-400" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 xl:py-28 py-24">
      {/* Floating Gradient Shapes */}
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          animate={floatShape(i)}
          // Reduced shape opacity in dark mode for a subtler effect
          className={`absolute rounded-full bg-gradient-to-tr ${shape.color} opacity-30 dark:opacity-10`}
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            ...shape.pos,
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
          {/* Headline */}
          <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-snug">
            <motion.span
              // Main headline text color
              className="block text-gray-900 dark:text-gray-100 mb-2 md:mb-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Discover & Join
            </motion.span>

            <div className="relative mt-3 h-16 sm:h-20 md:h-24 lg:h-28 overflow-hidden flex justify-center items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={index}
                  // Animated text gradient for dark mode
                  className="text-2xl mt-2 sm:text-3xl md:text-4xl lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 via-blue-500 to-purple-700 dark:from-indigo-400 dark:via-blue-400 dark:to-purple-500 mb-4 pb-2"
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

          {/* Subtext */}
          <motion.p
            variants={fadeUp}
            // Subtext color
            className="text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mt-2 mb-8"
          >
            "Connect with developers, learn new skills, and grow your network at
            the best tech events, hackathons, and workshops in your area."
          </motion.p>

          {/* Global Search Bar */}
          <motion.div
            variants={fadeUp}
            className="w-full max-w-2xl mx-auto mb-12 relative"
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center z-10 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors duration-300" />
              </div>

              <input
                type="text"
                placeholder="Search events, hackathons, projects..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-14 pr-12 py-4 text-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 shadow-lg hover:shadow-xl"
                onFocus={() => searchQuery && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />

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
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showResults && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl pb-12 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50"
                >
                  <div className="p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium">
                      Search Results ({searchResults.length})
                    </div>
                    <div className="space-y-2">
                      {searchResults.map((result, index) => (
                        <motion.div
                          key={`${result.item.type}-${result.item.id}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleResultClick(result.item, result.item.type)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group"
                        >
                          <div className="flex-shrink-0 p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 transition-colors">
                            {getResultIcon(result.item.type)}
                          </div>
                          <div className="flex-1 min-w-0 relative">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {result.item.title}
                              </h4>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {result.item.searchType}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 absolute left-0">
                              {result.item.description?.substring(0, 80)}...
                            </p> 
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                        </motion.div>
                      ))}
                    </div>
                    {searchResults.length >= 8 && (
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => {
                            setShowResults(false);
                            navigate('/events');
                          }}
                          className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                        >
                          View all results →
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Buttons */}
          <motion.div
            variants={container}
            className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
          >
            {/* Primary Button - Explore Events */}
            <motion.div variants={fadeUp}>
              <Link
                to="/events"
                className="relative inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold shadow-lg overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <span className="relative z-10 flex items-center">
                  Explore Events
                  <svg
                    className="ml-3 w-5 h-5 text-white transition-transform duration-300 group-hover:translate-x-2"
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
                {/* Glow effect */}
                <span className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-30 transition-opacity"></span>
              </Link>
            </motion.div>

            {/* Secondary Button - Join Hackathons - FIXED */}
            <motion.div variants={fadeUp}>
              <Link
                to="/hackathons"
                className="relative inline-flex items-center px-8 py-4 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold shadow hover:shadow-lg hover:bg-gray-100 hover:text-gray-900 hover:dark:bg-gray-700 hover:dark:text-white hover:scale-105 transition-all duration-300"
              >
                Join Hackathons
              </Link>
            </motion.div>

            {/* Optional Tertiary Button - Learn More */}
            <motion.div variants={fadeUp}>
              <Link
                to="/about"
                className="relative inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                Learn More
                <svg
                  className="ml-3 w-5 h-5 text-white transition-transform duration-300 group-hover:translate-x-2"
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
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                // Stat card background for dark "glassmorphism" effect
                className="bg-white/30 dark:bg-gray-700/30 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg"
              >
                <p className={`text-3xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </p>
                {/* Stat label text */}
                <p className="text-gray-700 dark:text-gray-300 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;