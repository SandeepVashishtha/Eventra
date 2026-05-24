import { motion, useAnimation, AnimatePresence, MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { Search, Calendar, Trophy, Code, ExternalLink, ArrowRight } from "lucide-react";

// Import mock data
import eventsData from "../../Events/eventsMockData.json";
import hackathonsData from "../../Hackathons/hackathonMockData.json";
import projectsData from "../../Projects/mockProjectsData.json";
import RespawningText from "../../../jhalak/RespawningText";
import ModernSearchInput from "../../../components/common/ModernSearchInput";
import CountUp from "react-countup";
import useDocumentTitle from "../../../hooks/useDocumentTitle";

const MotionLink = motion(Link);

const Hero = () => {
  useDocumentTitle("Eventra | Home");
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

  // Global search functionality
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
    type,
    searchType,
  });

  const allData = [
    ...eventsData.map((item) => createSearchItem(item, "event", "Events")),
    ...hackathonsData.map((item) =>
      createSearchItem(item, "hackathon", "Hackathons")
    ),
    ...projectsData.map((item) =>
      createSearchItem(item, "project", "Projects")
    ),
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

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = fuse.search(query).slice(0, 8);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const clearSearch = () => {
    setShowResults(false);
    setSearchQuery("");
  };

  const getResultHref = (item) => {
    const query = encodeURIComponent(item.title || searchQuery);
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
    show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const stats = [
    { value: "1500+", label: "Developers Joined" },
    { value: "75",    label: "Events Organized"  },
    { value: "30+",   label: "Partners & Sponsors" },
  ];

  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100 pb-16 sm:pb-24 pt-12 sm:pt-16 border-b border-gray-200 dark:border-gray-900">
      {/* Professional Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-[-10%] -z-10 m-auto h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] rounded-full bg-indigo-500 opacity-20 dark:opacity-10 blur-[100px]"></div>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pt-16 sm:pt-20">
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
              className="mx-auto max-w-4xl mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight text-gray-900 dark:text-white px-2 sm:px-0"
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              <motion.span
                className="block text-gray-900 dark:text-white mb-2 md:mb-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <RespawningText texts={["Discover & Join", "Innovate & Create", "Learn & Grow"]} />
              </motion.span>

              <div className="relative mx-auto h-14 sm:h-24 md:h-28 lg:h-32 overflow-hidden flex justify-center items-center max-w-full">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={index}
                    className="block mt-2 text-gray-900 dark:text-white mb-4 pb-2 whitespace-normal text-center px-1"
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
                    <span className="text-indigo-600 dark:text-indigo-500 font-extrabold drop-shadow-sm">
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
            className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mt-2 mb-7 sm:mb-8 px-4 sm:px-0"
          >
            Connect with developers, learn new skills, and grow your network at
            the best tech events, hackathons, and workshops in your area.
          </motion.p>

          {/* Global Search Bar (Glassmorphism) */}
          <div className="w-full max-w-2xl mx-auto mb-10 p-2 sm:p-2.5 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-indigo-500/5">
            <ModernSearchInput
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search events, hackathons, projects..."
              onFocus={() => searchQuery && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
            >
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
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
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 absolute left-0">
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
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="text-center text-gray-500 dark:text-gray-400 py-10 text-base"
                        >
                          No results match "
                          <span className="font-medium text-gray-700 dark:text-white">
                            {searchQuery}
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
                className="group relative inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
              >
                Explore Events
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link
                to="/hackathons"
                className="group inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:-translate-y-1 w-full sm:w-auto"
              >
                <Trophy className="mr-2 w-4 h-4 text-indigo-500 transition-transform group-hover:scale-110" />
                Join Hackathons
              </Link>
            </motion.div>
          </motion.div>

          {/* Animated Stats Cards */}
          {!searchQuery.trim() && (
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center p-6 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm"
                >
                  <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">
                    <CountUp
                      start={0}
                      end={parseFloat(stat.value)}
                      duration={2.5}
                      suffix={stat.value.includes('+') ? '+' : ''}
                    />
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;