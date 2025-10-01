import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCaretUp } from "react-icons/fa";
import { ChevronUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 50); // appear early
    handleScroll(); // check on mount
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="
            fixed bottom-6 right-6
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
            z-[9999]
          "
          title="Back to Top"
        >
          <ChevronUp className="w-6 h-6" strokeWidth={2} />{" "}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
