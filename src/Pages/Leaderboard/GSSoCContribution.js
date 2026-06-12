import { useState, useMemo, useEffect, useCallback, memo, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import {
  Lightbulb,
  Code2,
  GitBranch,
  BookOpen,
  Users,
  CheckCircle,
  Trophy,
  Clock,
  Star,
  ArrowRight,
  Search,
  ExternalLink,
  Calendar,
  Award,
  MessageCircle,
  Zap,
  Target,
  Globe,
  Copy,
  Bell,
  WifiOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import useDebounce from "../../hooks/useDebounce.js";
import { safeJsonParse } from "../../utils/safeJsonParse";

// ============ CONSTANTS ============
const GSSOC_TIMELINE = [
  { phase: "Registration", date: "Mar 1", status: "completed", icon: CheckCircle },
  { phase: "Coding Starts", date: "Mar 15", status: "completed", icon: Code2 },
  { phase: "Phase 1 Evaluation", date: "Apr 30", status: "current", icon: Target },
  { phase: "Phase 2 Evaluation", date: "May 31", status: "upcoming", icon: Trophy },
  { phase: "Final Results", date: "Jun 15", status: "upcoming", icon: Award },
];

const MENTORS = [
  {
    name: "Priya Sharma",
    role: "Frontend Lead",
    expertise: ["React", "Tailwind"],
    avatar: "👩‍💻",
    available: true,
    bio: "10+ years in frontend architecture",
  },
  {
    name: "Rahul Verma",
    role: "Backend Expert",
    expertise: ["Node.js", "MongoDB"],
    avatar: "👨‍💻",
    available: true,
    bio: "Scalable systems specialist",
  },
  {
    name: "Anita Das",
    role: "DevOps Mentor",
    expertise: ["Docker", "CI/CD"],
    avatar: "👩‍🔧",
    available: false,
    bio: "Cloud infrastructure expert",
  },
  {
    name: "Vikram Singh",
    role: "Full-Stack Guide",
    expertise: ["MERN", "GraphQL"],
    avatar: "👨‍🚀",
    available: true,
    bio: "End-to-end product builder",
  },
];

const ACHIEVEMENTS = [
  {
    id: "first-pr",
    label: "First PR",
    icon: Star,
    unlocked: true,
    color: "text-yellow-500",
    description: "Submitted your first pull request",
  },
  {
    id: "bug-hunter",
    label: "Bug Hunter",
    icon: Zap,
    unlocked: true,
    color: "text-red-500",
    description: "Found and fixed 5+ bugs",
  },
  {
    id: "helper",
    label: "Community Helper",
    icon: MessageCircle,
    unlocked: false,
    color: "text-blue-500",
    description: "Helped 10+ contributors",
  },
  {
    id: "top-contributor",
    label: "Top Contributor",
    icon: Trophy,
    unlocked: false,
    color: "text-purple-500",
    description: "Ranked in top 10 contributors",
  },
];

const RESOURCES = [
  {
    title: "Git & GitHub Basics",
    type: "Tutorial",
    duration: "15 min",
    link: "#",
    difficulty: "beginner",
  },
  {
    title: "Writing Good PR Descriptions",
    type: "Guide",
    duration: "5 min",
    link: "#",
    difficulty: "beginner",
  },
  {
    title: "Code Review Checklist",
    type: "PDF",
    duration: "2 min",
    link: "#",
    difficulty: "intermediate",
  },
  {
    title: "Eventra Architecture Overview",
    type: "Video",
    duration: "20 min",
    link: "#",
    difficulty: "advanced",
  },
];

// ============ UTILITY HOOKS ============
const useCountdown = (endDate, onEnd) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(endDate));

  useEffect(() => {
    if (timeLeft.ended) {
      onEnd?.();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft.ended, endDate, onEnd]);

  return timeLeft;
};

const calculateTimeLeft = (endDate) => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ended: false,
  };
};

const useKeyboardShortcut = (key, callback, deps = []) => {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === key && !e.target.matches("input, textarea")) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
};

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};

// ============ UTILITY FUNCTIONS ============
const getStatusColor = (status) =>
  ({
    completed:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    current:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 animate-pulse",
    upcoming:
      "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600",
  })[status];

const formatNumber = (num) => (num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num);

