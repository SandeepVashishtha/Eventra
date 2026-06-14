import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useReducedMotion from "../../hooks/useReducedMotion";
import { 
  CheckCircle2, 
  Circle, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  Award,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { safeJsonParse } from "../../utils/safeJsonParse";
import { syncSecureStorage } from "../../utils/secureStorage";

// Confetti Component for celebration
const OnboardingConfetti = () => {
  const colors = ["#6366f1", "#ec4899", "#8b5cf6", "#10b981", "#f59e0b", "#3b82f6", "#ef4444"];
  const pieces = Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2.5 + Math.random() * 1.5,
    size: 6 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: Math.random() > 0.5 ? "rounded-full" : "rounded-sm",
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute ${p.shape}`}
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            top: -20,
          }}
          initial={{ y: -20, rotate: p.rotation, opacity: 1 }}
          animate={{
            y: "110vh",
            rotate: p.rotation + 360 * (Math.random() > 0.5 ? 1 : -1),
            x: `calc(${p.x}% + ${Math.sin(p.id) * 60}px)`,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "linear",
            repeat: 0,
          }}
        />
      ))}
    </div>
  );
};

export default function OnboardingChecklist() {
  const { user } = useAuth();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem("eventra_onboarding_dismissed") === "true";
  });
  const [showCelebration, setShowCelebration] = useState(false);

  // Checklist task states
  const [tasks, setTasks] = useState([
    {
      id: "interests",
      label: "Set Up Developer Interests",
      desc: "Add your skills & domains in edit profile",
      path: "/profile/edit",
      completed: false,
    },
    {
      id: "bookmark",
      label: "Bookmark Your First Repository",
      desc: "Save an interesting project to bookmarks",
      path: "/projects",
      completed: false,
    },
    {
      id: "sandbox",
      label: "Execute Sandbox Request",
      desc: "Run a query in the Interactive API Docs",
      path: "/api-docs",
      completed: false,
    },
    {
      id: "recommendations",
      label: "Generate AI Recommendation List",
      desc: "Generate custom recommendations based on your preferences",
      path: "/event-recommendation",
      completed: false,
    },
  ]);

  // Check storage values and update task statuses
  const checkTaskStatus = useCallback(async () => {
    // 1. Check user profile / skills in local storage or state
    let interestsDone = false;
    try {
      const storedUser = await syncSecureStorage.getItemAsync("user");
      if (storedUser) {
        const parsed = safeJsonParse(storedUser, {});
        if (parsed.skills && parsed.skills.length > 0) {
          interestsDone = true;
        }
      } else if (user?.skills && user.skills.length > 0) {
        interestsDone = true;
      }
    } catch {
      if (user?.skills && user.skills.length > 0) {
        interestsDone = true;
      }
    }
    
    const storedInterests = localStorage.getItem("user_interests");
    if (storedInterests) {
      const parsedInt = safeJsonParse(storedInterests, []);
      if (parsedInt.length > 0) {
        interestsDone = true;
      }
    }

    // 2. Check bookmarked projects
    let bookmarkDone = false;
    const storedBookmarks = localStorage.getItem("eventra_bookmarked_projects");
    if (storedBookmarks) {
      const parsed = safeJsonParse(storedBookmarks, []);
      if (parsed.length > 0) {
        bookmarkDone = true;
      }
    }

    // 3. Check sandbox request execution
    const sandboxDone = localStorage.getItem("eventra_sandbox_executed") === "true";

    // 4. Check AI recommendation generation
    const recsDone = localStorage.getItem("eventra_ai_recommendation_generated") === "true";

    setTasks(prevTasks => {
      const updated = prevTasks.map(t => {
        if (t.id === "interests") return { ...t, completed: interestsDone };
        if (t.id === "bookmark") return { ...t, completed: bookmarkDone };
        if (t.id === "sandbox") return { ...t, completed: sandboxDone };
        if (t.id === "recommendations") return { ...t, completed: recsDone };
        return t;
      });

      // Detect 100% completion for celebration
      const allDone = updated.every(t => t.completed);
      const prevAllDone = prevTasks.every(t => t.completed);
      
      if (allDone && !prevAllDone) {
        const alreadyCelebrated = localStorage.getItem("eventra_onboarding_completed_fired") === "true";
        if (!alreadyCelebrated) {
          setShowCelebration(true);
          setIsOpen(true);
          localStorage.setItem("eventra_onboarding_completed_fired", "true");
          // auto close celebration modal in 6 seconds
          setTimeout(() => {
            setShowCelebration(false);
          }, 6000);
        }
      }

      return updated;
    });
  }, [user]);

  // Perform checks periodically and on routing
  useEffect(() => {
    if (!user || isDismissed) return;
    
    checkTaskStatus();
    const interval = setInterval(checkTaskStatus, 1500);

    return () => clearInterval(interval);
  }, [user, isDismissed, location, checkTaskStatus]);

  // Listen to custom reset event to show checklist immediately
  useEffect(() => {
    const handleResetEvent = () => {
      setIsDismissed(false);
      setIsOpen(true);
      checkTaskStatus();
    };

    window.addEventListener("eventraOnboardingReset", handleResetEvent);
    return () => {
      window.removeEventListener("eventraOnboardingReset", handleResetEvent);
    };
  }, [checkTaskStatus]);

  const handleDismiss = () => {
    localStorage.setItem("eventra_onboarding_dismissed", "true");
    setIsDismissed(true);
    setIsOpen(false);
  };

  
  // Render check
  if (!user || isDismissed) {
    // Hidden except if they want to reset it on settings page (can trigger reset)
    return null;
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);
  const isAllCompleted = completedCount === tasks.length;

  return (
    <>
      {/* Celebration Confetti */}
      <AnimatePresence>
        {showCelebration && <OnboardingConfetti />}
      </AnimatePresence>

      {/* Floating Onboarding Toggle Badge */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="onboarding-badge"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 left-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-2xl border border-slate-800 dark:border-slate-200 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-6 h-6">
              <svg className="w-6 h-6 transform -rotate-90">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  className="text-slate-800 dark:text-slate-200 stroke-current"
                  strokeWidth="2"
                  fill="transparent"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  className="text-indigo-500 stroke-current transition-all duration-500"
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 10}
                  strokeDashoffset={2 * Math.PI * 10 * (1 - progressPercent / 100)}
                />
              </svg>
              <Trophy className="absolute w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            </div>
            <span className="text-xs tracking-wide">
              {isAllCompleted ? "Quest Complete! 🌟" : `Onboarding Quest: ${progressPercent}%`}
            </span>
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white dark:group-hover:text-slate-900 transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Onboarding checklist card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="onboarding-panel"
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: "easeOut" }}
            className="fixed bottom-6 left-6 z-[110] w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Award className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    Developer Onboarding
                    {isAllCompleted && <Sparkles className="w-4 h-4 text-amber-500" />}
                  </h3>
                  <p className="text-[10px] text-slate-500">Complete quests to level up profile</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Minimize panel"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Area */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <span>Quest Progress</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{progressPercent}%</span>
              </div>
              
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: "easeOut" }}
                />
              </div>

              {isAllCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-xl text-center"
                >
                  <p className="text-xs text-green-700 dark:text-green-300 font-semibold flex items-center justify-center gap-1.5">
                    🎉 Onboarding Quest Completed!
                  </p>
                </motion.div>
              )}
            </div>

            {/* Task list items */}
            <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/30">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  className={`p-3 rounded-xl border transition-all duration-300 flex items-start gap-3 ${
                    task.completed 
                      ? "bg-green-50/30 dark:bg-green-950/10 border-green-100/50 dark:border-green-900/20 opacity-80" 
                      : "bg-white dark:bg-slate-850 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                  }`}
                >
                  {/* Semantic visually-hidden checkbox with dynamic description */}
                  <input
                    type="checkbox"
                    id={`onboarding-task-${task.id}`}
                    checked={task.completed}
                    disabled
                    className="sr-only"
                    aria-describedby={`onboarding-desc-${task.id}`}
                  />
                  
                  <label 
                    htmlFor={`onboarding-task-${task.id}`}
                    className="flex-1 flex items-start gap-3 cursor-default"
                  >
                    {/* Status Checkbox Indicator */}
                    <div className="mt-0.5 shrink-0" aria-hidden="true">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400 fill-current" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                      )}
                    </div>

                    {/* Task details */}
                    <div className="flex-1 min-w-0">
                      <span className="sr-only">
                        {task.completed ? "[Completed Quest] " : "[Active Quest] "}
                      </span>
                      <p className={`text-xs font-bold leading-tight ${
                        task.completed ? "text-slate-500 line-through" : "text-slate-850 dark:text-white"
                      }`}>
                        {task.label}
                      </p>
                      <p id={`onboarding-desc-${task.id}`} className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        {task.desc}
                      </p>
                    </div>
                  </label>

                  {/* Arrow Action link */}
                  {!task.completed && (
                    <Link
                      to={task.path}
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-500 hover:text-indigo-600 shrink-0 self-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      title={`Go to ${task.label}`}
                      aria-label={`Go to ${task.label}`}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Panel Actions */}
            <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <button
                onClick={handleDismiss}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors uppercase tracking-wider"
               aria-label="button">
                Dismiss Quest
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-bold transition-all shadow-md"
              >
                Hide Panel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
