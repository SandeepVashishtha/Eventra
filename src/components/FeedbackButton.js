import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMessageSquare } from "react-icons/fi";

const FeedbackButton = () => {

  return (
    <motion.div
      layout 
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={"fixed left-[1.625rem] z-[10] translate-y-1/2 bottom-6"
      }
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Link
        to="/feedback"
        className="relative flex items-center justify-center p-3.5 bg-white dark:bg-gray-800 text-black dark:text-white border border-black/15 dark:border-white/20 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 group"
        aria-label="Share Feedback"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <FiMessageSquare className="text-2xl" />
        </motion.div>

        <div className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-white dark:bg-gray-800 border border-black/15 dark:border-white/20 px-3 py-2 text-sm text-black dark:text-white opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100">
          Share your feedback
          <div className="absolute right-full top-1/2 -translate-y-1/2 transform border-4 border-transparent border-r-white dark:border-r-gray-800"></div>
        </div>
      </Link>
    </motion.div>
  );
};

export default FeedbackButton;
