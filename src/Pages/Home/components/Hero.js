import { motion, useAnimation, AnimatePresence, MotionConfig, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { Search, Calendar, Trophy, Code, ExternalLink } from "lucide-react";

import useReducedMotion from "../../../hooks/useReducedMotion.js";
// Import mock data
import eventsData from "../../Events/eventsMockData.json";
import hackathonsData from "../../Hackathons/hackathonMockData.json";
import projectsData from "../../Projects/mockProjectsData.json";
import RespawningText from "../../../components/visual/RespawningText";
import ModernSearchInput from "../../../components/common/ModernSearchInput";
import CountUp from "react-countup";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import SectionErrorBoundary from "../../../components/common/SectionErrorBoundary";
import useDebouncedSearch from "../../../hooks/useDebouncedSearch";

const MotionLink = motion(Link);

// ─── STATIC SEARCH INDEX CONFIGURATION ───────────────────────────────────────
// Moved outside component to prevent expensive re-instantiation on every render
const createSearchItem = (item, type, searchType) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  location: item.location,
  tags: item.tags,
  techStack: item.techStack,
  category: item.category,
  author: item.author,
  organizer: item.organizer,
  searchType,
  type,
});

const allData = [
  ...eventsData.map((item) => createSearchItem(item, "event", "Events")),
  ...hackathonsData.map((item) => createSearchItem(item, "hackathon", "Hackathons")),
  ...projectsData.map((item) => createSearchItem(item, "project", "Projects")),
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
// ─────────────────────────────────────────────────────────────────────────────

const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  useDocumentTitle("Eventra | Home");
  const phrases = [
    "Amazing Tech Events",
    "Exciting Hackathons Today",
    "Innovative Dev Workshops",
    "Cutting-Edge Tech Meetups",
  ];

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Check if device has pointer: coarse (touch screen) to preserve native feel
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Parallax scroll-driven transforms (only active on non-touch devices to ensure hardware performance)
  const yText = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const yStats = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Different parallax speeds for each shape
  const yShape0 = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const yShape1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const yShape2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const yShape3 = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const yShape4 = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const yShape5 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const yShape6 = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const yShape7 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const yShape8 = useTransform(scrollYProgress, [0, 1], [0, 70]);

  const shapeTransforms = [yShape0, yShape1, yShape2, yShape3, yShape4, yShape5, yShape6, yShape7, yShape8];

  const [index, setIndex] = useState(0);
  const { searchTerm, debouncedTerm, setSearchTerm, clear: clearSearchTerm } = useDebouncedSearch("", 300);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [statsReady, setStatsReady] = useState(false);
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 420 : false
  );
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  // Sync isDark with theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Change phrase every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  const controls = useAnimation();

  useEffect(() => {
    controls.start("show");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [controls]);

  useEffect(() => {
    const timeoutRef = { current: null };

    const onResize = () => {
      if (typeof window === "undefined") return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setIsMobileView(window.innerWidth <= 420);
      }, 150);
    };

    window.addEventListener("resize", onResize);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // FIXED
useEffect(() => {
  const timer = setTimeout(() => setStatsReady(true), 100);
  return () => clearTimeout(timer);
}, []);

  // Watch the debounced term and execute the search logic
  useEffect(() => {
    if (debouncedTerm.trim()) {
      const results = fuse.search(debouncedTerm).slice(0, 8);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedTerm]);

  const handleSearch = (query) => {
    setSearchTerm(query);
  };

  const clearSearch = () => {
    setShowResults(false);
    clearSearchTerm();
  };

  const getResultHref = (item) => {
    const query = encodeURIComponent(item.title || debouncedTerm);
    if (item.type === "event") return `/events?search=${query}`;
    if (item.type === "hackathon") return `/hackathons?search=${query}`;
    if (item.type === "project") return `/projects?search=${query}`;
    return "/";
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
    show: { y: 0, opacity: 1, transition: { duration: prefersReducedMotion ? 0 : 0.8, ease: "easeOut" } },
  };

  const floatShape = (i) => ({
    y: [0, -20 - i * 5, 0],
    x: [0, 20 + i * 5, 0],
    rotate: [0, 15, -15, 0],
    transition: { duration: prefersReducedMotion ? 0 : 4.4 + i * 0.7, repeat: Infinity, ease: "easeInOut" },
  });

  // Vibrant colors for light mode, soft pastels for dark mode
  const shapes = [
    { size: 42, pos: { top: "10%", left: "5%" }, lightColor: "#3b82f6", darkColor: "#dbeafe" },
    { size: 54, pos: { top: "14%", left: "20%" }, lightColor: "#f59e0b", darkColor: "#fde68a" },
    { size: 30, pos: { top: "24%", left: "42%" }, lightColor: "#22c55e", darkColor: "#dcfce7" },
    { size: 50, pos: { top: "30%", left: "70%" }, lightColor: "#0ea5e9", darkColor: "#bae6fd" },
    { size: 40, pos: { top: "52%", left: "10%" }, lightColor: "#ec4899", darkColor: "#fbcfe8" },
    { size: 26, pos: { top: "42%", left: "32%" }, lightColor: "#8b5cf6", darkColor: "#c7d2fe" },
    { size: 68, pos: { top: "68%", left: "24%" }, lightColor: "#f43f5e", darkColor: "#fecdd3" },
    { size: 50, pos: { top: "72%", left: "64%" }, lightColor: "#10b981", darkColor: "#bbf7d0" },
    { size: 34, pos: { top: "48%", left: "80%" }, lightColor: "#eab308", darkColor: "#fde68a" },
  ];

  const stats = [
    { value: 1500, label: "Developers Joined", suffix: "+" },
    { value: 75, label: "Events Organized", suffix: "+" },
    { value: 30, label: "Partners & Sponsors", suffix: "+" },
  ];

  return (
    <section
      ref={containerRef}
      aria-label="Hero section"
      className="relative overflow-hidden 
bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white
dark:from-slate-950 dark:via-slate-900 dark:to-black
text-slate-900 dark:text-gray-100 
pb-16 sm:pb-20 md:pb-24
border-b border-gray-100 dark:border-slate-900">
      {/* Decorative Parallax Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {!isTouch && shapes.map((shape, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              top: shape.pos.top,
              left: shape.pos.left,
              width: shape.size,
              height: shape.size,
              borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%", // Organic blob shape
              background: `linear-gradient(135deg, ${isDark ? shape.darkColor : shape.lightColor}22, ${isDark ? shape.darkColor : shape.lightColor}66)`,
              filter: "blur(2px)",
              boxShadow: `0 8px 32px 0 ${isDark ? shape.darkColor : shape.lightColor}0a`,
              y: prefersReducedMotion ? 0 : shapeTransforms[i],
              willChange: "transform",
            }}
            animate={prefersReducedMotion ? {} : floatShape(i)}
          />
        ))}
      </div>

      {/* Hero Content */}
      <motion.div 
        className="mx-auto px-6 lg:px-8 relative z-10 pt-20"
       style={{
  backgroundImage: isDark
    ? "url('/background-dark.png')"
    : "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          width: "100%",
           y: (isTouch || prefersReducedMotion) ? 0 : yText,
          opacity: isTouch ? 1 : opacityHero,
          willChange: "transform, opacity",
        }}
      >
        <motion.div
          className="text-center"
          variants={container}
          initial="hidden"
          animate={controls}
          data-aos="zoom-in"
          data-aos-once="true"
          data-aos-duration="1000"
        >
          <MotionConfig reducedMotion="never">
            {/* Headline */}
            <motion.h1
              className="mx-auto max-w-4xl mt-6 flex flex-col items-center gap-5 sm:gap-6 text-lg sm:text-xl md:text-4xl lg:text-5xl font-black mb-6 leading-relaxed tracking-tight text-gray-900 dark:text-white px-2 sm:px-0 text-center overflow-visible"
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              <motion.span
                className="block text-gray-900 dark:text-gray-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <RespawningText texts={["Discover & Join", "Innovate & Create", "Learn & Grow"]} />
              </motion.span>

              {/* Static phrase for smallest screens (no motion) */}
              <span className="block sm:hidden text-indigo-600 dark:text-indigo-500 font-extrabold drop-shadow-sm mt-3 text-lg text-center">
                {phrases[index]}
              </span>

              <div className="relative mx-auto w-full min-h-[7.5rem] sm:min-h-[9rem] md:min-h-[10rem] lg:min-h-[11rem] overflow-hidden flex justify-center items-center max-w-full px-1 mt-2 py-4 ">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={index}
                    className="block mt-2 text-gray-900 dark:text-white mb-4 pb-4 whitespace-normal text-center px-1 leading-tight"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { duration: prefersReducedMotion ? 0 : 0.8, ease: "easeOut" },
                    }}
                    exit={{
                      opacity: 0,
                      y: -40,
                      transition: { duration: prefersReducedMotion ? 0 : 0.5, ease: "easeIn" },
                    }}
                  >
                    <span className="text-indigo-600 dark:text-indigo-500 font-extrabold drop-shadow-sm text-2xl sm:text-3xl md:text-5xl lg:text-6xl">
                      {phrases[index]}
                    </span>
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.h1>
          </MotionConfig>

          {/* Subtext */}
          <motion.p
            variants={fadeUp}
            className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mt-2 mb-7 sm:mb-8 px-4 sm:px-0"
          >
            Connect with developers, learn new skills, and grow your network at
            the best tech events, hackathons, and workshops in your area.
          </motion.p>

          {/* Global Search Bar (Glassmorphism) */}
          <div className="w-full max-w-2xl mx-auto mb-10 p-2 sm:p-2.5 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-indigo-500/5">
            <ModernSearchInput
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search events, hackathons, projects..."
              onFocus={() => searchTerm && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
            >
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                    className="absolute top-full left-0 right-0 mt-3 
                     bg-white dark:bg-slate-900
rounded-xl
shadow-2xl
border border-gray-200 dark:border-slate-700
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
                              <MotionLink
                                key={`${result.item.type}-${result.item.id}`}
                                to={getResultHref(result.item)}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={clearSearch}
                                className="flex items-center gap-3 p-3 rounded-lg 
                                 hover:bg-gray-50 dark:hover:bg-slate-800
                                 cursor-pointer transition-colors group text-left no-underline"
                                aria-label={`Open ${result.item.title} in ${result.item.searchType || result.item.type || "page"
                                  }`}
                              >
                                <div className="flex-shrink-0 p-2 bg-blue-100 rounded-xl text-blue-600 group-hover:bg-blue-200 transition-colors">
                                  {getResultIcon(result.item.type)}
                                </div>
                                <div className="flex-1 min-w-0 relative">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                      {result.item.title}
                                    </h4>
                                    <span
                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                                           bg-gray-100 dark:bg-slate-800
text-gray-600 dark:text-gray-300"
                                    >
                                      {result.item.searchType}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {result.item.description?.substring(0, 80)}...
                                  </p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              </MotionLink>
                            ))}
                          </div>
                        </>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: "easeOut" }}
                          className="text-center text-gray-500 dark:text-gray-400 py-10 text-base"
                        >
                          No results match "
                          <span className="font-medium text-gray-700 dark:text-white">
                            {searchTerm}
                          </span>
                          "
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ModernSearchInput>
          </div>

          {/* Professional Buttons */}
          <motion.div
            variants={container}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-16"
          >
            <motion.div variants={fadeUp}>
              <Link
                to="/events"
                aria-label="Explore upcoming tech events"
                className="relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-blue-500 dark:bg-blue-900 text-white dark:text-white font-bold shadow-md shadow-blue-200 dark:shadow-none overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:bg-blue-600 dark:hover:bg-blue-800"
              >
                <span className="relative z-10 flex items-center">
                  <img src="/assets/events.svg" alt="events" className="mr-2"/>
                  Explore Events
                  <svg
                    className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"
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

            <motion.div variants={fadeUp}>
              <Link
                to="/hackathons"
                aria-label="Join upcoming hackathons"
                className="relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-amber-400 dark:bg-yellow-900 border border-amber-300 dark:border-yellow-700 text-white dark:text-white font-semibold shadow-md shadow-amber-100 dark:shadow-none hover:shadow-lg hover:bg-amber-500 dark:hover:bg-yellow-800 hover:scale-105 transition-all duration-300"
              >
                <img src="/assets/hackathons.svg" alt="hackathons" className="mr-2"/>
                Join Hackathons
                <svg
                    className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"
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

            {/* Tertiary Button - Learn More */}
            <motion.div variants={fadeUp}>
              <Link
                to="/about"
                aria-label="Learn more about Eventra"
                className="relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-pink-500 dark:bg-pink-900 text-white dark:text-white font-semibold shadow-md shadow-pink-100 dark:shadow-none transform transition-all duration-300 hover:scale-105 hover:bg-pink-600 dark:hover:bg-pink-800"
              >
                <img src="/assets/learnmore.svg" alt="learn more" className="mr-2"/>
                Learn More
                <svg
                  className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"
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
          {!searchTerm.trim() && (
            <SectionErrorBoundary label="Statistics">
            <motion.div
              variants={fadeUp}
              style={{
                y: (isTouch || prefersReducedMotion) ? 0 : yStats,
                willChange: "transform",
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
              role="region"
              aria-label="Platform statistics"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  whileHover={{ y: -5 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                  className="flex flex-col items-center justify-center p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-slate-800/80 shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300"
                >
                  
                  <p className="text-4xl font-extrabold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                    {statsReady ? (
                      // AFTER
<CountUp
  start={0}
  end={Number.isFinite(stat.value) ? stat.value : 0}
  duration={2.5}
  suffix={stat.suffix || ""}
/>
                    ) : (
                      <>
                        {stat.value}
                        {stat.suffix || ""}
                      </>
                    )}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
            </SectionErrorBoundary>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;

