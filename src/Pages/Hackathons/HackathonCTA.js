import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, UserPlus, X, Rocket } from "lucide-react";

import useReducedMotion from "../../hooks/useReducedMotion.js";
const HackathonCTA = () => {
  const prefersReducedMotion = useReducedMotion();
  const [showModal, setShowModal] = useState(false);

  // Floating orbs
  const orbs = [
    { size: 180, top: "-10%", left: "-8%",  color: "bg-blue-300/40 dark:bg-blue-600/20",   delay: 0 },
    { size: 140, top: "60%",  left: "75%",  color: "bg-violet-300/40 dark:bg-violet-600/20", delay: 1.5 },
    { size: 100, top: "30%",  left: "50%",  color: "bg-indigo-200/50 dark:bg-indigo-500/10", delay: 3 },
    { size: 80,  top: "80%",  left: "20%",  color: "bg-cyan-300/40 dark:bg-cyan-500/10",   delay: 2 },
  ];

  return (
    <>
      <section
        className="relative mx-6 sm:mx-8 my-10 py-16 sm:py-20 px-6 sm:px-12 rounded-3xl overflow-hidden
          bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 dark:from-slate-950 dark:via-indigo-950/80 dark:to-slate-950
          border border-indigo-100 dark:border-white/10
          shadow-[0_8px_30px_rgba(99,102,241,0.08)] dark:shadow-[0_0_80px_rgba(99,102,241,0.15)]
          text-center transition-colors duration-300"
        data-aos="zoom-in"
        data-aos-duration="1000"
      >
        {/* Animated mesh blobs */}
        {orbs.map((orb, idx) => (
          <motion.div
            key={idx}
            className={`absolute rounded-full ${orb.color} blur-2xl dark:blur-3xl pointer-events-none`}
            style={{ width: orb.size, height: orb.size, top: orb.top, left: orb.left }}
            animate={{ y: [0, -20, 0], x: [0, 12, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: prefersReducedMotion ? 0 : 8 + idx * 2, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
          />
        ))}

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
            className="inline-flex items-center gap-2 mb-6 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-600 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300 dark:shadow-[0_0_20px_rgba(99,102,241,0.2)] backdrop-blur-sm"
          >
            <Rocket className="w-3 h-3" />
            Build · Compete · Win
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.1 }}
          >
            Join Our{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              Hackathon Community
            </span>
          </motion.h2>

          <motion.p
            className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: 0.2 }}
          >
            Participate in exciting hackathons, showcase your skills, and connect
            with innovators around the world.
          </motion.p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.a
              href="/hackathons"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg dark:shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:shadow-xl dark:hover:shadow-[0_0_36px_rgba(99,102,241,0.6)] transition-all duration-300 border border-indigo-500/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Hackathons <ArrowRight className="w-5 h-5" />
            </motion.a>

            <motion.button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200 font-semibold px-8 py-3.5 rounded-xl border border-slate-200 dark:border-white/20 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:border-indigo-300 dark:hover:border-indigo-400/50 shadow-sm dark:shadow-none backdrop-blur-sm transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserPlus className="w-5 h-5 text-indigo-600 dark:text-slate-200" /> Register
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-8 w-full max-w-md text-center shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_0_60px_rgba(99,102,241,0.2)]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() = aria-label="button"> setShowModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500 dark:text-slate-300" />
              </button>

              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-[0_8px_16px_rgba(99,102,241,0.25)] dark:shadow-[0_0_24px_rgba(99,102,241,0.4)]">
                <UserPlus className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Register for Hackathon</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                To register, please select a hackathon from the cards displayed above and click the{" "}
                <strong className="text-indigo-600 dark:text-indigo-300">Register</strong> button on the card.
              </p>

              <button
                className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-sm shadow-md hover:shadow-lg dark:shadow-none dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
                onClick={() = aria-label="button"> setShowModal(false)}
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HackathonCTA;
