import {
  Star,
  Github,
  ExternalLink,
  AlertCircle,
  GitPullRequest,
  Cpu,
  Code2,
  Layers,
  Bookmark,
} from "lucide-react";
import { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import { fetchGitHubRepo, getGitHubRepoDetails } from "../../utils/githubApiClient.js";
import { safeJsonParse } from "../../utils/safeJsonParse";
import { useAuth } from "../../context/AuthContext.js";
import { toast } from "react-toastify";
import { projectService } from "../../services/projectService.js";

// Cache Keys & Constants
const CACHE_KEY = "eventra_github_metrics_cache";
const CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hour expiration

// Status Badge Styling Helper
const getStatusColor = (status) => {
  if (!status) return "bg-slate-100 text-white dark:bg-slate-900/50 dark:text-white";
  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-100/80 text-white dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/40 dark:border-emerald-900/30";
    case "maintenance":
      return "bg-amber-100/80 text-white dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/40 dark:border-amber-900/30";
    case "archived":
      return "bg-rose-100/80 text-white dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/40 dark:border-rose-900/30";
    default:
      return "bg-sky-100/80 text-white dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/40 dark:border-sky-900/30";
  }
};

// Difficulty Styling Helper
const getDifficultyColor = (difficulty) => {
  if (!difficulty)
    return "bg-slate-50 text-white dark:bg-slate-900 dark:text-white border-slate-200/50";
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "bg-sky-900/40 text-white border-sky-500/30";

    case "intermediate":
      return "bg-pink-900/40 text-white border-pink-500/30";

    case "advanced":
      return "bg-rose-900/40 text-white border-rose-500/30";

    default:
      return "bg-slate-800 text-white border-slate-600";
  }
};

