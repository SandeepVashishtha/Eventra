import { Star, Github, ExternalLink, AlertCircle, GitPullRequest, Cpu, Code2, Layers, Bookmark } from "lucide-react";
import { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import { fetchGitHubRepo, getGitHubRepoDetails } from "../../utils/githubApiClient.js";
import {
  FiStar,
  FiGithub,
  FiExternalLink,
  FiAlertCircle,
  FiGitPullRequest,
  FiCpu,
  FiCode,
  FiLayers,
  FiBookmark,
} from "react-icons/fi";
import { safeGetItem, safeSetItem } from "../../utils/safeStorage.js";


// Cache Keys & Constants
const CACHE_KEY = "eventra_github_metrics_cache";
const CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hour expiration

// Status Badge Styling Helper
const getStatusColor = (status) => {
  if (!status) return "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-400";
  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/40 dark:border-emerald-900/30";
    case "maintenance":
      return "bg-amber-100/80 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/40 dark:border-amber-900/30";
    case "archived":
      return "bg-rose-100/80 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/40 dark:border-rose-900/30";
    default:
      return "bg-sky-100/80 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/40 dark:border-sky-900/30";
  }
};

// Difficulty Styling Helper
const getDifficultyColor = (difficulty) => {
  if (!difficulty) return "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-400 border-slate-200/50";
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "bg-sky-50/80 text-sky-700 border-sky-100 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900/40";
    case "intermediate":
      return "bg-pink-50/80 text-pink-700 border-pink-100 dark:bg-pink-950/30 dark:text-pink-300 dark:border-pink-900/40";
    case "advanced":
      return "bg-rose-50/80 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/40";
    default:
      return "bg-slate-50/80 text-slate-700 border-slate-100 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-900/40";
  }
};

