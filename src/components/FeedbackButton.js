import React, { useState, useEffect } from "react";
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
        className="relative flex items-center justify-center p-3.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300  group"
        // title="Share Feedback"
        aria-label="Share Feedback"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <FiMessageSquare className="text-2xl" />
        </motion.div>

        <div className="pointer-events-none absolute left-full mr-3 whitespace-nowrap rounded-lg bg-gray-800 dark:bg-gray-700 px-3 py-2 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Share your feedback
          <div className=" absolute right-full top-1/2 -translate-y-1/2 transform border-4 border-transparent border-r-gray-800 dark:border-r-gray-700"></div>
        </div>
      </Link>
    </motion.div>
  );
};

export default FeedbackButton;
