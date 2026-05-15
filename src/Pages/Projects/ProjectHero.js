import React from "react";
import { motion } from "framer-motion";
import FloatingShapes from "./FloatingShapes";
import IconTrain from "./IconTrain";
import HeroButtons from "./HeroButtons";
import HeroStats from "./HeroStats";

export default function ProjectHero({ scrollToCard }) {
  return (
    <div
      className="relative min-h-screen py-24 overflow-hidden"
      data-aos="fade-down"
      data-aos-once="true"
      data-aos-duration="1000"
    >
      <FloatingShapes />
      <IconTrain />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl sm:text-6xl font-extrabold mb-6 mt-6 text-black dark:text-white leading-tight"
          style={{ fontFamily: '"Anton", sans-serif' }}
        >
          Discover Amazing Projects
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12"
        >
          Explore, contribute to, and showcase innovative open-source creations
          from developers worldwide.
        </motion.p>

        <HeroButtons scrollToCard={scrollToCard} />
        <HeroStats />
      </div>
    </div>
  );
}
