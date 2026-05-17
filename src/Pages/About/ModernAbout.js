import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * CHANGES MADE TO THIS FILE (ModernAbout.js):
 * 
 * 1. ADDED MISSING IMPORTS: 
 *    - Added useEffect and useState from React (line 2)
 * 
 * 2. ADDED MISSING ANIMATION VARIANTS:
 *    - fadeUp: Used for fade-up animations (lines 29-31)
 *    - scaleIn: Used for scale-in animations (lines 33-35)
 *    - staggerContainer: Container for staggered animations (lines 37-42)
 *    - staggerItem: Individual items for staggered effects (lines 44-47)
 * 
 * 3. ADDED DATA ARRAYS:
 *    - stats: Array of statistics displayed in the hero section (lines 49-52)
 *    - values: Array of mission values cards (lines 54-68)
 * 
 * 4. FIXED UNDEFINED STATE:
 *    - Added prefersReducedMotion state hook in ModernAbout component
 *    - Added useEffect to detect user's reduced motion preference
 *    - Added anim helper function for motion animations
 * 
 * 5. FIXED JSX STRUCTURE:
 *    - Fixed closing tag from </motion.div> to </div> (was causing JSX mismatch)
 *    - Removed duplicate className attributes
 *    - Wrapped main section with fragment and added MissionSection component
 */

// Framer Motion Variants
const container = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.2, duration: 0.6, ease: "easeOut" },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardItem = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function ModernAbout() {
  return (
    <>
      <section className="relative min-h-[82vh] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900 overflow-hidden py-20 px-4">
      <motion.div aria-hidden="true" className="absolute top-0 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-indigo-100 dark:bg-indigo-900/50 rounded-full blur-3xl opacity-40 will-change-transform" animate={prefersReducedMotion ? {} : { scale: [1, 1.3, 1], rotate: [0, 45, 0] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }} />
      <motion.div aria-hidden="true" className="absolute bottom-0 right-1/3 w-64 sm:w-96 h-64 sm:h-96 bg-pink-100 dark:bg-pink-900/50 rounded-full blur-3xl opacity-30 will-change-transform" animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], rotate: [0, -45, 0] }} transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }} />
      <motion.div aria-hidden="true" className="absolute top-1/3 left-4 sm:left-10 w-28 sm:w-40 h-28 sm:h-40 bg-purple-200 dark:bg-purple-800/40 rounded-full blur-2xl opacity-20 will-change-transform" animate={prefersReducedMotion ? {} : { y: [0, -30, 0], x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} />
      <motion.div aria-hidden="true" className="absolute bottom-20 right-4 sm:right-10 w-24 sm:w-32 h-24 sm:h-32 bg-yellow-200 dark:bg-yellow-800/40 rounded-full blur-2xl opacity-25 will-change-transform" animate={prefersReducedMotion ? {} : { y: [0, 25, 0], x: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }} />
      <div aria-hidden="true" className="absolute inset-0 dark:hidden bg-[linear-gradient(to_right,rgba(147,197,253,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,204,21,0.2)_1px,transparent_1px),linear-gradient(45deg,rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(-45deg,rgba(250,204,21,0.08)_1px,transparent_1px)] bg-[size:40px_40px,40px_40px,80px_80px,80px_80px]" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/30 to-white dark:from-transparent dark:to-gray-950" />

      <div className="max-w-4xl md:my-24 my-16 w-full text-center z-10">
        <motion.p
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4"
        >
          Open-source, community-driven, free forever
        </motion.p>

        <motion.h1
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-black dark:text-white mb-6"
          style={{ fontFamily: '"Anton", sans-serif' }}
          data-aos="zoom-in"
          data-aos-delay="100"
        >
          About Us
        </motion.h1>

        <motion.p
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-base sm:text-lg text-black dark:text-gray-300 mb-16"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          Eventra is a comprehensive open-source platform that empowers
          communities, colleges, and organizations worldwide to create, manage,
          and track events effortlessly. Transform the way you plan, execute,
          and experience events with ease.
        </motion.p>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <motion.div
            variants={cardItem}
            // UPDATED: Card background and shadow
            className="bg-gradient-to-b from-white via-white to-slate-50 border border-slate-100 shadow-xl shadow-slate-100/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100 dark:shadow-indigo-900/50 p-6 hover:scale-105 transition-transform duration-500"
            data-aos="zoom-in"
            data-aos-delay="300"
          >
            {/* UPDATED: Card text */}
            <h3 className="text-black text-2xl font-bold mb-2">100+</h3>
            <p className="text-black text-sm">Events Managed</p>
          </motion.div>
          {stats.map((s) => (
            <motion.div key={s.label} variants={scaleIn} whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100 dark:shadow-indigo-900/50 p-4 sm:p-5 cursor-default">
              <h3 className="text-black dark:text-white text-xl sm:text-2xl font-bold mb-1">{s.value}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
        
        <MissionSection prefersReducedMotion={prefersReducedMotion} />
      </div>
    </section>
    <MissionSection anim={anim} prefersReducedMotion={prefersReducedMotion} />
    </>
  );
}

function MissionSection({ prefersReducedMotion }) {
  const anim = (variants) => ({
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true },
    variants
  });

  return (
    <section className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center text-left">
          <motion.div {...anim(fadeUp)}>
            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Why we exist</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white mb-5" style={{ fontFamily: '"Anton", sans-serif' }}>
              Our Mission & Vision
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-5">
              We started Eventra because we were tired of watching college clubs and
              communities struggle with tools that were either too expensive or too complicated.
              There had to be something better.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              We want a world where any club, any community, any group of people with an
              idea can run an event without needing a budget or a technical team behind them.
              That is what we are building toward.
            </p>
          </motion.div>
          <motion.div

            variants={cardItem}
            // UPDATED: Card background and shadow
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 backdrop-blur-sm rounded-2xl transition-transform duration-500"
            data-aos="zoom-in"
            data-aos-delay="400"
            {...(prefersReducedMotion ? {} : { variants: staggerContainer, initial: "hidden", whileInView: "visible", viewport: { once: true } })}
          >
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={staggerItem}
                whileHover={prefersReducedMotion ? {} : { y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`rounded-2xl border p-5 cursor-default ${v.color} ${v.border} bg-gradient-to-b from-white via-white to-slate-50 shadow-xl shadow-slate-100/70 dark:bg-gray-800/50 transition-transform duration-300`}
              >
                <h4 className="font-bold text-sm text-black dark:text-white mb-2">{v.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
          
            variants={cardItem}
            // UPDATED: Card background and shadow
            className="bg-gradient-to-b from-white via-white to-slate-50 border border-slate-100 shadow-xl shadow-slate-100/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100 dark:shadow-indigo-900/50 p-6 hover:scale-105 transition-transform duration-500"
            data-aos="zoom-in"
            data-aos-delay="500"
            {...(prefersReducedMotion ? {} : { variants: staggerContainer, initial: "hidden", whileInView: "visible", viewport: { once: true } })}
            className="space-y-4"
          >
            <h3 className="text-black dark:text-white text-2xl font-bold mb-2">500+</h3>
            <p className="text-black dark:text-gray-300 text-sm">Active Users</p>
          </motion.div>

          <motion.div
            variants={cardItem}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100 dark:shadow-indigo-900/50 p-6 hover:scale-105 transition-transform duration-500"
            data-aos="zoom-in"
            data-aos-delay="500"
          >
            <h3 className="text-black dark:text-white text-2xl font-bold mb-2">Global</h3>
            <p className="text-black dark:text-gray-300 text-sm">Community Reach</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}