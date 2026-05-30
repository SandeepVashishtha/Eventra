/**
 * BackToTop
 *
 * A floating "scroll to top" button that:
 * - Appears after the user scrolls more than SCROLL_THRESHOLD px (default 400)
 * - Smoothly scrolls back to the top on click
 * - Fades in/out with a CSS transition
 * - Is fully keyboard-accessible (focusable, Enter/Space activates it)
 * - Respects prefers-reduced-motion by using instant scroll when enabled
 * - Shows a subtle scroll progress arc so the user knows how far they've scrolled
 *
 * Usage:
 *   import BackToTop from "../common/BackToTop";
 *   // In your component/layout return:
 *   <BackToTop />
 */

import { useEffect, useState, useCallback } from "react";
import { ChevronUp } from "lucide-react";

const SCROLL_THRESHOLD = 400; // px — button appears after scrolling this far

const BackToTop = ({ threshold = SCROLL_THRESHOLD }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setVisible(scrollY > threshold);
    setProgress(docHeight > 0 ? Math.min(100, (scrollY / docHeight) * 100) : 0);
  }, [threshold]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on mount to set correct initial state
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "instant" : "smooth",
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollToTop();
    }
  };

  // SVG arc for progress ring
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      onKeyDown={handleKeyDown}
      aria-label={`Back to top (${Math.round(progress)}% scrolled)`}
      title="Back to top"
      tabIndex={visible ? 0 : -1}
      className={[
        "fixed bottom-6 right-6 z-50",
        "w-12 h-12",
        "rounded-full",
        "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600",
        "text-white",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-300 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        "active:scale-95",
        "flex items-center justify-center",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
      ].join(" ")}
    >
      {/* Progress ring */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 44 44"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2.5"
        />
        {/* Progress arc */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.2s ease" }}
        />
      </svg>

      {/* Up arrow icon */}
      <ChevronUp size={20} className="relative z-10" aria-hidden="true" />
    </button>
  );
};

export default BackToTop;
