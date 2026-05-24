import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

export default function ScrollToTopButton() {
  const { pathname } = useLocation();

  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Auto scroll to top on route change
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [pathname]);

  // Optimized scroll handling
  const handleScroll = useCallback(() => {
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      const progress = (scrollTop / docHeight) * 100;

      setVisible(scrollTop > 300);
      setScrollProgress(progress);
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // Lightweight chatbot detection
  useEffect(() => {
    const chatbot = document.querySelector("[data-chatbot-open]");
    setIsChatbotOpen(!!chatbot);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const positionClass = isChatbotOpen
    ? "bottom-24 left-6"
    : "bottom-24 right-6";

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.7, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 30 }}
          transition={{ duration: 0.25 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Scroll back to top"
          title="Back to Top"
          className={`
            fixed ${positionClass}
            z-[9998]
            w-14 h-14
            rounded-full
            bg-white dark:bg-zinc-900
            border border-black/10 dark:border-white/10
            shadow-xl
            backdrop-blur-md
            flex items-center justify-center
            text-black dark:text-white
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            transition-all
          `}
        >
          {/* Progress Ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="opacity-20"
            />

            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={289}
              strokeDashoffset={289 - (289 * scrollProgress) / 100}
              strokeLinecap="round"
              className="transition-all duration-150"
            />
          </svg>

          <ChevronUp className="w-6 h-6 relative z-10" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}