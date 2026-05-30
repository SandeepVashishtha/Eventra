import { motion, useAnimation, AnimatePresence, MotionConfig, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { Search, Calendar, Trophy, Code, ExternalLink, ArrowRight } from "lucide-react";

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

  const shapeTransform0 = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const shapeTransform1 = useTransform(scrollYProgress, [0, 1], [0, -135]);
  const shapeTransform2 = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const shapeTransform3 = useTransform(scrollYProgress, [0, 1], [0, -105]);
  const shapeTransform4 = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const shapeTransform5 = useTransform(scrollYProgress, [0, 1], [0, -75]);
  const shapeTransform6 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const shapeTransform7 = useTransform(scrollYProgress, [0, 1], [0, -45]);
  const shapeTransform8 = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const shapeTransforms = [
    shapeTransform0,
    shapeTransform1,
    shapeTransform2,
    shapeTransform3,
    shapeTransform4,
    shapeTransform5,
    shapeTransform6,
    shapeTransform7,
    shapeTransform8,
  ];

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
    return <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />;
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
  const shapes = [
    { size: 42, pos: { top: "10%", left: "5%" }, light: "#3b82f6", dark: "#60a5fa" },
    { size: 54, pos: { top: "14%", left: "20%" }, light: "#f59e0b", dark: "#fbbf24" },
    { size: 30, pos: { top: "24%", left: "42%" }, light: "#22c55e", dark: "#4ade80" },
    { size: 50, pos: { top: "30%", left: "70%" }, light: "#0ea5e9", dark: "#38bdf8" },
    { size: 40, pos: { top: "52%", left: "10%" }, light: "#ec4899", dark: "#f472b6" },
    { size: 26, pos: { top: "42%", left: "32%" }, light: "#8b5cf6", dark: "#a78bfa" },
    { size: 68, pos: { top: "68%", left: "24%" }, light: "#f43f5e", dark: "#fb7185" },
    { size: 50, pos: { top: "72%", left: "64%" }, light: "#10b981", dark: "#34d399" },
    { size: 34, pos: { top: "48%", left: "80%" }, light: "#eab308", dark: "#fcd34d" },
  ];

  const stats = [
    { value: 1500, label: "Developers", suffix: "+" },
    { value: 75, label: "Events", suffix: "+" },
    { value: 30, label: "Partners", suffix: "+" },
  ];

  const primaryBtn = "relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900";
  const secondaryBtn = `${primaryBtn} border border-transparent`;

  return (
    <section
      ref={containerRef}
      aria-label="Hero section"
      className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-indigo-50/40 to-white dark:from-slate-950 dark:via-slate-900/80 dark:to-black text-slate-900 dark:text-gray-100 pb-16 sm:pb-20 md:pb-24 border-b border-gray-100/60 dark:border-slate-800/60"
    >
      {/* Decorative Parallax Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        {!isTouch &&
          shapes.map((shape, i) => {
            const color = isDark ? shape.dark : shape.light;
            return (
              <motion.div
                key={i}
                style={{
                  position: "absolute",
                  top: shape.pos.top,
                  left: shape.pos.left,
                  width: shape.size,
                  height: shape.size,
                  borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                  background: `linear-gradient(135deg, ${color}22, ${color}66)`,
                  filter: "blur(1px)",
                  boxShadow: `0 8px 32px 0 ${color}15`,
                  y: prefersReducedMotion ? 0 : shapeTransforms[i],
                  willChange: "transform",
                }}
                animate={prefersReducedMotion ? {} : floatShape(i)}
              />
            );
          })}
      </div>

      {/* Hero Content */}
      <motion.div
        className="relative z-10 pt-16 sm:pt-20 md:pt-24 px-4 sm:px-6 lg:px-8"
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
            {/* Headline */}
            <motion.h1
              className="flex flex-col items-center gap-4 sm:gap-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight"
              style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
            >
              <motion.span
                className="block text-gray-600 dark:text-gray-400 text-base sm:text-lg md:text-xl font-medium"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <RespawningText texts={["Discover & Join", "Innovate & Create", "Learn & Grow"]} />
              </motion.span>

              <span className="block sm:hidden text-indigo-600 dark:text-indigo-400 font-extrabold text-xl">
                {phrases[index]}
              </span>

              <div className="relative w-full min-h-[6rem] sm:min-h-[7rem] md:min-h-[8rem] overflow-hidden flex justify-center items-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={index}
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-sm"
                    initial={{ opacity: 0, y: 32, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: prefersReducedMotion ? 0 : 0.7, ease: "easeOut" } }}
                    exit={{ opacity: 0, y: -24, filter: "blur(4px)", transition: { duration: prefersReducedMotion ? 0 : 0.4, ease: "easeIn" } }}
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
            className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mt-4 sm:mt-6 mb-8 sm:mb-10 leading-relaxed"
          >
            Connect with developers, learn new skills, and grow your network at the best{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">tech events</span>,{" "}
            <span className="font-semibold text-purple-600 dark:text-purple-400">hackathons</span>, and{" "}
            <span className="font-semibold text-pink-600 dark:text-pink-400">workshops</span> in your area.
          </motion.p>

          {/* Global Search Bar */}
          <motion.div variants={fadeUp} className="w-full max-w-2xl mx-auto mb-10">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500" aria-hidden="true" />
              <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-gray-200/60 dark:border-slate-700/60 rounded-2xl shadow-lg">
                <ModernSearchInput
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search events, hackathons, projects..."
                  onFocus={() => searchTerm && setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  className="bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                >
                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {showResults && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 max-h-80 overflow-y-auto z-50"
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
                                    <div className="flex-shrink-0 p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
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
                                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" aria-hidden="true" />
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
                              No results for{" "}
                              <span className="font-medium text-gray-700 dark:text-gray-200">"{searchTerm}"</span>
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

          {/* Action Buttons */}
          <motion.div variants={container} className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-5 mb-14">
            {[
              { to: "/events", label: "Explore Events", icon: "/assets/events.svg", color: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500", darkColor: "dark:bg-blue-700 dark:hover:bg-blue-600" },
              { to: "/hackathons", label: "Join Hackathons", icon: "/assets/hackathons.svg", color: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400", darkColor: "dark:bg-amber-600 dark:hover:bg-amber-500" },
              { to: "/about", label: "Learn More", icon: "/assets/learnmore.svg", color: "bg-pink-600 hover:bg-pink-700 focus:ring-pink-500", darkColor: "dark:bg-pink-700 dark:hover:bg-pink-600" },
            ].map((btn, i) => (
              <motion.div key={btn.to} variants={fadeUp}>
                <Link
                  to={btn.to}
                  className={`${secondaryBtn} ${btn.color} ${btn.darkColor} text-white shadow-lg shadow-${btn.color.split('-')[1]}-200/40 dark:shadow-none`}
                  aria-label={btn.label}
                >
                  <img src={btn.icon} alt="" className="w-5 h-5" aria-hidden="true" />
                  <span>{btn.label}</span>
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </motion.div>
            ))}
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
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="flex flex-col items-center justify-center p-5 sm:p-6 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-3xl sm:text-4xl font-black mb-1.5 text-gray-900 dark:text-white tabular-nums">
                      {statsReady ? (
                        <CountUp start={0} end={Number.isFinite(stat.value) ? stat.value : 0} duration={2.2} suffix={stat.suffix || ""} />
                      ) : (
                        <>
                          {stat.value}
                          {stat.suffix || ""}
                        </>
                      )}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-semibold uppercase tracking-wider text-center">
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
