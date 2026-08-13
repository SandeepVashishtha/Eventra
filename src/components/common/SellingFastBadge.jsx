import React from "react";
import { motion } from "framer-motion";

/**
 * SellingFastBadge - A pulsing red badge that displays FOMO messages
 * for events with low ticket inventory.
 * 
 * @param {Object} props
 * @param {string} props.message - The FOMO message to display (e.g., "Selling Fast!" or "Only 5 Tickets Left!")
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element}
 */
const SellingFastBadge = ({ message, className = "" }) => {
  return (
    <motion.span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg ${className}`}
      initial={{ scale: 1 }}
      animate={{ 
        scale: [1, 1.05, 1],
        boxShadow: [
          "0 0 0 0 rgba(248, 113, 113, 0.4)",
          "0 0 0 8px rgba(248, 113, 113, 0)",
          "0 0 0 0 rgba(248, 113, 113, 0.4)"
        ]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        background: "linear-gradient(45deg, #ef4444, #dc2626)",
        backgroundSize: "200% 200%"
      }}
      role="status"
      aria-live="polite"
    >
      <motion.span
        className="mr-1"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        ⚡
      </motion.span>
      {message}
    </motion.span>
  );
};

export default React.memo(SellingFastBadge);