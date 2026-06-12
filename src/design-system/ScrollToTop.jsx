import { useState, useEffect, useCallback } from "react";

const SCROLL_THRESHOLD = 400;

export function ScrollToTop({ threshold = SCROLL_THRESHOLD, showProgress = true }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setVisible(scrollY > threshold);
    if (docHeight > 0) {
      setProgress(Math.min(100, (scrollY / docHeight) * 100));
    }
  }, [threshold]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="ds-scroll-to-top"
      aria-label="Scroll to top"
      title="Back to top"
    >
      {showProgress && (
        <svg className="ds-scroll-progress" viewBox="0 0 36 36" aria-hidden="true">
          <circle
            className="ds-scroll-progress-bg"
            cx="18"
            cy="18"
            r="16"
            fill="none"
            strokeWidth="2"
          />
          <circle
            className="ds-scroll-progress-bar"
            cx="18"
            cy="18"
            r="16"
            fill="none"
            strokeWidth="2"
            strokeDasharray={`${progress} ${100 - progress}`}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
        </svg>
      )}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
