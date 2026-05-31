import { motion, useAnimation, AnimatePresence, MotionConfig, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { Search, Calendar, Trophy, Code, ExternalLink, Users, Handshake } from "lucide-react";

import useReducedMotion from "../../../hooks/useReducedMotion.js";
import eventsData from "../../Events/eventsMockData.json";
import hackathonsData from "../../Hackathons/hackathonMockData.json";
import projectsData from "../../Projects/mockProjectsData.json";
import ModernSearchInput from "../../../components/common/ModernSearchInput";
import CountUpLib from "react-countup";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import useDebouncedSearch from "../../../hooks/useDebouncedSearch";
import RespawningText from "../../../components/visual/RespawningText";
import SectionErrorBoundary from "../../../components/common/SectionErrorBoundary";

const CountUp = CountUpLib.default || CountUpLib;

const MotionLink = motion(Link);

// ─── STATIC SEARCH INDEX CONFIGURATION ───────────────────────────────────────
const createSearchItem = (item, type, searchType) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  location: item.location,
  tags: item.tags,
  techStack: item.techStack,
  type,
  searchType,
});

const allData = [
  ...eventsData.map((item) => createSearchItem(item, "event", "Events")),
  ...hackathonsData.map((item) => createSearchItem(item, "hackathon", "Hackathons")),
  ...projectsData.map((item) => createSearchItem(item, "project", "Projects")),
];