// ============ REUSABLE COMPONENTS (Memoized) ============
const CountdownTimer = memo(({ timeLeft }) => {
  const units = Object.entries(timeLeft).filter(([key]) => key !== "ended");

  return (
    <div className="grid grid-cols-4 gap-2 text-center sm:gap-3" role="timer" aria-live="polite">
      {units.map(([unit, value]) => (
        <motion.div
          key={unit}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2 text-white shadow-lg sm:p-3"
        >
          <div className="text-lg font-bold tabular-nums sm:text-2xl">
            {String(value).padStart(2, "0")}
          </div>
          <div className="text-[10px] capitalize opacity-90 sm:text-xs">{unit}</div>
        </motion.div>
      ))}
    </div>
  );
});
CountdownTimer.displayName = "CountdownTimer";

const MentorCard = memo(({ mentor, onConnect }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="flex items-center gap-3 rounded-xl border bg-white p-4 transition-shadow hover:shadow-lg dark:border-gray-600 dark:bg-gray-700/50"
      role="article"
      aria-label={`Mentor: ${mentor.name}`}
    >
      <div className="text-3xl" aria-hidden="true">
        {mentor.avatar}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-medium text-gray-900 dark:text-white">{mentor.name}</h4>
          {mentor.available && (
            <span
              className="h-2 w-2 animate-pulse rounded-full bg-green-500"
              title="Available for mentoring"
              aria-label="Available"
            />
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{mentor.role}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {mentor.expertise.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] text-indigo-700 sm:text-xs dark:bg-indigo-900/30 dark:text-indigo-300"
            >
              {skill}
            </span>
          ))}
        </div>
        {isHovered && mentor.bio && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 line-clamp-2 text-xs text-gray-600 dark:text-gray-300"
          >
            {mentor.bio}
          </motion.p>
        )}
      </div>
      {mentor.available ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onConnect?.(mentor)}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800"
          aria-label={`Connect with ${mentor.name}`}
        >
          Connect
        </motion.button>
      ) : (
        <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          Busy
        </span>
      )}
    </motion.article>
  );
});
MentorCard.displayName = "MentorCard";

const AchievementBadge = memo(({ achievement, onUnlock }) => {
  const Icon = achievement.icon;
  const isUnlocked = achievement.unlocked;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => !isUnlocked && onUnlock?.(achievement)}
      disabled={isUnlocked}
      className={`relative rounded-xl border-2 p-3 transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800 ${
        isUnlocked
          ? "cursor-default border-yellow-300 bg-white shadow-md dark:border-yellow-600 dark:bg-gray-700"
          : "border-gray-200 bg-gray-50 opacity-60 hover:border-blue-300 hover:opacity-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700"
      } ${!isUnlocked ? "focus:ring-blue-500" : "focus:ring-yellow-500"}`}
      aria-label={`${achievement.label}: ${achievement.description}${isUnlocked ? " (Unlocked)" : " (Locked)"}`}
      title={achievement.description}
    >
      <Icon
        className={`mx-auto mb-2 h-6 w-6 ${isUnlocked ? achievement.color : "text-gray-400"}`}
        aria-hidden="true"
      />
      <p
        className={`text-center text-xs font-medium ${isUnlocked ? "text-gray-700 dark:text-gray-300" : "text-gray-500"}`}
      >
        {achievement.label}
      </p>
      {!isUnlocked && <p className="mt-1 text-center text-[10px] text-gray-400">Locked</p>}
      {isUnlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500"
          aria-hidden="true"
        >
          <CheckCircle className="h-3 w-3 text-white" />
        </motion.div>
      )}
    </motion.button>
  );
});
AchievementBadge.displayName = "AchievementBadge";

