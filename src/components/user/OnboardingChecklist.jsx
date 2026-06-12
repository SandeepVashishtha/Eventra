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
  ChevronDown,
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
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
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

    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => {
        if (t.id === "interests") return { ...t, completed: interestsDone };
        if (t.id === "bookmark") return { ...t, completed: bookmarkDone };
        if (t.id === "sandbox") return { ...t, completed: sandboxDone };
        if (t.id === "recommendations") return { ...t, completed: recsDone };
        return t;
      });

      // Detect 100% completion for celebration
      const allDone = updated.every((t) => t.completed);
      const prevAllDone = prevTasks.every((t) => t.completed);

      if (allDone && !prevAllDone) {
        const alreadyCelebrated =
          localStorage.getItem("eventra_onboarding_completed_fired") === "true";
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

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);
  const isAllCompleted = completedCount === tasks.length;

  return (
    <>
      {/* Celebration Confetti */}
      <AnimatePresence>{showCelebration && <OnboardingConfetti />}</AnimatePresence>

      {/* Floating Onboarding Toggle Badge */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="onboarding-badge"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            onClick={() => setIsOpen(true)}
            className="group fixed bottom-6 left-6 z-40 flex cursor-pointer items-center gap-2.5 rounded-full border border-slate-800 bg-slate-900 px-4 py-3 font-semibold text-white shadow-2xl dark:border-slate-200 dark:bg-white dark:text-slate-900"
          >
            <div className="relative flex h-6 w-6 items-center justify-center">
              <svg className="h-6 w-6 -rotate-90 transform">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  className="stroke-current text-slate-800 dark:text-slate-200"
                  strokeWidth="2"
                  fill="transparent"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  className="stroke-current text-indigo-500 transition-all duration-500"
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 10}
                  strokeDashoffset={2 * Math.PI * 10 * (1 - progressPercent / 100)}
                />
              </svg>
              <Trophy className="absolute h-3.5 w-3.5 animate-pulse text-indigo-500" />
            </div>
            <span className="text-xs tracking-wide">
              {isAllCompleted ? "Quest Complete! 🌟" : `Onboarding Quest: ${progressPercent}%`}
            </span>
            <ChevronUp className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-white dark:group-hover:text-slate-900" />
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
            className="fixed bottom-6 left-6 z-40 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95"
          >
            {/* Header */}
            <div className="dark:bg-slate-850 flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-indigo-500/10 p-1 text-indigo-600 dark:text-indigo-400">
                  <Award className="h-5 w-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-white">
                    Developer Onboarding
                    {isAllCompleted && <Sparkles className="h-4 w-4 text-amber-500" />}
                  </h3>
                  <p className="text-[10px] text-slate-500">Complete quests to level up profile</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Minimize panel"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Progress Area */}
            <div className="border-b border-slate-100 bg-white px-5 py-4 dark:border-slate-800/80 dark:bg-slate-900">
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Quest Progress</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {progressPercent}%
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <motion.div
                  className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: "easeOut" }}
                />
              </div>

              {isAllCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 rounded-xl border border-green-200 bg-green-50 p-2 text-center dark:border-green-800/30 dark:bg-green-950/20"
                >
                  <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-300">
                    🎉 Onboarding Quest Completed!
                  </p>
                </motion.div>
              )}
            </div>

            {/* Task list items */}
            <div className="max-h-[300px] space-y-3 overflow-y-auto bg-slate-50/50 p-4 dark:bg-slate-900/30">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 rounded-xl border p-3 transition-all duration-300 ${
                    task.completed
                      ? "border-green-100/50 bg-green-50/30 opacity-80 dark:border-green-900/20 dark:bg-green-950/10"
                      : "dark:bg-slate-850 border-slate-100 bg-white shadow-sm hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
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
                    className="flex flex-1 cursor-default items-start gap-3"
                  >
                    {/* Status Checkbox Indicator */}
                    <div className="mt-0.5 shrink-0" aria-hidden="true">
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 fill-current text-green-500 dark:text-green-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300 dark:text-slate-700" />
                      )}
                    </div>

                    {/* Task details */}
                    <div className="min-w-0 flex-1">
                      <span className="sr-only">
                        {task.completed ? "[Completed Quest] " : "[Active Quest] "}
                      </span>
                      <p
                        className={`text-xs leading-tight font-bold ${
                          task.completed
                            ? "text-slate-500 line-through"
                            : "text-slate-850 dark:text-white"
                        }`}
                      >
                        {task.label}
                      </p>
                      <p
                        id={`onboarding-desc-${task.id}`}
                        className="mt-0.5 text-[10px] leading-snug text-slate-500"
                      >
                        {task.desc}
                      </p>
                    </div>
                  </label>

                  {/* Arrow Action link */}
                  {!task.completed && (
                    <Link
                      to={task.path}
                      onClick={() => setIsOpen(false)}
                      className="shrink-0 self-center rounded-lg p-1 text-indigo-500 hover:bg-slate-100 hover:text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:hover:bg-slate-800"
                      title={`Go to ${task.label}`}
                      aria-label={`Go to ${task.label}`}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Panel Actions */}
            <div className="dark:bg-slate-850 flex items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 p-3 dark:border-slate-800">
              <button
                onClick={handleDismiss}
                className="text-[10px] font-bold tracking-wider text-slate-400 uppercase transition-colors hover:text-red-500 dark:hover:text-red-400"
                aria-label="button"
              >
                Dismiss Quest
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-slate-850 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition-all dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
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
