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
        className="group relative flex items-center justify-center rounded-full border border-black/15 bg-white p-3.5 text-black shadow-lg transition-all duration-300 hover:bg-gray-50"
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
        <div className="pointer-events-none absolute left-full ml-3 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm whitespace-nowrap text-black opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100">
          Share your feedback
          <div className="absolute top-1/2 right-full -translate-y-1/2 transform border-4 border-transparent border-r-white"></div>
        </div>
      </Link>
    </motion.div>
  );
};

export default FeedbackButton;