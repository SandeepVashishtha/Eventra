import React from "react";
import { motion } from "framer-motion";
import { FiCode, FiCompass, FiRotateCw } from "react-icons/fi";

const EmptyHackathonState = ({
  hasActiveFilters,
  resetFilters,
  scrollToCards,
}) => {
  return (
    <motion.div
      className="relative mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)]"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0 -z-10 bg-black/10 blur-3xl dark:bg-black/30"
        animate={{
          opacity: [0.3, 0.55, 0.3],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="mx-auto max-w-md">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <FiCode className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
        </motion.div>

        <h3 className="mt-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
          No Hackathons Found
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {hasActiveFilters
            ? "No hackathons match your current filters. Try adjusting your search or selections."
            : "Check back later for exciting new hackathons."}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-zinc-800"
          >
            <FiRotateCw className="h-4 w-4" />
            Reset Filters
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={scrollToCards}
            className="flex items-center justify-center gap-2 rounded-lg border border-black/15 bg-white px-6 py-2.5 text-sm font-medium text-black shadow-md transition-all hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            Explore Hackathons
            <FiCompass className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default EmptyHackathonState;