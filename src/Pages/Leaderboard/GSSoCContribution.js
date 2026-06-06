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
  { name: "Priya Sharma", role: "Frontend Lead", expertise: ["React", "Tailwind"], avatar: "👩‍💻", available: true, bio: "10+ years in frontend architecture" },
  { name: "Rahul Verma", role: "Backend Expert", expertise: ["Node.js", "MongoDB"], avatar: "👨‍💻", available: true, bio: "Scalable systems specialist" },
  { name: "Anita Das", role: "DevOps Mentor", expertise: ["Docker", "CI/CD"], avatar: "👩‍🔧", available: false, bio: "Cloud infrastructure expert" },
  { name: "Vikram Singh", role: "Full-Stack Guide", expertise: ["MERN", "GraphQL"], avatar: "👨‍🚀", available: true, bio: "End-to-end product builder" },
];

const ACHIEVEMENTS = [
  { id: "first-pr", label: "First PR", icon: Star, unlocked: true, color: "text-yellow-500", description: "Submitted your first pull request" },
  { id: "bug-hunter", label: "Bug Hunter", icon: Zap, unlocked: true, color: "text-red-500", description: "Found and fixed 5+ bugs" },
  { id: "helper", label: "Community Helper", icon: MessageCircle, unlocked: false, color: "text-blue-500", description: "Helped 10+ contributors" },
  { id: "top-contributor", label: "Top Contributor", icon: Trophy, unlocked: false, color: "text-purple-500", description: "Ranked in top 10 contributors" },
];

const RESOURCES = [
  { title: "Git & GitHub Basics", type: "Tutorial", duration: "15 min", link: "#", difficulty: "beginner" },
  { title: "Writing Good PR Descriptions", type: "Guide", duration: "5 min", link: "#", difficulty: "beginner" },
  { title: "Code Review Checklist", type: "PDF", duration: "2 min", link: "#", difficulty: "intermediate" },
  { title: "Eventra Architecture Overview", type: "Video", duration: "20 min", link: "#", difficulty: "advanced" },
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
    ended: false
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
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);
  
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  return { toasts, addToast, removeToast };
};

// ============ UTILITY FUNCTIONS ============
const getStatusColor = (status) => ({
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  current: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 animate-pulse",
  upcoming: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600"
}[status]);

const formatNumber = (num) => num >= 1000 ? `${(num/1000).toFixed(1)}k` : num;

