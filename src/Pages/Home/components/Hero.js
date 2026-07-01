
import { motion, useAnimation, AnimatePresence, MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { Calendar, Handshake, Users } from "lucide-react";
import CountUpLib from "react-countup";

import ModernSearchInput from "../../../components/common/ModernSearchInput";
import RespawningText from "../../../components/visual/RespawningText";
import useDebouncedSearch from "../../../hooks/useDebouncedSearch";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import {  Users,CalendarDays,Handshake} from "lucide-react";
import HeroStatsCard from "./HeroStatsCard";

// Fetch events from backend API instead of static mock data
import { eventService } from "../../../services/eventService";
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
// MAIN HERO COMPONENT
// =========================================================================
const Hero = () => {
  const { t } = useTranslation();
  useDocumentTitle("Eventra | Home");
  const navigate = useNavigate();

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [statsReady, setStatsReady] = useState(false);
  const [, setShowResults] = useState(false);
  const [, setSearchResults] = useState([]);
  const [eventsData, setEventsData] = useState([]);

  // Fetch events from backend API
  useEffect(() => {
    let cancelled = false;
    eventService.getAllEvents().then((res) => {
      if (cancelled) return;
      const raw = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
      setEventsData(raw);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Build search index from fetched events + static hackathons/projects
  const searchIndex = useMemo(() => {
    const allSearchItems = [
      ...eventsData.map((i) => createSearchItem(i, "event", "Events")),
      ...hackathonsData.map((i) => createSearchItem(i, "hackathon", "Hackathons")),
      ...projectsData.map((i) => createSearchItem(i, "project", "Projects")),
    ];
    return new Fuse(allSearchItems, {
      keys: ["title", "description", "location", "tags", "techStack", "type"],
      threshold: 0.3,
      includeScore: true,
    });
  }, [eventsData]);

  const { searchTerm, debouncedTerm, setSearchTerm } = useDebouncedSearch("", 300);

  // Background operations
  useEffect(() => {
    const timer = setTimeout(() => setStatsReady(true), 100);
    const interval = setInterval(() => setPhraseIndex((p) => (p + 1) % HEADLINE_PHRASES.length), 3000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  useEffect(() => {
    const trimmed = debouncedTerm.trim();
    setSearchResults(trimmed ? searchIndex.search(trimmed).slice(0, SEARCH_RESULT_LIMIT) : []);
    setShowResults(!!trimmed);
  }, [debouncedTerm, searchIndex]);

  const stats = [
  {
    value: 1500,
    suffix: "+",
    label: "Developers Joined",
    icon: Users,
  },
  {
    value: 75,
    suffix: "+",
    label: "Events Organized",
    icon: CalendarDays,
  },
  {
    value: 30,
    suffix: "+",
    label: "Partners & Sponsors",
    icon: Handshake,
  },
];
  return (
    <section className="min-h-[80vh] flex items-center justify-center relative overflow-hidden py-16 sm:py-20 md:py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mx-auto px-4 flex flex-col gap-10"
      >
        <motion.h1 className="text-4xl font-bold text-center">
          <RespawningText texts={TAGLINE_TEXTS} />
          <div>{HEADLINE_PHRASES[phraseIndex]}</div>
        </motion.h1>
        
        <div className="text-xl text-violet-700 text-center">Discover hackathons, workshops, projects, and networking opportunities designed to help you learn, build, and connect.</div>

        <motion.div className="w-full max-w-2xl mx-auto">
          <ModernSearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
          />
        </motion.div>

        <div className="flex justify-center items-center gap-10">
          <button onClick={()=>navigate("/events")} className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform">Explore Events</button>
          <button onClick={()=>navigate("/community-event")} className="cursor-pointer border-2 border-purple-500 text-purple-600 bg-white px-8 py-3 rounded-full font-semibold hover:bg-purple-50">Join Community</button>
        </div>

          {/* Animated Stats Cards */}
          {!searchQuery.trim() && (
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
            >
             {stats.map((stat, i) => (
            <HeroStatsCard
            key={i}
            stat={stat}
            variants={fadeUp}
            />
            ))}
            
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default memo(Hero);