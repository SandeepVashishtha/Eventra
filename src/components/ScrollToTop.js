import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import "./styles/scrolltotopButton.css";

export default function ScrollToTopButton() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Automatically scroll to top whenever the route changes
  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.lenis ? window.lenis.scroll : window.scrollY;
      setVisible(scrollY > 50);
    };
    
    handleScroll();
    
    if (window.lenis) {
      window.lenis.on('scroll', handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll);
    }
    
    // Listen for chatbot state changes
    const handleChatbotState = () => {
      setIsChatbotOpen(document.querySelector('[data-chatbot-open]') !== null);
    };
    
    // Check initially and set up observer
    handleChatbotState();
    const observer = new MutationObserver(handleChatbotState);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      if (window.lenis) {
        window.lenis.off('scroll', handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
      observer.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Position based on chatbot state
  const positionClass = isChatbotOpen 
    ? "bottom-24 left-6"  // When chatbot is open - bottom left
    : "bottom-6 right-6 sm:bottom-24 sm:right-6"; // When chatbot is closed - bottom right

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          id="scrollToTopBtn"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className={`
            fixed ${positionClass}
            w-14 h-14
            rounded-full
            border border-black/15 dark:border-white/20
            bg-white dark:bg-black
            text-black dark:text-white
            shadow-lg
            flex items-center justify-center
            text-4xl
            hover:scale-110
            hover:border-black/30 dark:hover:border-white/40
            transition-all
            z-[9998]
            show
          `}
          title="Back to Top"
        >
          <ChevronUp className="w-6 h-6" strokeWidth={2} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}