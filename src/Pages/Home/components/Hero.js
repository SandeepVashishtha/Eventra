import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { Search, Calendar, Trophy, Code, ArrowRight, Sparkles } from "lucide-react";

import useReducedMotion from "../../../hooks/useReducedMotion.js";
import eventsData from "../../Events/eventsMockData.json";
import hackathonsData from "../../Hackathons/hackathonMockData.json";
import projectsData from "../../Projects/mockProjectsData.json";
import ModernSearchInput from "../../../components/common/ModernSearchInput";
import CountUp from "react-countup";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import useDebouncedSearch from "../../../hooks/useDebouncedSearch";

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
  keys: ["title", "description", "location", "tags", "techStack", "type"],
  threshold: 0.3,
  includeScore: true,
});

const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  useDocumentTitle("Eventra | Home");
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const { searchTerm, debouncedTerm, setSearchTerm, clear: clearSearchTerm } = useDebouncedSearch("", 300);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (debouncedTerm.trim()) {
      setSearchResults(fuse.search(debouncedTerm).slice(0, 5));
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedTerm]);

  const handleSearch = (query) => setSearchTerm(query);
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
    if (type === "event") return <Calendar className="w-4 h-4" />;
    if (type === "hackathon") return <Trophy className="w-4 h-4" />;
    if (type === "project") return <Code className="w-4 h-4" />;
    return <Search className="w-4 h-4" />;
  };

  const stats = [
    { value: 1500, label: "Developers", suffix: "+" },
    { value: 75, label: "Events", suffix: "+" },
    { value: 30, label: "Partners", suffix: "+" },
  ];

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500 pt-20 pb-16"
    >
      {/* Premium Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white dark:from-indigo-900/20 dark:via-slate-950 dark:to-slate-950"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[40rem] h-[40rem] bg-pink-300/30 dark:bg-pink-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-70 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[40rem] h-[40rem] bg-indigo-300/30 dark:bg-indigo-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <motion.div 
        style={{ opacity: opacityHero, y: prefersReducedMotion ? 0 : yHero }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-8 shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>The Ultimate Platform for Builders</span>
        </motion.div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
          Unleash Your <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500 dark:from-indigo-400 dark:to-pink-400">
            Creative Potential
          </span>
        </h1>

        <p className="max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-light">
          Discover cutting-edge hackathons, join vibrant tech events, and collaborate on world-class projects. Your next big opportunity starts here.
        </p>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-2xl mx-auto mb-12 relative"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
              <ModernSearchInput
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for hackathons, events..."
                onFocus={() => searchTerm && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              >
                <AnimatePresence>
                  {showResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
                    >
                      {searchResults.length > 0 ? (
                        <div className="p-2">
                          {searchResults.map((result) => (
                            <Link
                              key={result.item.id}
                              to={getResultHref(result.item)}
                              onClick={clearSearch}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                            >
                              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50">
                                {getResultIcon(result.item.type)}
                              </div>
                              <div className="flex-1 text-left">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                  {result.item.title}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {result.item.searchType}
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500" />
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                          No results found for "{searchTerm}"
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </ModernSearchInput>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 gap-4 sm:gap-8 border-t border-slate-200 dark:border-slate-800 pt-8 mt-8 w-full max-w-3xl"
        >
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                <CountUp start={0} end={stat.value} duration={2.5} separator="," />{stat.suffix}
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;

