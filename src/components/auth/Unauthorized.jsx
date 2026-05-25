import React from "react";
import { Link } from "react-router-dom";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const Unauthorized = () => {
  // Predefined bubble positions around the card
  // These positions are spread along edges and sides for visual variety
  const bubblePositions = [
    { top: "10%", left: "5%" }, // Bubble at top-left
    { top: "20%", right: "10%" }, // Bubble at top-right
    { bottom: "15%", left: "15%" }, // Bubble at bottom-left
    { bottom: "5%", right: "5%" }, // Bubble at bottom-right
    { top: "50%", left: "2%" }, // Bubble at mid-left
    { top: "50%", right: "2%" }, // Bubble at mid-right
  ];

  // Framer Motion variants for floating effect
  // Each bubble moves in a gentle oscillating pattern
  const floatingVariants = {
    float: (i) => ({
      y: [0, -20 - i * 3, 0], // Vertical float
      x: [0, 20 + i * 5, 0], // Horizontal float
      transition: {
        duration: 6 + i, // Slightly different speed for each bubble
        repeat: Infinity, // Infinite loop
        ease: "easeInOut", // Smooth easing in and out
      },
    }),
  };

  return (
    <div
      // UPDATED: Main page background
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-red-100 to-red-200 dark:from-red-900/40 dark:via-gray-900 dark:to-black overflow-hidden px-4"
    >
      {/* Floating decorative bubbles */}
      {bubblePositions.map((pos, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={floatingVariants}
          animate="float"
          // UPDATED: Bubble color
          className="absolute rounded-full bg-red-400/20 dark:bg-red-500/10"
          style={{
            width: 40 + i * 10,
            height: 40 + i * 10,
            ...pos,
          }}
        />
      ))}

      {/* Main Card container */}
      {/* UPDATED: Card background and border */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 max-w-md w-full text-center z-10 dark:border dark:border-gray-700">
        <div className="flex flex-col items-center space-y-4">
          {/* Icon color is fine for both themes */}
          <XCircleIcon className="h-20 w-20 text-red-500 animate-pulse" />
          
          {/* UPDATED: Text colors */}
          <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don’t have permission to access this page.
          </p>
        </div>

        <div className="mt-6 text-center">
          {/* UPDATED: Text color */}
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            This page requires special permissions. If you think this is an
            error, contact an administrator.
          </p>
          
          {/* Button color is fine for both themes */}
          <Link
            to="/"
            className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition transform hover:-translate-y-1"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