const fuse = new Fuse(allData, {
  keys: ["title", "description", "location", "tags", "techStack", "category", "author", "organizer", "type"],
  threshold: 0.3,
  includeScore: true,
});

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

  const [isTouch, setIsTouch] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [/*isMobileView*/, setIsMobileView] = useState(false);
  const [statsReady, setStatsReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const { searchTerm, debouncedTerm, setSearchTerm, clear: clearSearchTerm } = useDebouncedSearch("", 300);
  const controls = useAnimation();

  // ─── EFFECTS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    setIsDark(document.documentElement.classList.contains("dark"));
    setIsMobileView(window.innerWidth <= 420);

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const onResize = () => {
      setIsMobileView(window.innerWidth <= 420);
    };

    window.addEventListener("resize", onResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  useEffect(() => {
    controls.start("show");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [controls]);

  useEffect(() => {
    const timer = setTimeout(() => setStatsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (debouncedTerm.trim()) {
      setSearchResults(fuse.search(debouncedTerm).slice(0, 5));
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedTerm]);

  // ─── PARALLAX TRANSFORMS ───────────────────────────────────────────────────
  const yText = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const yStats = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const shapeTransform0 = useTransform(scrollYProgress, [0, 1], [0, 60]);

  // ─── HANDLERS ──────────────────────────────────────────────────────────────
  const handleSearch = useCallback((query) => setSearchTerm(query), [setSearchTerm]);
  const clearSearch = useCallback(() => {
    setShowResults(false);
    clearSearchTerm();
  }, [clearSearchTerm]);

  const getResultHref = (item) => {
    const query = encodeURIComponent(item.title || debouncedTerm);
    const routes = { event: "/events", hackathon: "/hackathons", project: "/projects" };
    return `${routes[item.type] || "/"}?search=${query}`;
  };

  const getResultIcon = (type) => {
    const icons = { event: Calendar, hackathon: Trophy, project: Code };
    const Icon = icons[type] || Search;
    return <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />;
  };

  // ─── ANIMATION VARIANTS ────────────────────────────────────────────────────
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };

  const fadeUp = {
    hidden: { y: 32, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: prefersReducedMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const floatShape = (i) => ({
    y: [0, -15 - i * 4, 0],
    x: [0, 12 + i * 3, 0],
    rotate: [0, 8, -8, 0],
    transition: {
      duration: prefersReducedMotion ? 0 : 5 + i * 0.5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: i * 0.2,
    },
  });

  // ─── CONFIG ────────────────────────────────────────────────────────────────
  // Decorative shapes removed for a clean, professional look
  const stats = [
    { value: 1500, label: "Developers", suffix: "+", icon: Users },
    { value: 75, label: "Events", suffix: "+", icon: Calendar },
    { value: 30, label: "Partners", suffix: "+", icon: Handshake },
  ];

  const primaryBtn = "relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900";

  return (
    <section
      ref={containerRef}
      aria-label="Hero section"
      className="relative overflow-hidden text-slate-900 pb-16 sm:pb-20 md:pb-24 border-b border-gray-100"
      style={{
        background: 'linear-gradient(180deg,#F8FBFD 0%, #F3F7FA 10%, #EAF1F7 42%, #dae3ed 100%)',
      }}
    >
      {/* Subtle decorative blurred accents for professional depth */}
      <div aria-hidden className="absolute inset-0 pointer-events-none -z-10">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.2) 100%)' }} />
        <div style={{ position: 'absolute', top: 12, left: 28, width: 260, height: 160, borderRadius: '50%', background: '#E6F0F7', filter: 'blur(36px)', opacity: 0.8 }} />
        <div style={{ position: 'absolute', top: 36, right: 80, width: 180, height: 120, borderRadius: '50%', background: '#EFF6FB', filter: 'blur(28px)', opacity: 0.7 }} />
        <div style={{ position: 'absolute', bottom: 20, left: '12%', width: 220, height: 90, borderRadius: '50%', background: '#F7FAFC', filter: 'blur(20px)', opacity: 0.85 }} />
      </div>

      {/* Hero Content */}
      <motion.div
        className="relative z-10 pt-20 sm:pt-24 md:pt-28 px-4 sm:px-6 lg:px-8"
        style={{
          y: isTouch || prefersReducedMotion ? 0 : yText,
          opacity: isTouch ? 1 : opacityHero,
          willChange: "transform, opacity",
        }}
      >
        <motion.div
          className="max-w-5xl mx-auto text-center"
          variants={container}
          initial="hidden"
          animate={controls}
        >
            <MotionConfig reducedMotion="never">
            {/* Headline: simplified for a professional tone */}
            <motion.h1
              className="flex flex-col items-center gap-3 text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight"
              style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
            >
              <motion.span
                className="block text-gray-500 text-sm font-medium"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
              >
                <RespawningText texts={["Discover & Join", "Innovate & Create", "Learn & Grow"]} />
              </motion.span>

              <div className="relative w-full min-h-20 sm:min-h-24 md:min-h-24 overflow-hidden flex justify-center items-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={index}
                    className="block text-gray-900 font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0 : 0.6, ease: "easeOut" } }}
                    exit={{ opacity: 0, y: -16, transition: { duration: prefersReducedMotion ? 0 : 0.3, ease: "easeIn" } }}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
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
            className="text-base sm:text-lg md:text-lg text-gray-600 max-w-3xl mx-auto mt-4 sm:mt-6 mb-8 sm:mb-10 leading-relaxed"
          >
            Connect with developers, learn new skills, and grow your network at curated tech events, hackathons, and workshops.
          </motion.p>

          {/* Global Search Bar */}
          <motion.div variants={fadeUp} className="w-full max-w-2xl mx-auto mb-10">
            <div className="relative">
              <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm">
                <ModernSearchInput
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search events, hackathons, projects..."
                  onFocus={() => searchTerm && setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  className="bg-transparent border-0 focus:ring-0 text-gray-700 placeholder-gray-400"
                >
                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {showResults && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50"
                        role="listbox"
                        aria-label="Search results"
                      >
                        <div className="p-3">
                          {searchResults.length > 0 ? (
                            <>
                              <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Results ({searchResults.length})
                              </div>
                              <div className="space-y-1">
                                {searchResults.map((result, idx) => (
                                  <MotionLink
                                    key={`${result.item.type}-${result.item.id}`}
                                    to={getResultHref(result.item)}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={clearSearch}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group text-left no-underline"
                                    role="option"
                                    aria-label={`Open ${result.item.title}`}
                                  >
                                      <div className="shrink-0 p-2 bg-gray-100 rounded-lg text-gray-700 group-hover:scale-105 transition-transform">
                                      {getResultIcon(result.item.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                          {result.item.title}
                                        </h4>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                                          {result.item.searchType}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                        {result.item.description?.substring(0, 70)}...
                                      </p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors shrink-0" aria-hidden="true" />
                                  </MotionLink>
                                ))}
                              </div>
                            </>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm"
                            >
                              No results for <span className="font-medium text-gray-700 dark:text-gray-200">&quot;{searchTerm}&quot;</span>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ModernSearchInput>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          {!searchTerm.trim() && (
            <SectionErrorBoundary label="Statistics">
                    <motion.div
                      variants={fadeUp}
                      style={{ y: isTouch || prefersReducedMotion ? 0 : yStats, willChange: "transform" }}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto"
                      role="region"
                      aria-label="Platform statistics"
                    >
                      {stats.map((stat, i) => (
                        <motion.div
                          key={i}
                          variants={fadeUp}
                          whileHover={{ y: -2, transition: { duration: 0.15 } }}
                          className="flex flex-col items-center justify-center p-4 sm:p-5 bg-white rounded-md border border-gray-100 shadow-sm transition-shadow"
                        >
                          <div className="mb-2 rounded-full bg-gray-100 p-2 text-gray-700">
                            <stat.icon className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <p className="text-2xl sm:text-3xl font-semibold mb-1 text-gray-900 tabular-nums">
                            {statsReady ? (
                              <CountUp start={0} end={Number.isFinite(stat.value) ? stat.value : 0} duration={2.2} suffix={stat.suffix || ""} />
                            ) : (
                              <>
                                {stat.value}
                                {stat.suffix || ""}
                              </>
                            )}
                          </p>
                          <p className="text-gray-600 text-xs sm:text-sm font-medium uppercase tracking-wider text-center">
                            {stat.label}
                          </p>
                        </motion.div>
                      ))}
                    </motion.div>
            </SectionErrorBoundary>
          )}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
      >
        <span className="text-xs font-medium">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-current rounded-full flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 bg-current rounded-full" animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
