import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

/**
 * ScrollToTopButton component with safe-area aware positioning.
 * Placements configured for when chatbot is open/closed on mobile screens.
 */
const ScrollToTopButton = ({ chatbotOpen = false }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const positionClass = chatbotOpen
    ? "bottom-[calc(1rem+var(--safe-area-bottom))] left-[calc(1rem+var(--safe-area-left))] sm:bottom-24 sm:left-6"
    : "bottom-[calc(1rem+var(--safe-area-bottom))] right-[calc(1rem+var(--safe-area-right))] sm:bottom-24 sm:right-6";

  return (
    <button
      onClick={scrollToTop}
      className={`fixed z-50 p-3 rounded-full bg-indigo-600 text-white shadow-lg transition-all duration-300 ${positionClass} ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
      }`}
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
};

export default ScrollToTopButton;
