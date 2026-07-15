import { useState, useMemo, useEffect, useCallback, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
// NEW
import { ArrowRight } from "lucide-react";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import {
  Lightbulb,
  Code2,
  GitBranch,
  BookOpen,
  CheckCircle,
  Trophy,
  Clock,
  Star,
  ExternalLink,
  Calendar,
  Award,
  MessageCircle,
  Zap,
  Target,
  Bell,
  WifiOff,
} from "lucide-react";
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

// const ACHIEVEMENTS = [
//   { id: "first-pr", label: "First PR", icon: Star, unlocked: true, color: "text-yellow-500", description: "Submitted your first pull request" },
//   { id: "bug-hunter", label: "Bug Hunter", icon: Zap, unlocked: true, color: "text-red-500", description: "Found and fixed 5+ bugs" },
//   { id: "helper", label: "Community Helper", icon: MessageCircle, unlocked: false, color: "text-blue-500", description: "Helped 10+ contributors" },
//   { id: "top-contributor", label: "Top Contributor", icon: Trophy, unlocked: false, color: "text-purple-500", description: "Ranked in top 10 contributors" },
// ];

// const LEARNING_RESOURCES = [
//   { title: "Git & GitHub Basics", type: "Tutorial", duration: "15 min", link: "#", difficulty: "beginner" },
//   { title: "Writing Good PR Descriptions", type: "Guide", duration: "5 min", link: "#", difficulty: "beginner" },
//   { title: "Code Review Checklist", type: "PDF", duration: "2 min", link: "#", difficulty: "intermediate" },
//   { title: "Eventra Architecture Overview", type: "Video", duration: "20 min", link: "#", difficulty: "advanced" },
// ];

// ============ UTILITY HOOKS ============
const useCountdown = (endDate, onEnd) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(endDate));
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (timeLeft.ended) {
      onEndRef.current?.();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft.ended, endDate]);

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

const useKeyboardShortcut = (key, callback) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === key && !e.target.matches("input, textarea")) {
        e.preventDefault();
        callbackRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key]);
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

const formatNumber = (num) => num >= 1000 ? `${(num/1000).toFixed(1)}k` : num;

// ============ SUB-COMPONENTS (Improves Cyclomatic Complexity) ============
const CountdownTimer = memo(({ timeLeft }) => {
  const units = Object.entries(timeLeft).filter(([key]) => key !== 'ended');
  
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center" role="timer" aria-live="off" aria-label="Countdown timer">
      {units.map(([unit, value]) => (
        <motion.div
          key={unit}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-indigo-600 dark:bg-indigo-500 rounded-xl p-2 sm:p-3 text-white shadow-sm"
        >
          <div className="text-lg sm:text-2xl font-bold tabular-nums">{String(value).padStart(2, '0')}</div>
          <div className="text-[10px] sm:text-xs opacity-90 capitalize">{unit}</div>
        </motion.div>
      ))}
    </div>
  );
});
CountdownTimer.displayName = "CountdownTimer";

const HeroStatCard = memo(({ label, value, icon: Icon }) => (
  <motion.div 
    key={label} 
    className="text-center p-3 sm:p-4 bg-white dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm"
    whileHover={{ scale: 1.03, y: -2 }}
  >
    <Icon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1.5 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
    <div className="text-lg sm:text-xl font-bold tabular-nums text-gray-900 dark:text-white">{formatNumber(value)}</div>
    <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
  </motion.div>
));
HeroStatCard.displayName = "HeroStatCard";

const HorizontalTimeline = memo(({ timeline, variants }) => {
  const total = timeline.length - 1;
  const currentIndex = timeline.findIndex(item => item.status === 'current');
  const progressPercent = currentIndex >= 0 ? (currentIndex / total) * 100 : 100;
  
  const currentItem = timeline[currentIndex];
  const nextItem = timeline[currentIndex + 1];

  return (
    <motion.section variants={variants} className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/30 dark:shadow-none mb-6 sm:mb-8 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 border-b border-slate-100 dark:border-slate-700/50 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Program Timeline</h3>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-13">Track your milestones and upcoming deadlines</p>
        </div>
        
        <div className="flex flex-col md:items-end bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-inner">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Program Progress</span>
            <span className="text-xs font-black text-white bg-linear-to-r from-indigo-500 to-violet-600 px-2.5 py-1 rounded-full shadow-md shadow-indigo-500/20">{Math.round(progressPercent)}% Complete</span>
          </div>
          {currentItem && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 font-medium">
              Current Phase: <strong className="text-slate-900 dark:text-white font-bold">{currentItem.phase}</strong>
            </p>
          )}
          {nextItem && (
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 font-medium">
              Next Milestone: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{nextItem.phase} ({nextItem.date})</span>
            </p>
          )}
        </div>
      </div>
      
      <div className="relative w-full py-4 overflow-x-auto hide-scrollbar">
        <div className="min-w-175 flex items-start justify-between relative px-8 md:px-12 pb-8 pt-2">
          <div className="absolute top-8.5 left-20 right-20 h-2 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50" aria-hidden="true">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="absolute top-0 left-0 h-full bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
            />
          </div>
          
          {timeline.map((item, idx) => {
            const Icon = item.icon;
            const isCompleted = item.status === 'completed';
            const isCurrent = item.status === 'current';
            
            return (
              <div key={item.phase} className="relative flex flex-col items-center w-32 shrink-0 z-10 group" role="listitem">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 shadow-xl transition-all duration-300 ${
                    isCompleted ? 'bg-linear-to-br from-indigo-500 to-violet-600 border-white dark:border-slate-900 text-white group-hover:scale-110 group-hover:-translate-y-1 shadow-indigo-500/20' : 
                    isCurrent ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-indigo-500 shadow-indigo-500/30 scale-110 group-hover:scale-125 group-hover:-translate-y-1' : 
                    'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-white dark:border-slate-900 shadow-slate-200/50 dark:shadow-none'
                  } ${isCurrent ? 'rotate-3 group-hover:rotate-6' : '-rotate-3 group-hover:rotate-0'}`}
                  aria-label={`${item.phase}: ${item.status}`}
                >
                  {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className={`w-6 h-6 ${isCurrent ? 'animate-pulse' : ''}`} aria-hidden="true" />}
                </motion.div>
                
                <div className="mt-5 text-center">
                  <h4 className={`text-sm font-extrabold mb-1.5 transition-colors ${
                    isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 
                    isCompleted ? 'text-slate-900 dark:text-white' : 
                    'text-slate-400 dark:text-slate-500'
                  }`}>
                    {item.phase}
                  </h4>
                  <p className={`text-xs ${isCurrent ? 'text-slate-700 dark:text-slate-300 font-bold' : 'text-slate-500 dark:text-slate-500 font-medium'}`}>
                    {item.date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
});
HorizontalTimeline.displayName = "HorizontalTimeline";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} aria-hidden="true" />
);

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
  const searchInputRef = useRef(null);
  const { toasts, addToast, removeToast } = useToast();
  
  const [searchQuery] = useState(() => localStorage.getItem("gssoc.search") || "");
  // eslint-disable-next-line no-unused-vars
  const _debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedDifficulty] = useState(() => localStorage.getItem("gssoc.difficulty") || "all");
  
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
  
  const GSSOC_END_DATE = "2026-08-15T23:59:59";
  const timeLeft = useCountdown(GSSOC_END_DATE, () => {
    addToast("🎉 GSSoC program has ended!", "success");
  });
  
  useEffect(() => { localStorage.setItem("gssoc.search", searchQuery); }, [searchQuery]);
  useEffect(() => { localStorage.setItem("gssoc.difficulty", selectedDifficulty); }, [selectedDifficulty]);
  useEffect(() => { localStorage.setItem("gssoc.userStats", JSON.stringify(userStats)); }, [userStats]);
  
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
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  useKeyboardShortcut("/", () => {
    searchInputRef.current?.focus();
    addToast("🔍 Search focused. Start typing...", "info", 1500);
  });
  
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  }), []);
  
  const itemVariants = useMemo(() => ({
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: prefersReducedMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] } 
    }
  }), [prefersReducedMotion]);
  
  if (isLoading) {
    return (
      <div className="w-[95%] mx-auto my-10 min-h-screen pb-12">
        <div className="p-8 rounded-3xl bg-gray-100 dark:bg-gray-800 mb-8 border border-gray-200 dark:border-gray-700">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96 mb-6" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
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
      
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-[95%] mx-auto my-10 min-h-screen pb-12"
        role="region"
        aria-label="GSSoC Contribution Hub"
      >
        {/* 🎯 PROFESSIONAL HERO SECTION */}
        <motion.section
          variants={itemVariants}
          className="p-6 sm:p-8 rounded-3xl shadow-sm bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8 relative overflow-hidden"
          aria-labelledby="hero-heading"
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-indigo-500" aria-hidden="true" />
                <span className="text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full">
                  GSSoC 2024
                </span>
              </div>
              
              <h1 id="hero-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 tracking-tight leading-tight text-gray-900 dark:text-white">
                Contribute to Eventra & <br className="hidden sm:block"/>
                <span className="text-indigo-600 dark:text-indigo-400">Level Up Your Skills</span>
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed max-w-xl">
                Join 500+ contributors building real-world features. Earn points, 
                badges, and recognition while making an impact.
              </p>
              
              {/* User Stats Layout */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <HeroStatCard label="Issues" value={userStats.issuesClaimed} icon={Target} />
                <HeroStatCard label="PRs" value={userStats.prsMerged} icon={GitBranch} />
                <HeroStatCard label="Points" value={userStats.points} icon={Star} />
                <HeroStatCard label="Rank" value={userStats.rank.split(' ')[0]} icon={Award} />
              </div>
            </div>
            
            {/* Integrated Countdown Card */}
            <motion.aside
              whileHover={{ scale: 1.02 }}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 shadow-sm"
              aria-labelledby="countdown-heading"
            >
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                </div>
                <h3 id="countdown-heading" className="font-semibold text-gray-900 dark:text-white">Program Ends In</h3>
              </div>
              
              {timeLeft.ended ? (
                <div className="text-center py-4">
                  <Trophy className="w-12 h-12 mx-auto mb-3 text-indigo-400" aria-hidden="true" />
                  <p className="font-medium text-gray-900 dark:text-white">Program Completed!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Check final rankings soon</p>
                </div>
              ) : (
                <CountdownTimer timeLeft={timeLeft} />
              )}
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open("https://gssoc.girlscript.org/leaderboard", "_blank", "noopener,noreferrer")}
                className="w-full mt-3 sm:mt-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 shadow-sm text-sm"
                aria-label="View GSSoC leaderboard (opens in new tab)"
              >
                <span>View Leaderboard</span>
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </motion.button>
            </motion.aside>
          </div>
        </motion.section>

        {/* 📋 TIMELINE */}
        <HorizontalTimeline timeline={GSSOC_TIMELINE} variants={itemVariants} />

        {/* 📋 GUIDELINES */}
        <motion.section
          variants={itemVariants}
          className="p-6 sm:p-8 rounded-3xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8"
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
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20"
              >
                <Icon className={`w-8 h-8 mb-3 ${color}`} />
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </motion.article>
            ))}
          </div>
          {/* NEW: Contributors Guide CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-8 flex justify-center"
          >
            <a
              href="/contributorguide" 
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl
                        bg-linear-to-r from-indigo-600 to-violet-600
                        hover:from-indigo-700 hover:to-violet-700
                        text-white font-semibold shadow-lg
                        transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <BookOpen className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />

              <span>Read Complete Contributors&apos; Guide</span>

              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </motion.div>
        </motion.section>
      </motion.section>
      
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

export default GSSoCContribution;
