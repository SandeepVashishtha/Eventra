import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCaretUp } from "react-icons/fa";
import { ChevronUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    
    // Listen for chatbot state changes
    const handleChatbotState = () => {
      setIsChatbotOpen(document.querySelector('[data-chatbot-open]') !== null);
    };
    
    // Check initially and set up observer
    handleChatbotState();
    const observer = new MutationObserver(handleChatbotState);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Position based on chatbot state
  const positionClass = isChatbotOpen 
    ? "bottom-24 left-6"  // When chatbot is open - bottom left
    : "bottom-28 right-6"; // When chatbot is closed - bottom right

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className={`
            fixed ${positionClass}
            w-14 h-14
            rounded-full
            border-2 border-white/30 dark:border-white/20
            bg-gradient-to-r from-purple-500 via-indigo-600 to-indigo-400
            backdrop-blur-xl
            text-white
            shadow-2xl
            flex items-center justify-center
            text-4xl
            hover:scale-110
            hover:border-white/50
            transition-all
            z-[9998]
          `}
          title="Back to Top"
        >
          <ChevronUp className="w-6 h-6" strokeWidth={2} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}