// --- Concentric SVG Technology Rings Component ---
const ConcentricTechRings = ({ techStack }) => {
  const prefersReducedMotion = useReducedMotion();
  const list = techStack && techStack.length > 0 ? techStack.slice(0, 3) : ["React", "CSS", "JS"];

  // Custom visual colors mapped to standard technology types
  const techGradients = [
    { from: "#ec4899", to: "#8b5cf6", name: "PinkViolet" }, // Outer
    { from: "#0ea5e9", to: "#10b981", name: "SkyTeal" },    // Middle
    { from: "#f59e0b", to: "#ef4444", name: "AmberRose" },  // Inner
  ];

  // Preset Sweeps (percentages)
  const sweeps = [65, 45, 25];
  const ringConfigs = [
    { radius: 32, circ: 2 * Math.PI * 32 }, // outer
    { radius: 24, circ: 2 * Math.PI * 24 }, // middle
    { radius: 16, circ: 2 * Math.PI * 16 }, // inner
  ];

  return (
    <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50/40 dark:bg-slate-950/35 border border-slate-100/50 dark:border-slate-800/20 backdrop-blur-xs">
      {/* SVG Container */}
      <div className="relative w-[92px] h-[92px] shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <defs>
            {techGradients.map((grad, i) => (
              <linearGradient key={i} id={`grad-${grad.name}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={grad.from} />
                <stop offset="100%" stopColor={grad.to} />
              </linearGradient>
            ))}
          </defs>

          {/* Underlay / Background concentric circles */}
          {ringConfigs.map((cfg, i) => (
            <circle
              key={`bg-${i}`}
              cx="44"
              cy="44"
              r={cfg.radius}
              className="stroke-slate-200/40 dark:stroke-slate-800/40"
              strokeWidth="4.5"
              fill="none"
            />
          ))}

          {/* Active progress rings with mount animations */}
          {ringConfigs.map((cfg, i) => {
            const pct = sweeps[i];
            const strokeDashoffset = cfg.circ - (cfg.circ * pct) / 100;
            const gradName = techGradients[i].name;

            return (
              <motion.circle
                key={`progress-${i}`}
                cx="44"
                cy="44"
                r={cfg.radius}
                stroke={`url(#grad-${gradName})`}
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={cfg.circ}
                initial={{ strokeDashoffset: cfg.circ }}
                animate={{ strokeDashoffset }}
                transition={{ duration: prefersReducedMotion ? 0 : 1.2, delay: 0.15 * i, ease: "easeOut" }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Layers className="w-4 h-4 text-indigo-500/70 animate-pulse" />
        </div>
      </div>

      {/* Legend & Breakdown bars */}
      <div className="flex-1 space-y-2.5 min-w-0">
        {list.map((tech, i) => {
          const pct = sweeps[i];
          const grad = techGradients[i];

          return (
            <div key={tech} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-black tracking-tight">
                <span className="text-slate-800 dark:text-slate-200 truncate pr-1">
                  {tech}
                </span>
                <span className="text-slate-400 dark:text-slate-500">
                  {pct}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200/40 dark:bg-slate-800/40 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: prefersReducedMotion ? 0 : 1.0, delay: 0.1 * i, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(to right, ${grad.from}, ${grad.to})` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ProjectCard = ({ project, index, isBookmarked, onBookmarkToggle }) => {
  useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Mouse Tracking state for dynamic light glow bubble
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleIncrementStar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const repoDetails = getGitHubRepoDetails(project.githubUrl);
    const key = repoDetails ? `${repoDetails.owner}/${repoDetails.repo}` : `mock-${project.id}`;
    
    setMetrics(prev => {
      const updated = { ...prev, stars: (prev?.stars || 0) + 1 };
      try {
        let cache = {};
        const saved = safeGetItem(CACHE_KEY);
        cache = saved ? JSON.parse(saved) : {};
        cache[key] = { data: updated, timestamp: Date.now() };
        safeSetItem(CACHE_KEY, JSON.stringify(cache));
      } catch (err) {
        console.error(err);
      }
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch {}
      return updated;
    });
  };

  const handleIncrementFork = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const repoDetails = getGitHubRepoDetails(project.githubUrl);
    const key = repoDetails ? `${repoDetails.owner}/${repoDetails.repo}` : `mock-${project.id}`;
    
    setMetrics(prev => {
      const updated = { ...prev, forks: (prev?.forks || 0) + 1 };
      try {
        let cache = {};
        const saved = safeGetItem(CACHE_KEY);
        cache = saved ? JSON.parse(saved) : {};
        cache[key] = { data: updated, timestamp: Date.now() };
        safeSetItem(CACHE_KEY, JSON.stringify(cache));
      } catch (err) {
        console.error(err);
      }
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch {}
      return updated;
    });
  };

  // GitHub metrics loading with LocalStorage caching system
  useEffect(() => {
    const repoDetails = getGitHubRepoDetails(project.githubUrl);

    if (!repoDetails) {
      // Fallback directly to mock data if there is no valid repo
      setMetrics({
        stars: project.stars || 0,
        forks: project.forks || 0,
        issues: project.openIssues || 0,
        pullRequests: project.pullRequests || 0,
      });
      setMetricsLoading(false);
      return;
    }

    const { owner, repo } = repoDetails;
    const cacheKeyString = `${owner}/${repo}`;

    const loadMetrics = async () => {
      try {
        let cache = {};
        try {
          const saved = safeGetItem(CACHE_KEY);
          cache = saved ? JSON.parse(saved) : {};
        } catch (e) {
          cache = {};
        }

        const cachedEntry = cache[cacheKeyString];
        if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
          setMetrics(cachedEntry.data);
          setMetricsLoading(false);
          return;
        }

        const data = await fetchGitHubRepo({ owner, repo });
        const freshMetrics = {
          stars: data.stargazers_count || 0,
          forks: data.forks_count || 0,
          issues: data.open_issues_count || 0,
          pullRequests: project.pullRequests || 0, // Fallback to mock for PRs since it requires separate endpoint
        };

        // Save entry
        cache[cacheKeyString] = {
          data: freshMetrics,
          timestamp: Date.now(),
        };
        safeSetItem(CACHE_KEY, JSON.stringify(cache));

        setMetrics(freshMetrics);
        setMetricsLoading(false);
      } catch {
        setMetrics({
          stars: project.stars || 0,
          forks: project.forks || 0,
          issues: project.openIssues || 0,
          pullRequests: project.pullRequests || 0,
        });
        setMetricsLoading(false);
      }
    };

    loadMetrics();
  }, [project]);

  if (!project) return null;

  // Header decorative random codes
  const csIcons = [FiCode, FiCpu, FiGitPullRequest];
  const RandomIcon = csIcons[(index || 0) % csIcons.length];

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="group relative bg-white/60 dark:bg-slate-950/65 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-md hover:shadow-[0_20px_40px_rgba(99,102,241,0.12)] overflow-hidden flex flex-col h-full transition-shadow duration-300"
    >
      {/* Reactive Pointer Glow Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(99, 102, 241, 0.08), transparent 80%)`,
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800/45 bg-gradient-to-r from-slate-50/50 to-blue-50/20 dark:from-slate-900/30 dark:to-slate-950/40">
        <div className="w-10 h-10 rounded-xl border border-indigo-200/60 dark:border-indigo-800/30 flex items-center justify-center bg-white dark:bg-slate-900 text-indigo-500 shadow-sm shrink-0">
          <RandomIcon size={18} />
        </div>
        <h3 className="flex-1 min-w-0 text-base font-extrabold text-slate-850 dark:text-white tracking-tight line-clamp-1">
          {project.title || "Untitled Project"}
        </h3>
        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap shadow-xs ${getStatusColor(project.status)}`}>
          {project.status || "Unknown"}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBookmarkToggle(project.id);
          }}
          className={`p-2 rounded-xl border transition-colors shrink-0 cursor-pointer ${
            isBookmarked
              ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-400"
              : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:hover:text-slate-200"
          }`}
          title={isBookmarked ? "Remove Bookmark" : "Bookmark Project"}
        >
          <Bookmark className={isBookmarked ? "fill-current" : ""} size={14} />
        </button>
      </div>

      {/* Hero Image */}
      <div className="relative aspect-video overflow-hidden border-b border-slate-100 dark:border-slate-800/45 bg-slate-100 dark:bg-slate-900 z-10">
        <img
          src={project.lowResImage || project.image}
          alt="project"
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover blur-xl scale-110 transition-opacity duration-500 z-0 ${
            isLoaded ? "opacity-0" : "opacity-100"
          }`} loading="lazy"/>
        <img
          src={project.image}
          alt={project.title || "Project preview"}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className="relative w-full h-full object-cover hover:scale-106 transition-transform duration-500 z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-20" />
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-col flex-1 p-5 space-y-4">
        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
          {project.description}
        </p>

        {/* Categories & Level badge pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100/40 dark:bg-indigo-950/20 dark:text-indigo-300 dark:border-indigo-900/30">
            {project.category || "General"}
          </span>
          <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border rounded-lg ${getDifficultyColor(project.difficulty)}`}>
            {project.difficulty || "Unknown"}
          </span>
        </div>

        {/* Animated Radial Rings Section */}
        <ConcentricTechRings techStack={project.techStack} />

        {/* Author / Committer Header */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 dark:border-slate-800/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 text-white flex items-center justify-center text-xs font-black uppercase shrink-0 shadow-sm">
              {project.author?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Creator
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-350 truncate mt-1">
                {project.author || "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* GitHub Live statistics bar */}
        <div className="pt-1">
          <AnimatePresence mode="wait">
            {metricsLoading ? (
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-7 bg-slate-100 dark:bg-slate-900/60 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="grid grid-cols-4 gap-2 text-[11px]"
              >
                <button
                  onClick={handleIncrementStar}
                  className="flex flex-col items-center justify-center bg-amber-50/50 hover:bg-amber-100/80 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 border border-amber-100/20 dark:border-amber-900/10 rounded-xl py-1 text-amber-600 dark:text-amber-400 font-extrabold transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Click to Star repository!"
                 aria-label="Star repository">
                  <Star className="mb-0.5" />
                  <span>{metrics?.stars || 0}</span>
                </button>

                <button
                  onClick={handleIncrementFork}
                  className="flex flex-col items-center justify-center bg-teal-50/50 hover:bg-teal-100/80 dark:bg-teal-950/20 dark:hover:bg-teal-950/40 border border-teal-100/20 dark:border-teal-900/10 rounded-xl py-1 text-teal-600 dark:text-teal-400 font-extrabold transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Click to Fork repository!"
                 aria-label="Fork repository">
                  <Github className="mb-0.5" />
                  <span>{metrics?.forks || 0}</span>
                </button>

                <div
                  className="flex flex-col items-center justify-center bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/20 dark:border-rose-900/10 rounded-xl py-1 text-rose-600 dark:text-rose-400 font-extrabold cursor-help"
                  title="Open Issues"
                >
                  <AlertCircle className="mb-0.5" />
                  <span>{metrics?.issues || 0}</span>
                </div>

                <div
                  className="flex flex-col items-center justify-center bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/20 dark:border-indigo-900/10 rounded-xl py-1 text-indigo-600 dark:text-indigo-400 font-extrabold cursor-help"
                  title="Pull Requests"
                >
                  <GitPullRequest className="mb-0.5" />
                  <span>{metrics?.pullRequests || 0}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Custom Action buttons panel */}
      <div className="relative z-10 px-5 pb-5 pt-1 flex flex-col sm:flex-row gap-3 mt-auto">
        {project.githubUrl ? (
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href={project.githubUrl}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80 text-white text-xs font-black shadow-md hover:shadow-lg transition-all duration-300 border-none cursor-pointer"
          >
            <Github className="text-sm" />
            Repository
          </motion.a>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 text-slate-400 text-xs font-black cursor-not-allowed border border-slate-100 dark:border-slate-800/20">
            No Repository
          </div>
        )}

        {project.liveDemo ? (
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href={project.liveDemo}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 hover:border-indigo-300 dark:border-indigo-800/50 dark:hover:border-indigo-700 bg-white/40 dark:bg-slate-900/20 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xs font-black shadow-xs hover:shadow-sm transition-all duration-300 cursor-pointer"
          >
            <ExternalLink className="text-sm" />
            Live Demo
          </motion.a>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 text-slate-400 text-xs font-black cursor-not-allowed border border-slate-100 dark:border-slate-800/20">
            No Live Demo
          </div>
        )}
      </div>
    </motion.div>
  );
};


export default memo(ProjectCard);