// ============ REUSABLE COMPONENTS (Memoized) ============
const CountdownTimer = memo(({ timeLeft }) => {
  const units = Object.entries(timeLeft).filter(([key]) => key !== 'ended');
  
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center" role="timer" aria-live="polite">
      {units.map(([unit, value]) => (
        <motion.div
          key={unit}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-2 sm:p-3 text-white shadow-lg"
        >
          <div className="text-lg sm:text-2xl font-bold tabular-nums">{String(value).padStart(2, '0')}</div>
          <div className="text-[10px] sm:text-xs opacity-90 capitalize">{unit}</div>
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
      className="p-4 bg-white dark:bg-gray-700/50 rounded-xl border dark:border-gray-600 flex items-center gap-3 transition-shadow hover:shadow-lg"
      role="article"
      aria-label={`Mentor: ${mentor.name}`}
    >
      <div className="text-3xl" aria-hidden="true">{mentor.avatar}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">{mentor.name}</h4>
          {mentor.available && (
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Available for mentoring" aria-label="Available" />
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{mentor.role}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {mentor.expertise.map(skill => (
            <span key={skill} className="text-[10px] sm:text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
              {skill}
            </span>
          ))}
        </div>
        {isHovered && mentor.bio && (
          <motion.p 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2"
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
          className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          aria-label={`Connect with ${mentor.name}`}
        >
          Connect
        </motion.button>
      ) : (
        <span className="text-xs px-3 py-1.5 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg">
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
      className={`relative p-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
        isUnlocked 
          ? 'bg-white dark:bg-gray-700 border-yellow-300 dark:border-yellow-600 shadow-md cursor-default' 
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100 hover:border-blue-300 dark:hover:border-blue-700'
      } ${!isUnlocked ? 'focus:ring-blue-500' : 'focus:ring-yellow-500'}`}
      aria-label={`${achievement.label}: ${achievement.description}${isUnlocked ? ' (Unlocked)' : ' (Locked)'}`}
      title={achievement.description}
    >
      <Icon className={`w-6 h-6 mx-auto mb-2 ${isUnlocked ? achievement.color : 'text-gray-400'}`} aria-hidden="true" />
      <p className={`text-xs font-medium text-center ${isUnlocked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500'}`}>
        {achievement.label}
      </p>
      {!isUnlocked && (
        <p className="text-[10px] text-gray-400 text-center mt-1">Locked</p>
      )}
      {isUnlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
          aria-hidden="true"
        >
          <CheckCircle className="w-3 h-3 text-white" />
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
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${statusColors}`}
          aria-label={`${item.phase}: ${item.status}`}
        >
          <Icon className="w-5 h-5" aria-hidden="true" />
        </motion.div>
        {!isLast && (
          <div className={`w-0.5 flex-1 my-2 ${item.status === 'completed' ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`} aria-hidden="true" />
        )}
      </div>
      <div className="pb-6">
        <h4 className="font-medium text-gray-900 dark:text-white">{item.phase}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
        {item.status === 'current' && (
          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
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
      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors group focus:outline-none focus:ring-2 focus:ring-indigo-500"
      role="listitem"
    >
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {resource.title}
        </p>
        <p className="text-xs text-gray-500">{resource.type} • {resource.duration} • <span className="capitalize">{resource.difficulty}</span></p>
      </div>
      <div className="flex items-center gap-2">
        {copied ? (
          <CheckCircle className="w-4 h-4 text-green-500" aria-label="Copied" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" aria-hidden="true" />
        )}
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" aria-hidden="true" />
      </div>
    </motion.a>
  );
});
ResourceItem.displayName = "ResourceItem";

const StatCard = memo(({ label, value, icon: Icon, color }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="p-3 text-center"
    role="status"
  >
    <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} aria-hidden="true" />
    <div className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">{formatNumber(value)}</div>
    <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
  </motion.div>
));
StatCard.displayName = "StatCard";

// Skeleton Components
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} aria-hidden="true" />
);

// Toast Component
const ToastContainer = ({ toasts, onClose }) => (
  <div className="fixed bottom-4 right-4 z-50 space-y-2" role="region" aria-live="polite" aria-label="Notifications">
    <AnimatePresence>
      {toasts.map(toast => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' :
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300' :
            'bg-white border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200'
          }`}
          role="alert"
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" aria-hidden="true" />}
          {toast.type === 'error' && <Bell className="w-5 h-5" aria-hidden="true" />}
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => onClose(toast.id)}
            className="ml-2 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
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
  const [selectedDifficulty, setSelectedDifficulty] = useState(() => localStorage.getItem("gssoc.difficulty") || "all");
  const [userStats] = useState(() => {
    const saved = localStorage.getItem("gssoc.userStats");
    return saved ? safeJsonParse(saved, {}) : {
      issuesClaimed: 3,
      prsMerged: 2,
      points: 450,
      rank: "Rising Star"
    };
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Countdown
  const GSSOC_END_DATE = "2026-08-15T23:59:59";

const timeLeft = useCountdown(
  GSSOC_END_DATE,
  () => {
    addToast("🎉 GSSoC program has ended!", "success");
  }
);
  
  // Persist state changes
  useEffect(() => { localStorage.setItem("gssoc.search", searchQuery); }, [searchQuery]);
  useEffect(() => { localStorage.setItem("gssoc.difficulty", selectedDifficulty); }, [selectedDifficulty]);
  useEffect(() => { localStorage.setItem("gssoc.userStats", JSON.stringify(userStats)); }, [userStats]);
  
  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => { setIsOffline(false); addToast("🟢 You're back online!", "success"); };
    const handleOffline = () => { setIsOffline(true); addToast("🔴 You're offline. Some features may be limited.", "error"); };
    
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
  useKeyboardShortcut("/", () => {
    searchInputRef.current?.focus();
    addToast("🔍 Search focused. Start typing...", "info", 1500);
  }, [addToast]);
  
  // Filtered resources with difficulty filter
  const filteredResources = useMemo(() => {
    let result = RESOURCES;
    if (debouncedSearchQuery) {
      result = result.filter(r => 
        r.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }
    if (selectedDifficulty !== "all") {
      result = result.filter(r => r.difficulty === selectedDifficulty);
    }
    return result;
  }, [debouncedSearchQuery, selectedDifficulty]);
  
  // Handlers
  const handleMentorConnect = useCallback((mentor) => {
    addToast(`📬 Connection request sent to ${mentor.name}!`, "success");
  }, [addToast]);
  
  const handleAchievementUnlock = useCallback((achievement) => {
    addToast(`🔒 "${achievement.label}" is locked. Keep contributing to unlock!`, "info");
  }, [addToast]);
  
  const handleResourceCopy = useCallback((title) => {
    addToast(`📋 Link copied for "${title}"`, "success");
  }, [addToast]);
  
  // Animation variants
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.08, delayChildren: 0.1 } 
    }
  }), []);
  
  const itemVariants = useMemo(() => ({
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: prefersReducedMotion ? 0 : 0.4,
        ease: [0.22, 1, 0.36, 1]
      } 
    }
  }), [prefersReducedMotion]);
  
  // Stats section visibility
  const statsRef = useRef(null);
  useInView(statsRef, { once: true, margin: "-100px" });
  
  if (isLoading) {
    return (
      <div className="w-[95%] mx-auto my-10 min-h-screen pb-12">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96 mb-6" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
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
            className="bg-yellow-100 dark:bg-yellow-900/30 border-b border-yellow-300 dark:border-yellow-800"
            role="alert"
          >
            <div className="w-[95%] mx-auto py-2 px-4 flex items-center gap-2 text-yellow-800 dark:text-yellow-300 text-sm">
              <WifiOff className="w-4 h-4" aria-hidden="true" />
              <span>You&apos;re offline. Changes will sync when you&apos;re back online.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-[95%] mx-auto my-10 bg-bg min-h-screen pb-12"
        role="main"
      >
        {/* 🎯 HERO SECTION */}
        <motion.section
          variants={itemVariants}
          className="p-6 sm:p-8 rounded-3xl shadow-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white mb-6 sm:mb-8 relative overflow-hidden"
          aria-labelledby="hero-heading"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-yellow-300" aria-hidden="true" />
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  GSSoC 2024
                </span>
              </div>
              <h1 id="hero-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
                Contribute to Eventra & <br className="hidden sm:block"/>
                <span className="text-yellow-300">Level Up Your Skills</span>
              </h1>
              <p className="text-indigo-100 text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed max-w-xl">
                Join 500+ contributors building real-world features. Earn points, 
                badges, and recognition while making an impact.
              </p>
              
              {/* User Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {[
                  { label: "Issues", value: userStats.issuesClaimed, icon: Target },
                  { label: "PRs", value: userStats.prsMerged, icon: GitBranch },
                  { label: "Points", value: userStats.points, icon: Star },
                  { label: "Rank", value: userStats.rank.split(' ')[0], icon: Award },
                ].map(({ label, value, icon: Icon }) => (
                  <motion.div 
                    key={label} 
                    className="text-center p-2 sm:p-3 bg-white/10 rounded-xl backdrop-blur-sm"
                    whileHover={{ scale: 1.03 }}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-yellow-300" aria-hidden="true" />
                    <div className="text-lg sm:text-xl font-bold tabular-nums">{formatNumber(value)}</div>
                    <div className="text-[10px] sm:text-xs opacity-90">{label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Countdown Card */}
            <motion.aside
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20"
              aria-labelledby="countdown-heading"
            >
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Clock className="w-5 h-5" aria-hidden="true" />
                <h3 id="countdown-heading" className="font-semibold">Program Ends In</h3>
              </div>
              {timeLeft.ended ? (
                <div className="text-center py-4">
                  <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-300" aria-hidden="true" />
                  <p className="font-medium">Program Completed! 🎉</p>
                  <p className="text-sm opacity-90">Check final rankings soon</p>
                </div>
              ) : (
                <CountdownTimer timeLeft={timeLeft} />
              )}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open("https://gssoc.girlscript.tech", "_blank", "noopener,noreferrer")}
                className="w-full mt-3 sm:mt-4 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                aria-label="View GSSoC leaderboard (opens in new tab)"
              >
                <span>View Leaderboard</span>
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </motion.button>
            </motion.aside>
          </div>
        </motion.section>

        {/* 📋 GUIDELINES */}
        <motion.section
          variants={itemVariants}
          className="p-6 sm:p-8 rounded-3xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8"
          aria-labelledby="guidelines-heading"
        >
          <div className="text-center mb-6 sm:mb-8">
            <h2 id="guidelines-heading" className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">
              🌟 Contribution Guidelines
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Follow these best practices to make your open-source journey smooth and successful.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Lightbulb, title: "Explore Issues", desc: "Start with beginner-friendly tasks", color: "text-yellow-500" },
              { icon: Code2, title: "Clean PRs", desc: "Tested, documented, well-structured", color: "text-green-500" },
              { icon: GitBranch, title: "Collaborate", desc: "Discuss, review, and learn together", color: "text-purple-500" },
              { icon: BookOpen, title: "Read Docs", desc: "Understand before you contribute", color: "text-blue-500" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <motion.article
                key={title}
                whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}
                className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border dark:border-gray-600 text-center transition-shadow"
              >
                <Icon className={`w-8 h-8 sm:w-9 sm:h-9 mx-auto mb-2 sm:mb-3 ${color}`} aria-hidden="true" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* 🎮 Achievements & Resources */}
        <motion.section variants={itemVariants} className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Achievements */}
          <article className="p-4 sm:p-6 rounded-2xl bg-card-bg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-yellow-500" aria-hidden="true" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Your Achievements</h3>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {ACHIEVEMENTS.map(achievement => (
                <AchievementBadge 
                  key={achievement.id} 
                  achievement={achievement} 
                  onUnlock={handleAchievementUnlock} 
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              {ACHIEVEMENTS.filter(a => a.unlocked).length}/{ACHIEVEMENTS.length} unlocked
            </p>
          </article>

          {/* Resources with Search & Filter */}
          <article className="p-4 sm:p-6 rounded-2xl bg-card-bg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" aria-hidden="true" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Quick Resources</h3>
              </div>
              <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                {filteredResources.length} items
              </span>
            </div>
            
            {/* Search + Filter */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search tutorials, guides... (Press / to focus)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white placeholder-gray-400"
                  aria-label="Search resources"
                />
              </div>
              <div className="flex gap-2">
                {["all", "beginner", "intermediate", "advanced"].map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      selectedDifficulty === level
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    aria-pressed={selectedDifficulty === level}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Resource List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2" role="list" aria-label="Resource list">
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
                <p className="text-sm text-gray-500 text-center py-4" role="status">No resources found. Try different keywords.</p>
              )}
            </div>
          </article>
        </motion.section>

        {/* 👥 Mentors */}
        <motion.section variants={itemVariants} className="p-4 sm:p-6 rounded-2xl bg-card-bg border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" aria-hidden="true" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Meet Your Mentors</h3>
            </div>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded" aria-label="button">
              View All <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-3">
            {MENTORS.map(mentor => (
              <MentorCard key={mentor.name} mentor={mentor} onConnect={handleMentorConnect} />
            ))}
          </div>
        </motion.section>

        {/* 📅 Timeline */}
        <motion.section variants={itemVariants} className="p-4 sm:p-6 rounded-2xl bg-card-bg border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Calendar className="w-5 h-5 text-purple-500" aria-hidden="true" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Program Timeline</h3>
          </div>
          
          <div className="relative pl-2" role="list" aria-label="Program timeline">
            {GSSOC_TIMELINE.map((item, idx) => (
              <TimelineItem key={item.phase} item={item} isLast={idx === GSSOC_TIMELINE.length - 1} />
            ))}
          </div>
        </motion.section>

        {/* Getting Started & Best Practices */}
        <motion.section className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8" variants={itemVariants}>
          {/* Getting Started */}
          <article className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Getting Started</h3>
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
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </article>

          {/* Best Practices */}
          <article className="p-4 sm:p-6 rounded-2xl bg-card-bg border dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Best Practices</h3>
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
                  <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-500 mt-0.5" aria-hidden="true" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </article>
        </motion.section>

        {/* 🚀 Action Buttons */}
        <motion.nav variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12" aria-label="Primary actions">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/contributorguide")}
            className="px-6 sm:px-8 py-3 rounded-full font-semibold text-white bg-gray-900 hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-black"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Contributor&apos;s Guide
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open("https://github.com/SandeepVashishtha/Eventra", "_blank", "noopener,noreferrer")}
            className="px-6 sm:px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 dark:focus:ring-offset-black"
          >
            <GitBranch className="w-4 h-4" aria-hidden="true" />
            Start Contributing
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open("https://discord.gg/eventra", "_blank", "noopener,noreferrer")}
            className="px-6 sm:px-8 py-3 rounded-full font-semibold text-white bg-[#5865F2] hover:bg-[#4752C4] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:ring-offset-2 dark:focus:ring-offset-black"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            Join Discord
          </motion.button>
        </motion.nav>

        {/* 📊 Footer Stats */}
        <motion.section
          ref={statsRef}
          variants={itemVariants}
          className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border dark:border-gray-600"
          aria-labelledby="stats-heading"
        >
          <h3 id="stats-heading" className="sr-only">Community Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
            {[
              { label: "Active Contributors", value: 500, suffix: "+", icon: Users, color: "text-blue-500" },
              { label: "Issues Solved", value: 1200, icon: CheckCircle, color: "text-green-500" },
              { label: "PRs Merged", value: 850, suffix: "+", icon: GitBranch, color: "text-purple-500" },
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