const TimelineItem = memo(({ item, isLast }) => {
  const Icon = item.icon;
  const statusColors = getStatusColor(item.status);

  return (
    <div className="flex gap-4" role="listitem">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${statusColors}`}
          aria-label={`${item.phase}: ${item.status}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </motion.div>
        {!isLast && (
          <div
            className={`my-2 w-0.5 flex-1 ${item.status === "completed" ? "bg-green-400" : "bg-gray-300 dark:bg-gray-600"}`}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="pb-6">
        <h4 className="font-medium text-gray-900 dark:text-white">{item.phase}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
        {item.status === "current" && (
          <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            In Progress
          </span>
        )}
      </div>
    </div>
  );
});
TimelineItem.displayName = "TimelineItem";

const ResourceItem = memo(({ resource, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(resource.link);
      setCopied(true);
      onCopy?.(resource.title);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <motion.a
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      href={resource.link}
      onClick={handleCopy}
      className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:hover:bg-gray-700/50"
      role="listitem"
    >
      <div>
        <p className="text-sm font-medium text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
          {resource.title}
        </p>
        <p className="text-xs text-gray-500">
          {resource.type} • {resource.duration} •{" "}
          <span className="capitalize">{resource.difficulty}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        {copied ? (
          <CheckCircle className="h-4 w-4 text-green-500" aria-label="Copied" />
        ) : (
          <Copy
            className="h-4 w-4 text-gray-400 transition-colors group-hover:text-indigo-500"
            aria-hidden="true"
          />
        )}
        <ArrowRight
          className="h-4 w-4 text-gray-400 transition-colors group-hover:text-indigo-500"
          aria-hidden="true"
        />
      </div>
    </motion.a>
  );
});
ResourceItem.displayName = "ResourceItem";

const StatCard = memo(({ label, value, icon: Icon, color }) => (
  <motion.div whileHover={{ y: -2 }} className="p-3 text-center" role="status">
    <Icon className={`mx-auto mb-2 h-6 w-6 ${color}`} aria-hidden="true" />
    <div className="text-xl font-bold text-gray-900 tabular-nums dark:text-white">
      {formatNumber(value)}
    </div>
    <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
  </motion.div>
));
StatCard.displayName = "StatCard";

// Skeleton Components
const Skeleton = ({ className }) => (
  <div
    className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
    aria-hidden="true"
  />
);

// Toast Component
const ToastContainer = ({ toasts, onClose }) => (
  <div
    className="fixed right-4 bottom-4 z-50 space-y-2"
    role="region"
    aria-live="polite"
    aria-label="Notifications"
  >
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
              : toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
                : "border-gray-200 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          }`}
          role="alert"
        >
          {toast.type === "success" && <CheckCircle className="h-5 w-5" aria-hidden="true" />}
          {toast.type === "error" && <Bell className="h-5 w-5" aria-hidden="true" />}
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => onClose(toast.id)}
            className="ml-2 rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ============ MAIN COMPONENT ============
const GSSoCContribution = () => {
  const prefersReducedMotion = useReducedMotion();
  useDocumentTitle("Eventra | GSSoC Contribution");
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const { toasts, addToast, removeToast } = useToast();

  // State with localStorage persistence
  const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem("gssoc.search") || "");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    () => localStorage.getItem("gssoc.difficulty") || "all"
  );
  const [userStats] = useState(() => {
    const saved = localStorage.getItem("gssoc.userStats");
    return saved
      ? safeJsonParse(saved, {})
      : {
          issuesClaimed: 3,
          prsMerged: 2,
          points: 450,
          rank: "Rising Star",
        };
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Countdown
  const GSSOC_END_DATE = "2026-08-15T23:59:59";

  const timeLeft = useCountdown(GSSOC_END_DATE, () => {
    addToast("🎉 GSSoC program has ended!", "success");
  });

  // Persist state changes
  useEffect(() => {
    localStorage.setItem("gssoc.search", searchQuery);
  }, [searchQuery]);
  useEffect(() => {
    localStorage.setItem("gssoc.difficulty", selectedDifficulty);
  }, [selectedDifficulty]);
  useEffect(() => {
    localStorage.setItem("gssoc.userStats", JSON.stringify(userStats));
  }, [userStats]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      addToast("🟢 You're back online!", "success");
    };
    const handleOffline = () => {
      setIsOffline(true);
      addToast("🔴 You're offline. Some features may be limited.", "error");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addToast]);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut: "/" to focus search
  useKeyboardShortcut(
    "/",
    () => {
      searchInputRef.current?.focus();
      addToast("🔍 Search focused. Start typing...", "info", 1500);
    },
    [addToast]
  );

  // Filtered resources with difficulty filter
  const filteredResources = useMemo(() => {
    let result = RESOURCES;
    if (debouncedSearchQuery) {
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          r.type.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }
    if (selectedDifficulty !== "all") {
      result = result.filter((r) => r.difficulty === selectedDifficulty);
    }
    return result;
  }, [debouncedSearchQuery, selectedDifficulty]);

  // Handlers
  const handleMentorConnect = useCallback(
    (mentor) => {
      addToast(`📬 Connection request sent to ${mentor.name}!`, "success");
    },
    [addToast]
  );

  const handleAchievementUnlock = useCallback(
    (achievement) => {
      addToast(`🔒 "${achievement.label}" is locked. Keep contributing to unlock!`, "info");
    },
    [addToast]
  );

  const handleResourceCopy = useCallback(
    (title) => {
      addToast(`📋 Link copied for "${title}"`, "success");
    },
    [addToast]
  );

  // Animation variants
  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
      },
    }),
    []
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: prefersReducedMotion ? 0 : 0.4,
          ease: [0.22, 1, 0.36, 1],
        },
      },
    }),
    [prefersReducedMotion]
  );

  // Stats section visibility
  const statsRef = useRef(null);
  useInView(statsRef, { once: true, margin: "-100px" });

  if (isLoading) {
    return (
      <div className="mx-auto my-10 min-h-screen w-[95%] pb-12">
        <div className="mb-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 p-8">
          <Skeleton className="mb-4 h-8 w-64" />
          <Skeleton className="mb-6 h-4 w-96" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-yellow-300 bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-900/30"
            role="alert"
          >
            <div className="mx-auto flex w-[95%] items-center gap-2 px-4 py-2 text-sm text-yellow-800 dark:text-yellow-300">
              <WifiOff className="h-4 w-4" aria-hidden="true" />
              <span>You&apos;re offline. Changes will sync when you&apos;re back online.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-bg mx-auto my-10 min-h-screen w-[95%] pb-12"
        role="main"
      >
        {/* 🎯 HERO SECTION */}
        <motion.section
          variants={itemVariants}
          className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white shadow-lg sm:mb-8 sm:p-8"
          aria-labelledby="hero-heading"
        >
          {/* Decorative background */}
          <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-yellow-300 blur-3xl" />
          </div>

          <div className="relative z-10 grid items-center gap-6 sm:gap-8 md:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-300" aria-hidden="true" />
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                  GSSoC 2024
                </span>
              </div>
              <h1
                id="hero-heading"
                className="mb-3 text-2xl leading-tight font-bold sm:mb-4 sm:text-3xl md:text-4xl"
              >
                Contribute to Eventra & <br className="hidden sm:block" />
                <span className="text-yellow-300">Level Up Your Skills</span>
              </h1>
              <p className="mb-4 max-w-xl text-base leading-relaxed text-indigo-100 sm:mb-6 sm:text-lg">
                Join 500+ contributors building real-world features. Earn points, badges, and
                recognition while making an impact.
              </p>

              {/* User Stats */}
              <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:grid-cols-4 sm:gap-3">
                {[
                  { label: "Issues", value: userStats.issuesClaimed, icon: Target },
                  { label: "PRs", value: userStats.prsMerged, icon: GitBranch },
                  { label: "Points", value: userStats.points, icon: Star },
                  { label: "Rank", value: userStats.rank.split(" ")[0], icon: Award },
                ].map(({ label, value, icon: Icon }) => (
                  <motion.div
                    key={label}
                    className="rounded-xl bg-white/10 p-2 text-center backdrop-blur-sm sm:p-3"
                    whileHover={{ scale: 1.03 }}
                  >
                    <Icon
                      className="mx-auto mb-1 h-4 w-4 text-yellow-300 sm:h-5 sm:w-5"
                      aria-hidden="true"
                    />
                    <div className="text-lg font-bold tabular-nums sm:text-xl">
                      {formatNumber(value)}
                    </div>
                    <div className="text-[10px] opacity-90 sm:text-xs">{label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Countdown Card */}
            <motion.aside
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md sm:p-6"
              aria-labelledby="countdown-heading"
            >
              <div className="mb-3 flex items-center gap-2 sm:mb-4">
                <Clock className="h-5 w-5" aria-hidden="true" />
                <h3 id="countdown-heading" className="font-semibold">
                  Program Ends In
                </h3>
              </div>
              {timeLeft.ended ? (
                <div className="py-4 text-center">
                  <Trophy className="mx-auto mb-3 h-12 w-12 text-yellow-300" aria-hidden="true" />
                  <p className="font-medium">Program Completed! 🎉</p>
                  <p className="text-sm opacity-90">Check final rankings soon</p>
                </div>
              ) : (
                <CountdownTimer timeLeft={timeLeft} />
              )}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  window.open("https://gssoc.girlscript.tech", "_blank", "noopener,noreferrer")
                }
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 focus:outline-none sm:mt-4"
                aria-label="View GSSoC leaderboard (opens in new tab)"
              >
                <span>View Leaderboard</span>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </motion.aside>
          </div>
        </motion.section>

        {/* 📋 GUIDELINES */}
        <motion.section
          variants={itemVariants}
          className="mb-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-lg sm:mb-8 sm:p-8 dark:border-gray-700 dark:bg-gray-800"
          aria-labelledby="guidelines-heading"
        >
          <div className="mb-6 text-center sm:mb-8">
            <h2
              id="guidelines-heading"
              className="mb-2 text-xl font-bold text-indigo-700 sm:text-2xl dark:text-indigo-400"
            >
              🌟 Contribution Guidelines
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
              Follow these best practices to make your open-source journey smooth and successful.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {[
              {
                icon: Lightbulb,
                title: "Explore Issues",
                desc: "Start with beginner-friendly tasks",
                color: "text-yellow-500",
              },
              {
                icon: Code2,
                title: "Clean PRs",
                desc: "Tested, documented, well-structured",
                color: "text-green-500",
              },
              {
                icon: GitBranch,
                title: "Collaborate",
                desc: "Discuss, review, and learn together",
                color: "text-purple-500",
              },
              {
                icon: BookOpen,
                title: "Read Docs",
                desc: "Understand before you contribute",
                color: "text-blue-500",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <motion.article
                key={title}
                whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}
                className="rounded-2xl border bg-gray-50 p-4 text-center transition-shadow sm:p-5 dark:border-gray-600 dark:bg-gray-700/50"
              >
                <Icon
                  className={`mx-auto mb-2 h-8 w-8 sm:mb-3 sm:h-9 sm:w-9 ${color}`}
                  aria-hidden="true"
                />
                <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* 🎮 Achievements & Resources */}
        <motion.section
          variants={itemVariants}
          className="mb-6 grid gap-4 sm:mb-8 sm:gap-6 md:grid-cols-2"
        >
          {/* Achievements */}
          <article className="bg-card-bg rounded-2xl border border-gray-200 p-4 sm:p-6 dark:border-gray-700">
            <div className="mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" aria-hidden="true" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Your Achievements</h3>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {ACHIEVEMENTS.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  onUnlock={handleAchievementUnlock}
                />
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
              {ACHIEVEMENTS.filter((a) => a.unlocked).length}/{ACHIEVEMENTS.length} unlocked
            </p>
          </article>

          {/* Resources with Search & Filter */}
          <article className="bg-card-bg rounded-2xl border border-gray-200 p-4 sm:p-6 dark:border-gray-700">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" aria-hidden="true" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Quick Resources</h3>
              </div>
              <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                {filteredResources.length} items
              </span>
            </div>

            {/* Search + Filter */}
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search
                  className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search tutorials, guides... (Press / to focus)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-4 pl-9 text-sm placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  aria-label="Search resources"
                />
              </div>
              <div className="flex gap-2">
                {["all", "beginner", "intermediate", "advanced"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`rounded-full px-3 py-1 text-xs transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                      selectedDifficulty === level
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                    aria-pressed={selectedDifficulty === level}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Resource List */}
            <div
              className="max-h-48 space-y-2 overflow-y-auto pr-2"
              role="list"
              aria-label="Resource list"
            >
              <AnimatePresence mode="popLayout">
                {filteredResources.map((resource) => (
                  <ResourceItem
                    key={resource.title}
                    resource={resource}
                    onCopy={handleResourceCopy}
                  />
                ))}
              </AnimatePresence>
              {filteredResources.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-500" role="status">
                  No resources found. Try different keywords.
                </p>
              )}
            </div>
          </article>
        </motion.section>

        {/* 👥 Mentors */}
        <motion.section
          variants={itemVariants}
          className="bg-card-bg mb-6 rounded-2xl border border-gray-200 p-4 sm:mb-8 sm:p-6 dark:border-gray-700"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" aria-hidden="true" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Meet Your Mentors</h3>
            </div>
            <button
              className="flex items-center gap-1 rounded text-sm text-indigo-600 hover:underline focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-indigo-400"
              aria-label="button"
            >
              View All <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {MENTORS.map((mentor) => (
              <MentorCard key={mentor.name} mentor={mentor} onConnect={handleMentorConnect} />
            ))}
          </div>
        </motion.section>

        {/* 📅 Timeline */}
        <motion.section
          variants={itemVariants}
          className="bg-card-bg mb-6 rounded-2xl border border-gray-200 p-4 sm:mb-8 sm:p-6 dark:border-gray-700"
        >
          <div className="mb-4 flex items-center gap-2 sm:mb-6">
            <Calendar className="h-5 w-5 text-purple-500" aria-hidden="true" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Program Timeline</h3>
          </div>

          <div className="relative pl-2" role="list" aria-label="Program timeline">
            {GSSOC_TIMELINE.map((item, idx) => (
              <TimelineItem
                key={item.phase}
                item={item}
                isLast={idx === GSSOC_TIMELINE.length - 1}
              />
            ))}
          </div>
        </motion.section>

        {/* Getting Started & Best Practices */}
        <motion.section
          className="mb-6 grid gap-4 sm:mb-8 sm:gap-6 md:grid-cols-2"
          variants={itemVariants}
        >
          {/* Getting Started */}
          <article className="rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Getting Started
              </h3>
            </div>
            <ol className="space-y-2 sm:space-y-3">
              {[
                "Sign up on GSSoC platform",
                "Join Eventra's Discord community",
                "Browse issues labeled 'good first issue'",
                "Comment on an issue to claim it",
                "Fork, code, and submit your PR!",
              ].map((step, idx) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                </li>
              ))}
            </ol>
          </article>

          {/* Best Practices */}
          <article className="bg-card-bg rounded-2xl border p-4 sm:p-6 dark:border-gray-700">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <CheckCircle
                  className="h-5 w-5 text-purple-600 dark:text-purple-400"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Best Practices
              </h3>
            </div>
            <ul className="space-y-2 sm:space-y-3">
              {[
                "Be respectful & inclusive in all discussions",
                "Write clear PR titles and descriptions",
                "Test your changes locally before pushing",
                "Ask for help early if you're stuck",
                "Review others' PRs to learn and give back",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-3">
                  <CheckCircle
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
                </li>
              ))}
            </ul>
          </article>
        </motion.section>

        {/* 🚀 Action Buttons */}
        <motion.nav
          variants={itemVariants}
          className="mb-8 flex flex-col justify-center gap-3 sm:mb-12 sm:flex-row sm:gap-4"
          aria-label="Primary actions"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/contributorguide")}
            className="flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none sm:px-8 dark:focus:ring-offset-black"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Contributor&apos;s Guide
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              window.open(
                "https://github.com/SandeepVashishtha/Eventra",
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-pink-600 hover:to-orange-600 hover:shadow-xl focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:outline-none sm:px-8 dark:focus:ring-offset-black"
          >
            <GitBranch className="h-4 w-4" aria-hidden="true" />
            Start Contributing
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              window.open("https://discord.gg/6MQ9r5nHT", "_blank", "noopener,noreferrer")
            }
            className="flex items-center justify-center gap-2 rounded-full bg-[#5865F2] px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-[#4752C4] hover:shadow-xl focus:ring-2 focus:ring-[#5865F2] focus:ring-offset-2 focus:outline-none sm:px-8 dark:focus:ring-offset-black"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Join Discord
          </motion.button>
        </motion.nav>

        {/* 📊 Footer Stats */}
        <motion.section
          ref={statsRef}
          variants={itemVariants}
          className="rounded-2xl border bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-6 dark:border-gray-600 dark:from-gray-800 dark:to-gray-700"
          aria-labelledby="stats-heading"
        >
          <h3 id="stats-heading" className="sr-only">
            Community Statistics
          </h3>
          <div className="grid grid-cols-2 gap-3 text-center sm:gap-4 md:grid-cols-4">
            {[
              {
                label: "Active Contributors",
                value: 500,
                suffix: "+",
                icon: Users,
                color: "text-blue-500",
              },
              { label: "Issues Solved", value: 1200, icon: CheckCircle, color: "text-green-500" },
              {
                label: "PRs Merged",
                value: 850,
                suffix: "+",
                icon: GitBranch,
                color: "text-purple-500",
              },
              { label: "Countries", value: 45, suffix: "+", icon: Globe, color: "text-orange-500" },
            ].map(({ label, value, suffix, icon: Icon, color }) => (
              <StatCard
                key={label}
                label={label}
                value={value}
                suffix={suffix}
                icon={Icon}
                color={color}
              />
            ))}
          </div>
        </motion.section>
      </motion.main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

export default GSSoCContribution;
