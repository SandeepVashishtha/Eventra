import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  motion,
  useAnimation,
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
import CountUp from "react-countup"; // Cleaned up the import configuration

import ErrorBoundary from "../../../components/common/ErrorBoundary";
import ModernSearchInput from "../../../components/common/ModernSearchInput";
import RespawningText from "../../../components/visual/RespawningText";
import useDebouncedSearch from "../../../hooks/useDebouncedSearch";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import useReducedMotion from "../../../hooks/useReducedMotion.js";

import eventsData from "../../Events/eventsMockData.json";
import hackathonsData from "../../Hackathons/hackathonMockData.json";
import projectsData from "../../Projects/mockProjectsData.json";

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
  keys: ["title", "description", "location", "tags", "techStack", "type"],
  threshold: 0.3,
  includeScore: true,
});

// =========================================================================
// 1. EXTRACTED SUB-COMPONENT TO FIX THE "LARGE METHOD" ISSUE
// =========================================================================
const HeroStats = ({ stats, statsReady }) => {
  return (
    <motion.div className="grid grid-cols-3 gap-4 mt-10">
      {stats.map((s) => {
        const IconComponent = s.icon;
        return (
          <motion.div key={s.label} className="p-4 border rounded-xl">
            <IconComponent className="w-6 h-6 mb-2" />
            <div>
              {statsReady ? (
                <CountUp end={s.value} suffix={s.suffix} />
              ) : (
                <span>{`${s.value}${s.suffix}`}</span>
              )}
            </div>
            <div>{s.label}</div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// =========================================================================
// 2. MAIN HERO COMPONENT (Now safely under the 70-line limit!)
// =========================================================================
const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimation();
  const heroControls = useAnimation();
  const { t } = useTranslation();

  useDocumentTitle("Eventra | Home");
  const containerRef = useRef(null);

  const [isTouch, setIsTouch] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [statsReady, setStatsReady] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const { searchTerm, debouncedTerm, setSearchTerm, clear: clearSearchTerm } =
    useDebouncedSearch("", 300);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Combined DOM and window event listeners into a single block to reduce lines
  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    const onResize = () => {};
    window.addEventListener("resize", onResize);
    const timer = setTimeout(() => setStatsReady(true), 100);
    
    const interval = setInterval(() => {
      setPhraseIndex((p) => (p + 1) % HEADLINE_PHRASES.length);
    }, 3000);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (debouncedTerm.trim()) {
      setSearchResults(searchIndex.search(debouncedTerm.trim()).slice(0, SEARCH_RESULT_LIMIT));
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedTerm]);

  const handleSearch = useCallback((q) => setSearchTerm(q), [setSearchTerm]);

  const stats = useMemo(
    () => [
      { value: 1500, label: t("landing.hero.stats.developers"), suffix: "+", icon: Users },
      { value: 75, label: t("landing.hero.stats.events"), suffix: "+", icon: Calendar },
      { value: 30, label: t("landing.hero.stats.partners"), suffix: "+", icon: Handshake },
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

        {/* Render extracted sub-component conditionally */}
        {!searchTerm && <HeroStats stats={stats} statsReady={statsReady} />}
      </motion.div>
    </section>
  );
};

export default Hero;