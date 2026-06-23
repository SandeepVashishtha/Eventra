import { Star, Github, ExternalLink, AlertCircle, GitPullRequest, Cpu, Code2, Layers, Bookmark } from "lucide-react";
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

// ✅ FIX: Added missing helper function
const saveMetricsCache = (cache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Failed to save metrics cache:", e);
  }
};

const toStr = (val, fallback = "") =>
  typeof val === "string" ? val : val?.name ?? val?.label ?? val?.text ?? fallback;

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
  if (!difficulty) return "bg-slate-50 text-white dark:bg-slate-900 dark:text-white border-slate-200/50";
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

// ✅ FIX: Removed unused ConcentricTechRings component (or you can use it in the card)

const ProjectCard = ({ project, index, isBookmarked, onBookmarkToggle }) => {
  // ✅ FIX: Properly use the hook
  const prefersReducedMotion = useReducedMotion();
  const { token, isAuthenticated } = useAuth();
  const [, setIsLoaded] = useState(false);
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
          saveMetricsCache(cache);
        } catch {}
        return updated;
      });
      toast.success("Project upvoted successfully!");
    } catch (err) {
      const message = err?.data?.message || err?.message || "Failed to upvote project.";
      toast.error(message);
    }
  };

  const handleIncrementFork = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      toast.error("You must be logged in to fork a project.");
      return;
    }

    try {
      await projectService.forkProject(project.id, {
        headers: {
          Authorization: token,
        },
      });

      const repoDetails = getGitHubRepoDetails(project.githubUrl);
      const key = repoDetails ? `${repoDetails.owner}/${repoDetails.repo}` : `mock-${project.id}`;

      setMetrics((prev) => {
        const updated = { ...prev, forks: (prev?.forks || 0) + 1 };
        try {
          let cache = {};
          const saved = localStorage.getItem(CACHE_KEY);
          cache = saved ? safeJsonParse(saved, {}) : {};
          cache[key] = { data: updated, timestamp: Date.now() };
          saveMetricsCache(cache);
        } catch {}
        return updated;
      });
      toast.success("Project forked successfully!");
    } catch (err) {
      const message = err?.data?.message || err?.message || "Failed to fork project.";
      toast.error(message);
    }
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
          pullRequests: project.pullRequests || 0,
        };

        // Save entry
        cache[cacheKeyString] = {
          data: freshMetrics,
          timestamp: Date.now(),
        };
        saveMetricsCache(cache);

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

  const safeStatus = toStr(project.status, "Unknown");
  const safeDifficulty = toStr(project.difficulty, "Unknown");
  const safeAuthor = toStr(project.author, "Unknown");
  const safeTitle = toStr(project.title, "Untitled Project");
  const safeDescription = toStr(project.description);
  const safeCategory = toStr(project.category, "Uncategorized");
  const safeGithubUrl = toStr(project.githubUrl);
  const safeLiveDemo = toStr(project.liveDemo);
  const safeImage = toStr(project.image, "/Eventra.png");

  const hasValidRepo = safeGithubUrl && getGitHubRepoDetails(safeGithubUrl);
  const hasValidLiveDemo = safeLiveDemo && isValidUrl(safeLiveDemo);

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
      className="group relative bg-slate-800 text-white backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-md hover:shadow-[0_20px_40px_rgba(99,102,241,0.12)] overflow-hidden flex flex-col h-full transition-shadow duration-300"
    >
      {/* ✅ FIX: Implemented Reactive Pointer Glow Overlay */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: coords.x && coords.y
            ? `radial-gradient(600px circle at ${coords.x}px ${coords.y}px, rgba(99,102,241,0.06), transparent 40%)`
            : undefined,
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-3 border-b border-slate-700 dark:border-slate-800/45 bg-slate-900 dark:from-slate-900/30 dark:to-slate-950/40">
        <div className="w-10 h-10 rounded-xl border border-indigo-200/60 dark:border-indigo-800/30 flex items-center justify-center bg-white dark:bg-slate-900 text-indigo-500 shadow-sm shrink-0">
          <RandomIcon size={18} />
        </div>
        <h3 className="flex-1 min-w-0 text-base font-extrabold text-white tracking-tight line-clamp-1">
          {safeTitle}
        </h3>
        <span
          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap shadow-xs ${getStatusColor(
            safeStatus
          )}`}
        >
          {safeStatus}
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
              : "bg-white border-slate-200 text-white hover:text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:hover:text-slate-200"
          }`}
          title={isBookmarked ? "Remove Bookmark" : "Bookmark Project"}
          aria-label={isBookmarked ? "Remove Bookmark" : "Bookmark Project"}
        >
          <Bookmark className={isBookmarked ? "fill-current" : ""} size={14} />
        </button>
      </div>

      {/* Hero Image */}
      <div className="relative h-44 overflow-hidden border-b border-slate-700 bg-slate-900 z-10">
        <img
          src={safeImage}
          alt={safeTitle || "Project preview"}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className="relative w-full h-full object-cover hover:scale-105 transition-transform duration-500 z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-20" />
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-col flex-1 p-4 space-y-4 bg-slate-800">
        {/* Description */}
        <p className="text-xs sm:text-sm text-white leading-relaxed line-clamp-3">{safeDescription}</p>

        {/* Categories & Level badge pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-indigo-600/20 text-white rounded-lg border border-indigo-500/30">
            {safeCategory}
          </span>
          <span
            className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border rounded-lg ${getDifficultyColor(
              safeDifficulty
            )}`}
          >
            {safeDifficulty}
          </span>
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-2">
          {project.techStack?.slice(0, 5).map((tech) => (
            <span
              key={toStr(tech)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-900/40 text-white border border-indigo-500/20"
            >
              {toStr(tech)}
            </span>
          ))}
        </div>

        {/* Author / Committer Header */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 dark:border-slate-800/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 text-white flex items-center justify-center text-xs font-black uppercase shrink-0 shadow-sm">
              {safeAuthor.charAt(0) || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">
                Creator
              </span>
              <span className="text-sm font-semibold text-white truncate mt-1">{safeAuthor}</span>
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
                    className="h-7 bg-slate-100 dark:bg-slate-900/60 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                className="grid grid-cols-4 gap-2 text-[11px]"
              >
                <button
                  onClick={handleIncrementStar}
                  className="flex flex-col items-center justify-center bg-amber-50/50 hover:bg-amber-100/80 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 border border-amber-100/20 dark:border-amber-900/10 rounded-xl py-1 text-amber-600 dark:text-amber-400 font-extrabold transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Click to Star repository!"
                  aria-label="Star repository"
                >
                  <Star className="mb-0.5" size={14} />
                  <span>{metrics?.stars || 0}</span>
                </button>

                <button
                  onClick={handleIncrementFork}
                  className="flex flex-col items-center justify-center bg-teal-50/50 hover:bg-teal-100/80 dark:bg-teal-950/20 dark:hover:bg-teal-950/40 border border-teal-100/20 dark:border-teal-900/10 rounded-xl py-1 text-teal-600 dark:text-teal-400 font-extrabold transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Click to Fork repository!"
                  aria-label="Fork repository"
                >
                  <Github className="mb-0.5" size={14} />
                  <span>{metrics?.forks || 0}</span>
                </button>

                <div
                  className="flex flex-col items-center justify-center bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/20 dark:border-rose-900/10 rounded-xl py-1 text-rose-600 dark:text-rose-400 font-extrabold cursor-help"
                  title="Open Issues"
                >
                  <AlertCircle className="mb-0.5" size={14} />
                  <span>{metrics?.issues || 0}</span>
                </div>

                <div
                  className="flex flex-col items-center justify-center bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/20 dark:border-indigo-900/10 rounded-xl py-1 text-indigo-600 dark:text-indigo-400 font-extrabold cursor-help"
                  title="Pull Requests"
                >
                  <GitPullRequest className="mb-0.5" size={14} />
                  <span>{metrics?.pullRequests || 0}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Custom Action buttons panel */}
      <div className="relative z-10 px-5 pb-5 pt-1 flex flex-col sm:flex-row gap-3 mt-auto">
        {hasValidRepo ? (
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href={project.githubUrl}
            target="_blank" rel="noopener noreferrer" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80 text-white text-xs font-black shadow-md hover:shadow-lg transition-all duration-300 border-none cursor-pointer"
          >
            <Github className="text-sm" />
            Repository
          </motion.a>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black cursor-not-allowed border border-slate-700 dark:border-slate-800/20">
            No Repository
          </div>
        )}

        {hasValidLiveDemo ? (
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href={project.liveDemo}
            target="_blank" rel="noopener noreferrer" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-indigo-200 hover:border-indigo-300 dark:border-indigo-800/50 dark:hover:border-indigo-700 bg-white/40 dark:bg-slate-900/20 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xs font-black shadow-xs hover:shadow-sm transition-all duration-300 cursor-pointer"
          >
            <ExternalLink className="text-sm" />
            Live Demo
          </motion.a>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black cursor-not-allowed border border-slate-700 dark:border-slate-800/20">
            No Live Demo
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default memo(ProjectCard);