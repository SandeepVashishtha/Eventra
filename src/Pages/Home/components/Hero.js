import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  motion,
  useAnimation,
  AnimatePresence,
  MotionConfig,
  useScroll,
  useTransform,
} from "framer-motion";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Fuse from "fuse.js";
import {
  Calendar,
  Code,
  ExternalLink,
  Handshake,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import CountUpLib from "react-countup";

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

const HEADLINE_PHRASES = [
  "Amazing Tech Events",
  "Exciting Hackathons Today",
  "Innovative Dev Workshops",
  "Cutting-Edge Tech Meetups",
];

const TAGLINE_TEXTS = [
  "Build. Connect. Innovate.",
  "Discover Opportunities.",
  "Join the Tech Community.",
];

const SEARCH_RESULT_LIMIT = 5;

const HERO_STATS = [
  {
    value: 1500,
    label: "Developers Joined",
    suffix: "+",
    icon: Users,
  },
  {
    value: 75,
    label: "Events Organized",
    suffix: "+",
    icon: Calendar,
  },
  {
    value: 30,
    label: "Partners & Sponsors",
    suffix: "+",
    icon: Handshake,
  },
];

const SHAPES = [
  { size: 42, pos: { top: "10%", left: "5%" }, light: "#3b82f6", dark: "#60a5fa" },
  { size: 54, pos: { top: "14%", left: "20%" }, light: "#f59e0b", dark: "#fbbf24" },
  { size: 30, pos: { top: "24%", left: "42%" }, light: "#22c55e", dark: "#4ade80" },
  { size: 50, pos: { top: "30%", left: "70%" }, light: "#0ea5e9", dark: "#38bdf8" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const MotionLink = motion(Link);

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
  ...eventsData.map((i) => createSearchItem(i, "event", "Events")),
  ...hackathonsData.map((i) => createSearchItem(i, "hackathon", "Hackathons")),
  ...projectsData.map((i) => createSearchItem(i, "project", "Projects")),
];

const searchIndex = new Fuse(allSearchItems, {
  keys: [
    "title",
    "description",
    "location",
    "tags",
    "techStack",
    "type",
  ],
  threshold: 0.3,
  includeScore: true,
});

const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimation();
  const heroControls = useAnimation();

  const { t } = useTranslation();

  useDocumentTitle("Eventra | Home");

  const containerRef = useRef(null);

  const [isTouch, setIsTouch] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const [statsReady, setStatsReady] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const {
    searchTerm,
    debouncedTerm,
    setSearchTerm,
    clear: clearSearchTerm,
  } = useDebouncedSearch("", 300);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yStats = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    setIsDark(document.documentElement.classList.contains("dark"));
    setIsMobileView(window.innerWidth <= 420);

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const onResize = () => setIsMobileView(window.innerWidth <= 420);

    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((p) => (p + 1) % HEADLINE_PHRASES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    controls.start("show");
    heroControls.start("show");
  }, [controls, heroControls]);

  useEffect(() => {
    const timer = setTimeout(() => setStatsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (debouncedTerm.trim()) {
      setSearchResults(
        searchIndex.search(debouncedTerm.trim()).slice(0, SEARCH_RESULT_LIMIT)
      );
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedTerm]);

  const handleSearch = useCallback(
    (q) => setSearchTerm(q),
    [setSearchTerm]
  );

  const clearSearch = useCallback(() => {
    setShowResults(false);
    clearSearchTerm();
  }, [clearSearchTerm]);

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

  const stats = useMemo(
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
    [t]
  );

  return (
    <section ref={containerRef} className="relative overflow-hidden pb-16">
      <motion.div style={{ y: isTouch ? 0 : yText, opacity: opacityHero }}>
        <motion.h1 className="text-4xl font-bold text-center">
          <RespawningText texts={TAGLINE_TEXTS} />
          <div>{HEADLINE_PHRASES[phraseIndex]}</div>
        </motion.h1>

        <motion.div className="mt-10 max-w-2xl mx-auto">
          <ModernSearchInput
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search..."
            onFocus={() => searchTerm && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
        </motion.div>

        {!searchTerm && (
          <motion.div className="grid grid-cols-3 gap-4 mt-10">
            {stats.map((s) => (
              <motion.div key={s.label} className="p-4 border rounded-xl">
                <s.icon />
                <div>
                  {statsReady ? (
                    <CountUp end={s.value} suffix={s.suffix} />
                  ) : (
                    `${s.value}${s.suffix}`
                  )}
                </div>
                <div>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default Hero;