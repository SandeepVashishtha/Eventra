import { motion, useAnimation, AnimatePresence, MotionConfig, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { Calendar, Code, ExternalLink, Handshake, Search, Trophy, Users } from "lucide-react";
import CountUpLib from "react-countup";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import ErrorBoundary from "../../../components/common/ErrorBoundary";
import ModernSearchInput from "../../../components/common/ModernSearchInput";
import RespawningText from "../../../components/visual/RespawningText";
import useDebouncedSearch from "../../../hooks/useDebouncedSearch";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import useReducedMotion from "../../../hooks/useReducedMotion.js";
import eventsData from "../../Events/eventsMockData.json";
import hackathonsData from "../../Hackathons/hackathonMockData.json";
import projectsData from "../../Projects/mockProjectsData.json";

const CountUp = CountUpLib.default || CountUpLib;

// ─── FLOATING SHAPE SUB-COMPONENT ────────────────────────────────────────────
// Fix for #7243: Each shape owns its own useTransform hook call at the top
// level of its own component — hooks must never be called inside .map() loops.
/**
 * @param {{ shape: object, index: number, scrollYProgress: object, isDark: boolean, floatShape: function, prefersReducedMotion: boolean }} props
 */
const PARALLAX_OFFSETS = [220, -150, 100, -180, 130, -80, 250, -120, 70];

const FloatingShape = ({ shape, index, scrollYProgress, isDark, floatShape, prefersReducedMotion }) => {
  const yShape = useTransform(scrollYProgress, [0, 1], [0, PARALLAX_OFFSETS[index]]);

  return (
    <motion.div
      style={{
        position: "absolute",
        top: shape.pos.top,
        left: shape.pos.left,
        width: shape.size,
        height: shape.size,
        borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
        background: `linear-gradient(135deg, ${isDark ? shape.darkColor : shape.lightColor}22, ${isDark ? shape.darkColor : shape.lightColor}66)`,
        filter: "blur(2px)",
        boxShadow: `0 8px 32px 0 ${isDark ? shape.darkColor : shape.lightColor}0a`,
        y: prefersReducedMotion ? 0 : yShape,
        willChange: "transform",
      }}
      animate={prefersReducedMotion ? {} : floatShape(index)}
    />
  );
};
// ─────────────────────────────────────────────────────────────────────────────

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

const allSearchItems = [
  ...eventsData.map((item) => createSearchItem(item, "event", "Events")),
  ...hackathonsData.map((item) => createSearchItem(item, "hackathon", "Hackathons")),
  ...projectsData.map((item) => createSearchItem(item, "project", "Projects")),
];

const SEARCH_RESULT_LIMIT = 8;

const SEARCH_ROUTES = {
  event: "/events",
  hackathon: "/hackathons",
  project: "/projects",
};

const SEARCH_ICONS = {
  event: Calendar,
  hackathon: Trophy,
  project: Code,
};

const MotionLink = motion(Link);

const searchIndex = new Fuse(allSearchItems, {
  keys: ["title", "description", "location", "tags", "techStack", "category", "author", "organizer", "type"],
  threshold: 0.3,
  includeScore: true,
});

const getResultHref = (item, fallbackTerm) => {
  const query = encodeURIComponent(item.title || fallbackTerm);
  return `${SEARCH_ROUTES[item.type] || "/"}?search=${query}`;
};

const getResultIcon = (type) => {
  const Icon = SEARCH_ICONS[type] || Search;
  return <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />;
};

const Hero = () => {
  const { t, i18n } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimation();

  const phrases = useMemo(
    () => t("landing.hero.phrases", { returnObjects: true }),
    [t, i18n.language]
  );
  const TAGLINE_TEXTS = useMemo(
    () => t("landing.hero.taglines", { returnObjects: true }),
    [t, i18n.language]
  );

  const SEARCH_ROUTES = {
    event: "/events",
    hackathon: "/hackathons",
    project: "/projects",
  };

  const SEARCH_ICONS = {
    event: Calendar,
    hackathon: Trophy,
    project: Code,
  };
  
  useDocumentTitle("Eventra | Home");

  const containerRef = useRef(null);

  const [isTouch, setIsTouch] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [statsReady, setStatsReady] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  const { searchTerm, debouncedTerm, setSearchTerm, clear: clearSearchTerm } = useDebouncedSearch("", 300);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const yStats = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const fadeUp = {
    hidden: { y: 32, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: prefersReducedMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

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
    setPhraseIndex(0);
  }, [phrases]);

  useEffect(() => {
    if (!Array.isArray(phrases) || phrases.length === 0) return undefined;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [phrases]);

  useEffect(() => {
    controls.start("show");
    
  }, [controls]);

  useEffect(() => {
    const timer = setTimeout(() => setStatsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (debouncedTerm.trim()) {
      setSearchResults(searchIndex.search(debouncedTerm.trim()).slice(0, SEARCH_RESULT_LIMIT));
      setShowResults(true);
      return;
    }

    setSearchResults([]);
    setShowResults(false);
  }, [debouncedTerm]);

  const handleSearch = useCallback((query) => setSearchTerm(query), [setSearchTerm]);

  const clearSearch = useCallback(() => {
    setShowResults(false);
    clearSearchTerm();
  }, [clearSearchTerm]);

  // ─── ANIMATION VARIANTS ────────────────────────────────────────────────────
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
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

  const HERO_STATS = useMemo(
    () => [
      {
        value: 1500,
        label: t("landing.hero.stats.developers"),
        suffix: "+",
        icon: Users,
      },
      {
        value: 75,
        label: t("landing.hero.stats.events"),
        suffix: "+",
        icon: Calendar,
      },
      {
        value: 30,
        label: t("landing.hero.stats.partners"),
        suffix: "+",
        icon: Handshake,
      },
    ],
    [t, i18n.language]
  );

  const primaryBtn = "relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900";


  return (
    <>
    <section
      ref={containerRef}
      aria-label="Hero section"
      className="relative overflow-hidden border-b border-gray-100 pb-16 text-slate-900 dark:bg-black dark:text-white sm:pb-20 md:pb-24"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 28,
            width: 260,
            height: 160,
            borderRadius: "50%",
            background: "#E6F0F7",
            filter: "blur(36px)",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 36,
            right: 80,
            width: 180,
            height: 120,
            borderRadius: "50%",
            background: "#EFF6FB",
            filter: "blur(28px)",
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: "12%",
            width: 220,
            height: 90,
            borderRadius: "50%",
            background: "#F7FAFC",
            filter: "blur(20px)",
            opacity: 0.85,
          }}
        />
      </div>

      <motion.div
        className="relative z-10 px-4 pt-20 sm:px-6 sm:pt-24 md:pt-28 lg:px-8"
        style={{
          y: isTouch || prefersReducedMotion ? 0 : yText,
          opacity: isTouch ? 1 : opacityHero,
          willChange: "transform, opacity",
        }}
      >
        <motion.div className="mx-auto max-w-5xl text-center">
          <MotionConfig reducedMotion="never">
            <motion.h1
              className="flex flex-col items-center gap-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-4xl lg:text-5xl"
              style={{ fontFamily: "\"Inter\", system-ui, sans-serif" }}
            >
              <motion.span className="block text-sm font-medium text-gray-500">
                <RespawningText texts={TAGLINE_TEXTS} />
              </motion.span>

              <div className="relative flex min-h-20 w-full items-center justify-center overflow-hidden sm:min-h-24 md:min-h-24">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phraseIndex}
                    className="block text-2xl font-extrabold text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl"
                    exit={{
                      opacity: 0,
                      y: -16,
                      transition: { duration: prefersReducedMotion ? 0 : 0.3, ease: "easeIn" },
                    }}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                  >
                    {phrases[phraseIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.h1>
          </MotionConfig>

          <motion.p
            variants={fadeUp}
            className="mx-auto mb-8 mt-4 max-w-3xl text-base leading-relaxed text-gray-600 sm:mb-10 sm:mt-6 sm:text-lg md:text-lg"
          >
            {t("landing.hero.description")}
          </motion.p>

          <motion.div variants={fadeUp} className="mx-auto mb-10 w-full max-w-2xl">
            <div className="relative">
             <div className="relative rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                <ModernSearchInput
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={t("landing.hero.searchPlaceholder")}
                  onFocus={() => searchTerm && setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  className="border-0 bg-transparent text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0"
                >
                  <AnimatePresence>
                    {showResults && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                        className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg"
                        role="listbox"
                        aria-label={t("landing.hero.searchResults")}
                      >
                        <div className="p-3">
                          {searchResults.length > 0 ? (
                            <>
                              <div className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {t("landing.hero.resultsCount", { count: searchResults.length })}
                              </div>
                              <div className="space-y-1">
                                {searchResults.map((result, idx) => (
                                  <MotionLink
                                    key={`${result.item.type}-${result.item.id}`}
                                    to={getResultHref(result.item, debouncedTerm)}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={clearSearch}
                                    className="group flex cursor-pointer items-center gap-3 rounded-lg p-3 text-left no-underline transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/60"
                                    role="option"
                                    aria-label={`Open ${result.item.title}`}
                                  >
                                    <div className="shrink-0 rounded-lg bg-gray-100 p-2 text-gray-700 transition-transform group-hover:scale-105">
                                      {getResultIcon(result.item.type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="mb-0.5 flex items-center gap-2">
                                        <h4 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                          {result.item.title}
                                        </h4>
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-slate-800 dark:text-gray-300">
                                          {t(`landing.hero.searchTypes.${result.item.searchType}`, {
                                            defaultValue: result.item.searchType,
                                          })}
                                        </span>
                                      </div>
                                      <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                                        {result.item.description
                                          ? `${result.item.description.substring(0, 70)}...`
                                          : t("landing.hero.noDescription")}
                                      </p>
                                    </div>
                                    <ExternalLink
                                      className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-indigo-500"
                                      aria-hidden="true"
                                    />
                                  </MotionLink>
                                ))}
                              </div>
                            </>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                            >
                              {t("landing.hero.noResults")}{" "}
                              <span className="font-medium text-gray-700 dark:text-gray-200">&quot;{searchTerm}&quot;</span>
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

          {!searchTerm.trim() && (
            <ErrorBoundary level="section" label="Statistics">
              <motion.div
                variants={fadeUp}
                style={{ y: isTouch || prefersReducedMotion ? 0 : yStats, willChange: "transform" }}
                className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5"
                role="region"
                aria-label={t("landing.hero.platformStats")}
              >
                {HERO_STATS.map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={fadeUp}
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    className="flex flex-col items-center justify-center rounded-md border border-gray-100 bg-white dark:bg-slate-900 p-4 shadow-sm transition-shadow sm:p-5"
                  >
                    <div className="mb-2 rounded-full bg-gray-100 p-2 text-gray-700">
                      <stat.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <p className="mb-1 text-2xl font-semibold tabular-nums text-gray-900 sm:text-3xl">
                      {statsReady ? (
  <CountUp
    end={stat.value}
                          duration={2.2}
                          suffix={stat.suffix || ""}
                        />
                      ) : (
                        <>
                          {stat.value}
                          {stat.suffix || ""}
                        </>
                      )}
                    </p>
                    <p className="text-center text-xs font-medium uppercase tracking-wider text-gray-600 sm:text-sm">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </ErrorBoundary>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-gray-500 dark:text-gray-400 md:flex"
        aria-hidden="true"
      >
        <span className="text-xs font-medium">{t("landing.hero.scrollToExplore")}</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-10 w-6 justify-center rounded-full border-2 border-current pt-2"
        >
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-current"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
    </>
  );
};
export default Hero;