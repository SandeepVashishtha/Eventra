import React from "react";
import { motion } from "framer-motion";

const STATS = [
  { number: "200+",  label: "Active Users"     },
  { number: "4890+", label: "Projects Hosted"  },
  { number: "120+",  label: "Contributors"     },
];

const HeroStats = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
    {STATS.map((stat, idx) => (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: idx * 0.2, type: "spring", stiffness: 120 }}
        whileHover={{ scale: 1.05 }}
        data-aos="zoom-in"
        data-aos-delay={700 + idx * 150}
        className="bg-gradient-to-br from-sky-50 via-white to-white dark:from-zinc-800 dark:via-zinc-900 dark:to-slate-950 border border-sky-100 dark:border-white/10 shadow-md dark:shadow-black/40 hover:shadow-xl rounded-3xl p-6 flex flex-col items-center justify-center transition-all duration-300"
      >
        <span className="text-3xl font-extrabold text-black dark:text-white">
          {stat.number}
        </span>
        <span className="text-gray-700 dark:text-gray-200 mt-1 text-sm sm:text-base">
          {stat.label}
        </span>
      </motion.div>
    ))}
  </div>
);

export default HeroStats;