// --- Concentric SVG Technology Rings Component ---
const ConcentricTechRings = ({ techStack }) => {
  const prefersReducedMotion = useReducedMotion();
  const list = techStack && techStack.length > 0 ? techStack.slice(0, 3) : ["React", "CSS", "JS"];

  // Custom visual colors mapped to standard technology types
  const techGradients = [
    { from: "#ec4899", to: "#8b5cf6", name: "PinkViolet" }, // Outer
    { from: "#0ea5e9", to: "#10b981", name: "SkyTeal" }, // Middle
    { from: "#f59e0b", to: "#ef4444", name: "AmberRose" }, // Inner
  ];

  // Preset Sweeps (percentages)
  const sweeps = [65, 45, 25];
  const ringConfigs = [
    { radius: 32, circ: 2 * Math.PI * 32 }, // outer
    { radius: 24, circ: 2 * Math.PI * 24 }, // middle
    { radius: 16, circ: 2 * Math.PI * 16 }, // inner
  ];

  return (
    <div className="flex items-center gap-5 rounded-2xl border border-slate-100/50 bg-slate-50/40 p-4 backdrop-blur-xs dark:border-slate-800/20 dark:bg-slate-950/35">
      {/* SVG Container */}
      <div className="relative h-[92px] w-[92px] shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 88 88">
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
                transition={{
                  duration: prefersReducedMotion ? 0 : 1.2,
                  delay: 0.15 * i,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Layers className="h-4 w-4 animate-pulse text-indigo-500/70" />
        </div>
      </div>

      {/* Legend & Breakdown bars */}
      <div className="min-w-0 flex-1 space-y-2.5">
        {list.map((tech, i) => {
          const pct = sweeps[i];
          const grad = techGradients[i];

          return (
            <div key={tech} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-black tracking-tight">
                <span className="truncate pr-1 text-white dark:text-white">{tech}</span>
                <span className="text-white dark:text-white">{pct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/40 dark:bg-slate-800/40"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ProjectCard = ({ project, index, isBookmarked, onBookmarkToggle }) => {
  useReducedMotion();
  const { token, isAuthenticated } = useAuth();
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

  const handleIncrementStar = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      toast.error("You must be logged in to upvote a project.");
      return;
    }

    try {
      await projectService.upvoteProject(project.id, {
        headers: {
          Authorization: token,
        },
      });

      const repoDetails = getGitHubRepoDetails(project.githubUrl);
      const key = repoDetails ? `${repoDetails.owner}/${repoDetails.repo}` : `mock-${project.id}`;

      setMetrics((prev) => {
        const updated = { ...prev, stars: (prev?.stars || 0) + 1 };
        try {
          let cache = {};
          const saved = localStorage.getItem(CACHE_KEY);
          cache = saved ? safeJsonParse(saved, {}) : {};
          cache[key] = { data: updated, timestamp: Date.now() };
          localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch {}
        return updated;
      });
      toast.success("Project upvoted successfully!");
    } catch (err) {
      const message = err?.data?.message || err?.message || "Failed to upvote project.";
      toast.error(message);
    }
  };

  const handleIncrementFork = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const repoDetails = getGitHubRepoDetails(project.githubUrl);
    const key = repoDetails ? `${repoDetails.owner}/${repoDetails.repo}` : `mock-${project.id}`;

    setMetrics((prev) => {
      const updated = { ...prev, forks: (prev?.forks || 0) + 1 };
      try {
        let cache = {};
        const saved = localStorage.getItem(CACHE_KEY);
        cache = saved ? safeJsonParse(saved, {}) : {};
        cache[key] = { data: updated, timestamp: Date.now() };
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
        stars: project.stars || project.upvotes || 0,
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
          const saved = localStorage.getItem(CACHE_KEY);
          cache = saved ? safeJsonParse(saved, {}) : {};
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
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

        setMetrics(freshMetrics);
        setMetricsLoading(false);
      } catch {
        setMetrics({
          stars: project.stars || project.upvotes || 0,
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

  const isValidUrl = (string) => {
    try {
      const parsed = new URL(string);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const hasValidRepo = project.githubUrl && getGitHubRepoDetails(project.githubUrl);
  const hasValidLiveDemo = project.liveDemo && isValidUrl(project.liveDemo);

  // Header decorative random codes
  const csIcons = [Code2, Cpu, GitPullRequest];
  const RandomIcon = csIcons[(index || 0) % csIcons.length];

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/50 bg-slate-800 text-white shadow-md backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_20px_40px_rgba(99,102,241,0.12)] dark:border-slate-800/40"
    >
      {/* Reactive Pointer Glow Overlay */}

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 border-b border-slate-700 bg-slate-900 px-4 py-3 dark:border-slate-800/45 dark:from-slate-900/30 dark:to-slate-950/40">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-200/60 bg-white text-indigo-500 shadow-sm dark:border-indigo-800/30 dark:bg-slate-900">
          <RandomIcon size={18} />
        </div>
        <h3 className="line-clamp-1 min-w-0 flex-1 text-base font-extrabold tracking-tight text-white">
          {project.title || "Untitled Project"}
        </h3>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-black tracking-wider whitespace-nowrap uppercase shadow-xs ${getStatusColor(project.status)}`}
        >
          {project.status || "Unknown"}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBookmarkToggle(project.id);
          }}
          className={`shrink-0 cursor-pointer rounded-xl border p-2 transition-colors ${
            isBookmarked
              ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-400"
              : "border-slate-200 bg-white text-white hover:text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:text-slate-200"
          }`}
          title={isBookmarked ? "Remove Bookmark" : "Bookmark Project"}
        >
          <Bookmark className={isBookmarked ? "fill-current" : ""} size={14} />
        </button>
      </div>

      {/* Hero Image */}
      <div className="relative z-10 h-44 overflow-hidden border-b border-slate-700 bg-slate-900">
        <img
          src={project.image}
          alt={project.title || "Project preview"}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className="relative z-10 h-full w-full object-cover transition-transform duration-500 hover:scale-102"
        />
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-1 flex-col space-y-4 bg-slate-800 p-4">
        {/* Description */}
        <p className="line-clamp-3 text-xs leading-relaxed text-white sm:text-sm">
          {project.description}
        </p>

        {/* Categories & Level badge pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="rounded-lg border border-indigo-500/30 bg-indigo-600/20 px-2.5 py-1 text-[10px] font-black tracking-wider text-white uppercase">
            {project.category || "Uncategorized"}
          </span>
          <span
            className={`rounded-lg border px-2.5 py-1 text-[10px] font-black tracking-wider uppercase ${getDifficultyColor(project.difficulty)}`}
          >
            {project.difficulty || "Unknown"}
          </span>
        </div>

        {/* Animated Radial Rings Section */}
        <div className="flex flex-wrap gap-2">
          {project.techStack?.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-indigo-500/20 bg-indigo-900/40 px-3 py-1 text-xs font-medium text-white"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Author / Committer Header */}
        <div className="flex items-center justify-between border-t border-slate-100/80 pt-1 dark:border-slate-800/30">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 text-xs font-black text-white uppercase shadow-sm">
              {project.author?.charAt(0) || "U"}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-[10px] leading-none font-bold tracking-widest text-white uppercase">
                Creator
              </span>
              <span className="mt-1 truncate text-sm font-semibold text-white">
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
                  <div
                    key={i}
                    className="h-7 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900/60"
                  />
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
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-amber-100/20 bg-amber-50/50 py-1 font-extrabold text-amber-600 transition-all hover:scale-105 hover:bg-amber-100/80 active:scale-95 dark:border-amber-900/10 dark:bg-amber-950/20 dark:text-amber-400 dark:hover:bg-amber-950/40"
                  title="Click to Star repository!"
                  aria-label="Star repository"
                >
                  <Star className="mb-0.5" />
                  <span>{metrics?.stars || 0}</span>
                </button>

                <button
                  onClick={handleIncrementFork}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-teal-100/20 bg-teal-50/50 py-1 font-extrabold text-teal-600 transition-all hover:scale-105 hover:bg-teal-100/80 active:scale-95 dark:border-teal-900/10 dark:bg-teal-950/20 dark:text-teal-400 dark:hover:bg-teal-950/40"
                  title="Click to Fork repository!"
                  aria-label="Fork repository"
                >
                  <Github className="mb-0.5" />
                  <span>{metrics?.forks || 0}</span>
                </button>

                <div
                  className="flex cursor-help flex-col items-center justify-center rounded-xl border border-rose-100/20 bg-rose-50/50 py-1 font-extrabold text-rose-600 dark:border-rose-900/10 dark:bg-rose-950/20 dark:text-rose-400"
                  title="Open Issues"
                >
                  <AlertCircle className="mb-0.5" />
                  <span>{metrics?.issues || 0}</span>
                </div>

                <div
                  className="flex cursor-help flex-col items-center justify-center rounded-xl border border-indigo-100/20 bg-indigo-50/50 py-1 font-extrabold text-indigo-600 dark:border-indigo-900/10 dark:bg-indigo-950/20 dark:text-indigo-400"
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
      <div className="relative z-10 mt-auto flex flex-col gap-3 px-5 pt-1 pb-5 sm:flex-row">
        {hasValidRepo ? (
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-slate-900 px-4 py-2 text-xs font-black text-white shadow-md transition-all duration-300 hover:bg-slate-800 hover:shadow-lg dark:bg-slate-900 dark:hover:bg-slate-800/80"
          >
            <Github className="text-sm" />
            Repository
          </motion.a>
        ) : (
          <div className="flex flex-1 cursor-not-allowed items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-black text-white dark:border-slate-800/20">
            No Repository
          </div>
        )}

        {hasValidLiveDemo ? (
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href={project.liveDemo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white/40 px-4 py-2 text-xs font-black text-indigo-600 shadow-xs transition-all duration-300 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm dark:border-indigo-800/50 dark:bg-slate-900/20 dark:text-indigo-400 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/20"
          >
            <ExternalLink className="text-sm" />
            Live Demo
          </motion.a>
        ) : (
          <div className="flex flex-1 cursor-not-allowed items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-black text-white dark:border-slate-800/20">
            No Live Demo
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default memo(ProjectCard);
