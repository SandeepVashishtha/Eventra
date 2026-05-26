import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowUp } from "react-icons/fi";
import { getScrollPosition, scrollToTop as scrollPageToTop } from "../../utils/lenisUtils";

/**
 * Floating "Back to Top" button.
 * Appears after the user scrolls past `threshold` pixels and smoothly
 * scrolls the page back to the top on click.
 */
const BackToTopButton = ({
  threshold = 400,
  className = "",
  ariaLabel = "Back to top",
  positionClass = "bottom-6 right-6",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setIsVisible(getScrollPosition() > threshold);
      });
    };

    handleScroll();

    if (window.lenis) {
      window.lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (window.lenis) {
        window.lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [threshold]);

  const scrollToTop = () => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { duration: 1.2 });
      return;
    }

    scrollPageToTop({ behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label={ariaLabel}
          title={ariaLabel}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className={`fixed ${positionClass} z-50 flex items-center justify-center w-12 h-12 rounded-full bg-black text-white shadow-lg hover:bg-zinc-800 border-2 border-white dark:border-gray-800 transition-colors ${className}`}
        >
          <FiArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTopButton;