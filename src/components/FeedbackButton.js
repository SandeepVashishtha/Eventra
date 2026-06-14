import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
// 🔥 FIX: Changed from default import to named import to prevent fatal TypeError crash
import { useReducedMotion } from "../hooks/useReducedMotion";

const FeedbackButton = () => {
  const prefersReducedMotion = useReducedMotion();
  const [onboardingHeight, setOnboardingHeight] = useState(0);

  useEffect(() => {
    const handleStateChange = (e) => {
      if (e.detail && typeof e.detail.height === "number") {
        setOnboardingHeight(e.detail.height);
      }
    };
    window.addEventListener("eventraOnboardingStateChange", handleStateChange);

    // Initial check
    const checklist = document.querySelector('[data-onboarding-checklist]');
    if (checklist) {
      const rect = checklist.getBoundingClientRect();
      setOnboardingHeight(window.innerHeight - rect.top);
    }

    return () => {
      window.removeEventListener("eventraOnboardingStateChange", handleStateChange);
    };
  }, []);

  const isDev = import.meta.env.DEV;
  // If in dev, we stack above ErrorButton (Break the World). If in prod, we stack directly above Onboarding.
  let bottomOffset = 24;
  if (onboardingHeight > 0) {
    if (isDev) {
      // Stack above ErrorButton (which is at onboardingHeight + 16)
      // ErrorButton height is ~40px, so 40 + 12 = 52px further up.
      bottomOffset = onboardingHeight + 16 + 40 + 12; // onboardingHeight + 68px
    } else {
      bottomOffset = onboardingHeight + 16;
    }
  } else {
    if (isDev) {
      // Stack above ErrorButton (which is at 24px)
      bottomOffset = 24 + 40 + 12; // 76px
    } else {
      bottomOffset = 24;
    }
  }

  return (
    <motion.div
      layout
      transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 300, damping: 30 }}
      // 🔥 FIX: Removed bottom-6 and transition-opacity, replaced with style={{ bottom }} and transition-all
      className={"fixed left-[1.625rem] z-[100] fixed-floating-widget transition-all duration-300"}
      style={{ bottom: `${bottomOffset}px` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Link
        to="/feedback"
        className="relative flex items-center justify-center p-3.5 bg-white text-black dark:bg-slate-900 dark:text-white border border-black/15 dark:border-white/15 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300 group"
        // title="Share Feedback"
        aria-label="Share Feedback"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <MessageSquare className="text-2xl text-slate-800 dark:text-white" />
        </motion.div>

        {/* 🔥 FIX: Changed mr-3 to ml-3. Since it's positioned left-full (on the right), it needs left margin to not overlap the button */}
        <div className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-white dark:bg-slate-900 border border-black/15 dark:border-white/15 px-3 py-2 text-sm text-black dark:text-white opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100">
          Share your feedback
          <div className="absolute right-full top-1/2 -translate-y-1/2 transform border-4 border-transparent border-r-white dark:border-r-slate-900"></div>
        </div>
      </Link>
    </motion.div>
  );
};

export default FeedbackButton;