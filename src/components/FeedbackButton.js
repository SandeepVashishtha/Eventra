import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
// 🔥 FIX: Changed from default import to named import to prevent fatal TypeError crash
import { useReducedMotion } from "../hooks/useReducedMotion";

const FeedbackButton = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      layout
      transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 300, damping: 30 }}
      // 🔥 FIX: Removed translate-y-1/2 which was pushing the button off the bottom of mobile screens
      className={"fixed left-[1.625rem] z-[100] bottom-6 fixed-floating-widget transition-opacity duration-300"}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Link
        to="/feedback"
        className="relative flex items-center justify-center p-3.5 bg-white text-black dark:bg-slate-900 dark:text-white border border-black/15 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-300 group"
        // title="Share Feedback"
        aria-label="Share Feedback"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <MessageSquare className="text-2xl text-black" />
        </motion.div>

        {/* 🔥 FIX: Changed mr-3 to ml-3. Since it's positioned left-full (on the right), it needs left margin to not overlap the button */}
        <div className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-white border border-black/15 px-3 py-2 text-sm text-black opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100">
          Share your feedback
          <div className="absolute right-full top-1/2 -translate-y-1/2 transform border-4 border-transparent border-r-white"></div>
        </div>
      </Link>
    </motion.div>
  );
};

export default FeedbackButton;