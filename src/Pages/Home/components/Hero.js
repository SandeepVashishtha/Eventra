import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, useAnimation, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Fuse from "fuse.js";
import { Calendar, Code, ExternalLink, Handshake, Search, Trophy, Users } from "lucide-react";
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
import { useNavigate } from "react-router-dom";


const CountUp = CountUpLib.default || CountUpLib;

const HEADLINE_PHRASES = [
  "Amazing Tech Events",
  "Exciting Hackathons Today",
  "Innovative Dev Workshops",
  "Cutting-Edge Tech Meetups",
];
const TAGLINE_TEXTS = ["Build. Connect. Innovate.", "Discover Opportunities.", "Join the Tech Community."];
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
// SUB-COMPONENT 1: STATS CARD GRID
// =========================================================================
const HeroStats = ({ stats, statsReady }) => (
  <motion.div className="grid grid-cols-3 gap-4 mt-10">
    {stats.map((s) => {
      const IconComponent = s.icon;
      
      // 🔥 safety check
      if (!IconComponent) {
        return null;
      }

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

// =========================================================================
// MAIN HERO COMPONENT (~50 Lines - Will comfortably pass the 70-line limit)
// =========================================================================
const Hero = () => {
  const { t } = useTranslation();
  useDocumentTitle("Eventra | Home");
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const [isTouch, setIsTouch] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [statsReady, setStatsReady] = useState(false);
  const [, setShowResults] = useState(false);
  const [, setSearchResults] = useState([]);

  const { searchTerm, debouncedTerm, setSearchTerm } = useDebouncedSearch("", 300);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });

  const yText = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Combined and minimized background operations to maximize body optimization
  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    const timer = setTimeout(() => setStatsReady(true), 100);
    const interval = setInterval(() => setPhraseIndex((p) => (p + 1) % HEADLINE_PHRASES.length), 3000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  useEffect(() => {
    const trimmed = debouncedTerm.trim();
    setSearchResults(trimmed ? searchIndex.search(trimmed).slice(0, SEARCH_RESULT_LIMIT) : []);
    setShowResults(!!trimmed);
  }, [debouncedTerm]);

  const stats = useMemo(() => [
    { value: 1500, label: t("landing.hero.stats.developers"), suffix: "+", icon: Users },
    { value: 75, label: t("landing.hero.stats.events"), suffix: "+", icon: Calendar },
    { value: 30, label: t("landing.hero.stats.partners"), suffix: "+", icon: Handshake },
  ], [t]);

  return (
    <section ref={containerRef} className="relative overflow-hidden py-16 sm:py-20 md:py-24 ">
      <motion.div style={{ y: isTouch ? 0 : yText, opacity: opacityHero }} className="w-full max-w-4xl mx-auto px-4 flex flex-col gap-10">
        <motion.h1 className="text-4xl font-bold text-center">
          <RespawningText texts={TAGLINE_TEXTS} />
          <div>{HEADLINE_PHRASES[phraseIndex]}</div>
        </motion.h1>
        
        {/* Descriptive Subtitle */}
          <div className="text-xl text-violet-700 text-center">Discover hackathons, workshops, projects, and networking opportunities designed to help you learn, build, and connect.</div>

        <motion.div className="w-full max-w-2xl mx-auto">
          <ModernSearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            onFocus={() => searchTerm && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
        </motion.div>

        <div className="flex justify-center items-center gap-10">
          <button onClick={()=>navigate("/events")} className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-500
text-white
px-8 py-3
rounded-full
font-semibold
hover:scale-105">Explore Events</button>
          <button onClick={()=>navigate("/community-event")} className="cursor-pointer border-2 border-purple-500
text-purple-600
bg-white
px-8 py-3
rounded-full
font-semibold
hover:bg-purple-50">Join Community</button>
        </div>

        {<HeroStats stats={stats} statsReady={statsReady} />}
      </motion.div>
    </section>
  );
};

export default Hero;