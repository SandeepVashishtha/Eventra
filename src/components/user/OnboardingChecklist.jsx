import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useReducedMotion from '../../hooks/useReducedMotion';
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

// =========================
// FIX 1: CENTRALIZED STORAGE KEYS
// =========================
const STORAGE_KEYS = {
  DISMISSED: "eventra_onboarding_dismissed",
  COMPLETED_FIRED: "eventra_onboarding_completed_fired",
};

// =========================
// FIX 2: ONBOARDING CONFETTI (UNCHANGED)
// =========================
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
            rotate: p.rotation + 360,
            x: `calc(${p.x}% + ${Math.sin(p.id) * 60}px)`,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "linear",
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

  // FIX 3: derive dismissed safely
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.DISMISSED) === "true";
  });

  const [isOpen, setIsOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // =========================
  // FIX 4: TASK DEFINITIONS (STATIC)
  // =========================
  const baseTasks = [
    {
      id: "interests",
      label: "Set Up Developer Interests",
      desc: "Add your skills & domains in edit profile",
      path: "/profile/edit",
    },
    {
      id: "bookmark",
      label: "Bookmark Your First Repository",
      desc: "Save an interesting project to bookmarks",
      path: "/projects",
    },
    {
      id: "sandbox",
      label: "Execute Sandbox Request",
      desc: "Run a query in the Interactive API Docs",
      path: "/api-docs",
    },
    {
      id: "recommendations",
      label: "Generate AI Recommendation List",
      desc: "Generate custom recommendations based on your preferences",
      path: "/event-recommendation",
    },
  ];

  const [tasks, setTasks] = useState(baseTasks.map(t => ({ ...t, completed: false })));

  // =========================
  // FIX 5: RELIABLE TASK CHECKING
  // =========================
  const checkTaskStatus = useCallback(() => {
    if (!user) return;

    const interestsDone =
      (user?.skills?.length > 0) ||
      (safeJsonParse(localStorage.getItem("user_interests"), []).length > 0);

    const bookmarkDone =
      safeJsonParse(localStorage.getItem("eventra_bookmarked_projects"), []).length > 0;

    const sandboxDone =
      localStorage.getItem("eventra_sandbox_executed") === "true";

    const recsDone =
      localStorage.getItem("eventra_ai_recommendation_generated") === "true";

    const updated = baseTasks.map(t => {
      if (t.id === "interests") return { ...t, completed: interestsDone };
      if (t.id === "bookmark") return { ...t, completed: bookmarkDone };
      if (t.id === "sandbox") return { ...t, completed: sandboxDone };
      if (t.id === "recommendations") return { ...t, completed: recsDone };
      return t;
    });

    setTasks(updated);

    const allDone = updated.every(t => t.completed);

    // FIX 6: only fire once
    if (allDone && localStorage.getItem(STORAGE_KEYS.COMPLETED_FIRED) !== "true") {
      setShowCelebration(true);
      setIsOpen(true);
      localStorage.setItem(STORAGE_KEYS.COMPLETED_FIRED, "true");

      setTimeout(() => setShowCelebration(false), 5000);
    }
  }, [user]);

  // =========================
  // FIX 7: PERSISTENCE + AUTO UPDATE
  // =========================
  useEffect(() => {
    if (!user || isDismissed) return;

    checkTaskStatus();

    const interval = setInterval(checkTaskStatus, 3000);

    return () => clearInterval(interval);
  }, [user, isDismissed, location, checkTaskStatus]);

  // =========================
  // FIX 8: RESET EVENT SUPPORT
  // =========================
  useEffect(() => {
    const handler = () => {
      setIsDismissed(false);
      localStorage.removeItem(STORAGE_KEYS.DISMISSED);
      checkTaskStatus();
      setIsOpen(true);
    };

    window.addEventListener("eventraOnboardingReset", handler);
    return () => window.removeEventListener("eventraOnboardingReset", handler);
  }, [checkTaskStatus]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEYS.DISMISSED, "true");
    setIsDismissed(true);
    setIsOpen(false);
  };

  // =========================
  // FIX 9: CLEAN EXIT CONDITIONS
  // =========================
  if (!user || isDismissed) return null;

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);
  const isAllCompleted = completedCount === tasks.length;

  return (
    <>
      <AnimatePresence>
        {showCelebration && <OnboardingConfetti />}
      </AnimatePresence>

      {/* FLOAT BUTTON */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="badge"
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900 text-white shadow-2xl"
          >
            <Trophy className="w-4 h-4 text-indigo-400" />
            <span className="text-xs">
              {isAllCompleted
                ? "Quest Complete 🎉"
                : `Onboarding Quest: ${progressPercent}%`}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 left-6 z-40 w-full max-w-sm bg-white rounded-2xl shadow-2xl border overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="p-4 flex justify-between border-b">
              <h3 className="font-bold text-sm">Onboarding Quest</h3>
              <button onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className="p-4 space-y-3">
              <div className="text-xs font-semibold">
                Progress: {progressPercent}%
              </div>

              {tasks.map(t => (
                <div key={t.id} className="flex justify-between text-xs">
                  <span>{t.label}</span>
                  <span>{t.completed ? "✔" : "○"}</span>
                </div>
              ))}

              <button
                onClick={handleDismiss}
                className="text-xs text-red-500 mt-3"
              >
                Dismiss permanently
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}